import { html, LitElement, nothing } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import '../fields/multifield.js';
import '../fields/mnemonic-field.js';
import '../aem/aem-tag-picker-field.js';
import './variant-picker.js';
import { SPECTRUM_COLORS } from '../utils/spectrum-colors.js';
import '../rte/osi-field.js';

const MODEL_PATH = '/conf/mas/settings/dam/cfm/models/card';

const merchCardCustomElementPromise = customElements.whenDefined('merch-card');

const QUANTITY_MODEL = 'quantitySelect';

class MerchCardEditor extends LitElement {
    static properties = {
        fragment: { type: Object, attribute: false },
        fragmentStore: { type: Object, attribute: false },
        updateFragment: { type: Function },
        wide: { type: Boolean, state: true },
        superWide: { type: Boolean, state: true },
        availableSizes: { type: Array, state: true },
        availableColors: { type: Array, state: true },
        availableBorderColors: { type: Array, state: true },
        availableBackgroundColors: { type: Array, state: true },
        quantitySelectorValues: { type: String, state: true },
    };

    constructor() {
        super();
        this.updateFragment = null;
        this.wide = false;
        this.superWide = false;
        this.availableSizes = [];
        this.availableColors = [];
        this.availableBorderColors = [];
        this.availableBackgroundColors = [];
        this.quantitySelectorValues = '';
    }

    createRenderRoot() {
        return this;
    }

    connectedCallback() {
        super.connectedCallback();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
    }

    get mnemonics() {
        if (!this.fragment) return [];

        const mnemonicIcon =
            this.fragment.fields.find((f) => f.name === 'mnemonicIcon')
                ?.values ?? [];
        const mnemonicAlt =
            this.fragment.fields.find((f) => f.name === 'mnemonicAlt')
                ?.values ?? [];
        const mnemonicLink =
            this.fragment.fields.find((f) => f.name === 'mnemonicLink')
                ?.values ?? [];
        return (
            mnemonicIcon?.map((icon, index) => ({
                icon,
                alt: mnemonicAlt[index] ?? '',
                link: mnemonicLink[index] ?? '',
            })) ?? []
        );
    }

    get quantityValue() {
        return this.fragmentQuantityValue || this.quantitySelectorValues || '';
    }

    get fragmentQuantityValue() {
        return this.fragment?.fields.find((f) => f.name === QUANTITY_MODEL)?.values[0] || '';
    }

    getQuantityAttribute(name) {
        if (!this.quantityValue) return undefined;

        const parser = new DOMParser();
        const doc = parser.parseFromString(this.quantityValue, 'text/html');
        const element = doc.querySelector('merch-quantity-select');
        return element?.getAttribute(name);
    }

    get quantityTitle() {
        return this.getQuantityAttribute('title') ?? '';
    }

    get quantityStart() {
        return this.getQuantityAttribute('min') ?? 1;
    }

    get quantityStep() {
        return this.getQuantityAttribute('step') ?? 1;
    }

    get quantitySelectorDisplayed() {
        return !!this.fragmentQuantityValue.trim();
    }

    createQsElement(min, step, title) {
        const el = document.createElement('merch-quantity-select');
        el.setAttribute('title', title);
        el.setAttribute('min', min);
        el.setAttribute('max', '10');
        el.setAttribute('step', step);
        return el;
    }

    #updateQuantityValues(event) {
        const vals = [this.quantityStart, this.quantityStep, this.quantityTitle];
        if (event.target.dataset.field === 'startQuantity') {
            vals[0] = event.target.value;
        } else if (event.target.dataset.field === 'stepQuantity') {
            vals[1] = event.target.value;
        } else if (event.target.dataset.field === 'titleQuantity') {
            vals[2] = event.target.value;
        }

        const html = this.createQsElement(vals[0], vals[1], vals[2]).outerHTML;
        this.fragmentStore.updateField(QUANTITY_MODEL, [html]);
        this.quantitySelectorValues = html;
    }

    #showQuantityFields = (e) => {
        this.showQuantityFields(e.target.checked);

        let html = '';
        if (e.target.checked) {
            html = this.createQsElement(this.quantityStart, this.quantityStep, this.quantityTitle).outerHTML;
        } else {
            const qsValues = this.fragmentStore.get().getField(QUANTITY_MODEL)?.values;
            this.quantitySelectorValues = qsValues?.length ? qsValues[0] : '';
        }
        const fragment = this.fragmentStore.get();
        fragment.updateField(QUANTITY_MODEL, [html]);
        this.fragmentStore.set(fragment);
    }

    showQuantityFields(show) {
        const element = this.querySelector('#quantitySelector');
        if (element) element.style.display = show ? 'block' : 'none';
    }

    updated(changedProperties) {
        super.updated(changedProperties);
        if (changedProperties.has('fragment')) {
            this.#updateAvailableSizes();
            this.#updateAvailableColors();
            this.#updateBackgroundColors();
            this.toggleFields();
        }
    }

    async toggleFields() {
        if (!this.fragment) return;
        const merchCardCustomElement = await merchCardCustomElementPromise;
        if (!merchCardCustomElement) return;
        this.querySelectorAll('sp-field-group.toggle').forEach((field) => {
            field.style.display = 'none';
        });
        const variant = merchCardCustomElement.getFragmentMapping(
            this.fragment.variant,
        );
        if (!variant) return;
        Object.entries(variant).forEach(([key, value]) => {
            if (Array.isArray(value) && value.length === 0) return;
            const field = this.querySelector(`sp-field-group.toggle#${key}`);
            if (field) field.style.display = 'block';
        });
        this.wide = variant.size?.includes('wide');
        this.superWide = variant.size?.includes('super-wide');
        this.showQuantityFields(this.quantitySelectorDisplayed);
        if (variant.borderColor) {
            const borderField = this.querySelector(
                'sp-field-group.toggle#border-color',
            );
            if (borderField) borderField.style.display = 'block';
            this.availableBorderColors =
                variant.allowedBorderColors || SPECTRUM_COLORS;
        } else {
            this.availableBorderColors = [];
        }
        this.availableColors = variant?.allowedColors || [];
    }

    render() {
        if (!this.fragment) return nothing;
        if (this.fragment.model.path !== MODEL_PATH) return nothing;

        const form = Object.fromEntries([
            ...this.fragment.fields.map((f) => [f.name, f]),
        ]);
        return html`
            <sp-field-group id="variant">
                <sp-field-label for="card-variant">Variant</sp-field-label>
                <variant-picker
                    id="card-variant"
                    ?show-all="false"
                    data-field="variant"
                    default-value="${form.variant.values[0]}"
                    @change="${this.#handleVariantChange}"
                ></variant-picker>
            </sp-field-group>
            <sp-field-group class="toggle" id="size">
                <sp-field-label for="card-size">Size</sp-field-label>
                <sp-picker
                    id="card-size"
                    data-field="size"
                    value="${form.size.values[0] || 'Default'}"
                    data-default-value="Default"
                    @change="${this.updateFragment}"
                >
                    ${(this.availableSizes || []).map(
                        (size) => html`
                            <sp-menu-item value="${size}"
                                >${this.#formatName(size)}</sp-menu-item
                            >
                        `,
                    )}
                </sp-picker>
            </sp-field-group>
            <sp-field-group class="toggle" id="title">
                <sp-field-label for="card-title">Title</sp-field-label>
                <sp-textfield
                    placeholder="Enter card title"
                    id="card-title"
                    data-field="cardTitle"
                    value="${form.cardTitle.values[0]}"
                    @input="${this.updateFragment}"
                ></sp-textfield>
            </sp-field-group>
            <sp-field-group class="toggle" id="subtitle">
                <sp-field-label for="card-subtitle">Subtitle</sp-field-label>
                <sp-textfield
                    placeholder="Enter card subtitle"
                    id="card-subtitle"
                    data-field="subtitle"
                    value="${form.subtitle.values[0]}"
                    @input="${this.updateFragment}"
                ></sp-textfield>
            </sp-field-group>
            <sp-field-group class="toggle" id="badge">
                <sp-field-label for="card-badge">Badge</sp-field-label>
                <sp-textfield
                    placeholder="Enter badge text"
                    id="card-badge"
                    data-field="badge"
                    value="${form.badge.values[0]}"
                    @input="${this.updateFragment}"
                ></sp-textfield>
            </sp-field-group>
            <sp-field-group class="toggle" id="mnemonics">
                <sp-field-label for="mnemonics">Mnemonics</sp-field-label>
                <mas-multifield
                    id="mnemonics"
                    .value="${this.mnemonics}"
                    @change="${this.#updateMnemonics}"
                    @input="${this.#updateMnemonics}"
                >
                    <template>
                        <mas-mnemonic-field></mas-mnemonic-field>
                    </template>
                </mas-multifield>
            </sp-field-group>
            ${this.#renderColorPicker(
                'border-color',
                'Border Color',
                this.availableBorderColors,
                form.borderColor?.values[0],
                'borderColor',
            )}
            ${this.#backgroundColorSelection(
                this.availableBackgroundColors,
                form.backgroundColor?.values[0],
                'backgroundColor',
            )}
            <sp-field-group class="toggle" id="backgroundImage">
                <sp-field-label for="background-image"
                    >Background Image</sp-field-label
                >
                <sp-textfield
                    placeholder="Enter background image URL"
                    id="background-image"
                    data-field="backgroundImage"
                    value="${form.backgroundImage.values[0]}"
                    @input="${this.updateFragment}"
                ></sp-textfield>
                <sp-field-label for="background-image-alt-text"
                    >Background Image Alt Text</sp-field-label
                >
                <sp-textfield
                    placeholder="Enter background image Alt Text"
                    id="background-image-alt-text"
                    data-field="backgroundImageAltText"
                    value="${form.backgroundImageAltText.values[0]}"
                    @input="${this.updateFragment}"
                ></sp-textfield>
            </sp-field-group>
            <sp-field-group class="toggle" id="prices">
                <sp-field-label for="prices">Prices</sp-field-label>
                <rte-field
                    id="prices"
                    inline
                    link
                    data-field="prices"
                    default-link-style="primary-outline"
                    @change="${this.updateFragment}"
                    >${unsafeHTML(form.prices.values[0])}</rte-field
                >
            </sp-field-group>
            <sp-field-group id="promoCode">
                <sp-field-label for="promo-code">Promo Code</sp-field-label>
                <sp-textfield
                    placeholder="Enter promo code"
                    id="promo-code"
                    data-field="promoCode"
                    value="${form.promoCode?.values[0]}"
                    @input="${this.updateFragment}"
                    ?disabled=${this.disabled}
                ></sp-textfield>
            </sp-field-group>
            <sp-field-group class="toggle" id="promoText">
                <sp-field-label for="promo-text">Promo Text</sp-field-label>
                <sp-textfield
                    placeholder="Enter promo text"
                    id="promo-text"
                    data-field="promoText"
                    value="${form.promoText?.values[0]}"
                    @input="${this.updateFragment}"
                    ?disabled=${this.disabled}
                ></sp-textfield>
            </sp-field-group>
            <sp-field-group class="toggle" id="description">
                <sp-field-label for="description">Description</sp-field-label>
                <rte-field
                    id="description"
                    link
                    upt-link
                    data-field="description"
                    default-link-style="secondary-link"
                    @change="${this.updateFragment}"
                    >${unsafeHTML(form.description.values[0])}</rte-field
                >
            </sp-field-group>
            <sp-field-group class="toggle" id="callout">
                <sp-field-label for="callout"> Callout text </sp-field-label>
                <rte-field
                    id="callout"
                    link
                    icon
                    data-field="callout"
                    default-link-style="secondary-link"
                    @change="${this.updateFragment}"
                    ?readonly=${this.disabled}
                    >${unsafeHTML(form.callout?.values[0])}</rte-field
                >
            </sp-field-group>
            <sp-field-group class="toggle" id="stockOffer">
                <sp-checkbox
                    size="m"
                    data-field="showStockCheckbox"
                    value="${form.showStockCheckbox?.values[0]}"
                    .checked="${form.showStockCheckbox?.values[0]}"
                    @change="${this.updateFragment}"
                    ?disabled=${this.disabled}
                    >Stock Checkbox</sp-checkbox
                >
            </sp-field-group>
            <sp-field-group class="toggle" id="quantitySelect">
                <sp-checkbox
                    size="m"
                    value="${this.quantitySelectorDisplayed}"
                    .checked="${this.quantitySelectorDisplayed}"
                    @change="${this.#showQuantityFields}"
                    ?disabled=${this.disabled}
                    >Show Quantity selector</sp-checkbox
                >
                <sp-field-group id="quantitySelector">
                    <sp-field-label for="title-quantity">Quantity selector title</sp-field-label>
                    <sp-textfield
                        id="title-quantity"
                        data-field="titleQuantity"
                        value="${this.quantityTitle}"
                        @input="${this.#updateQuantityValues}"
                        ?disabled=${this.disabled}
                        ></sp-textfield>                
                    <sp-field-label for="start-quantity">Start quantity</sp-field-label>
                    <sp-textfield
                        id="start-quantity"
                        data-field="startQuantity"
                        pattern="[0-9]*"
                        value="${this.quantityStart}"
                        @input="${this.#updateQuantityValues}"
                        ?disabled=${this.disabled}
                        ><sp-help-text slot="negative-help-text">Numeric values only</sp-help-text></sp-textfield>
                    <sp-field-label for="step-quantity">Step</sp-field-label>
                    <sp-textfield
                        id="step-quantity"
                        data-field="stepQuantity"
                        pattern="[0-9]*"
                        value="${this.quantityStep}"
                        @input="${this.#updateQuantityValues}"
                        ?disabled=${this.disabled}
                        ><sp-help-text slot="negative-help-text">Numeric values only</sp-help-text></sp-textfield>
                </sp-field-group>
            </sp-field-group>
            <sp-field-group class="toggle" id="ctas">
                <sp-field-label for="ctas">Footer</sp-field-label>
                <rte-field
                    id="ctas"
                    link
                    inline
                    data-field="ctas"
                    default-link-style="primary-outline"
                    @change="${this.updateFragment}"
                    >${unsafeHTML(form.ctas.values[0])}</rte-field
                >
            </sp-field-group>
            <sp-field-group>
                <sp-field-label for="osi">OSI Search</sp-field-label>
                <osi-field
                    id="osi"
                    data-field="osi"
                    .value=${form.osi.values[0]}
                    @input="${this.updateFragment}"
                    @change="${this.updateFragment}"
                ></osi-field>
            </sp-field-group>
            <aem-tag-picker-field
                label="Tags"
                namespace="/content/cq:tags/mas"
                multiple
                value="${this.fragment.tags.map((tag) => tag.id).join(',')}"
                @change=${this.#handeTagsChange}
            ></aem-tag-picker-field>
        `;
    }

    #handleVariantChange(e) {
        this.updateFragment(e);
        this.#updateAvailableSizes();
        this.#updateAvailableColors();
        this.#updateBackgroundColors();
        this.toggleFields();
    }

    #handeTagsChange(e) {
        const value = e.target.getAttribute('value');
        const newTags = value ? value.split(',') : []; // do not overwrite the tags array
        this.fragmentStore.updateField('tags', newTags);
    }

    #updateMnemonics(event) {
        const mnemonicIcon = [];
        const mnemonicAlt = [];
        const mnemonicLink = [];
        event.target.value.forEach(({ icon, alt, link }) => {
            mnemonicIcon.push(icon ?? '');
            mnemonicAlt.push(alt ?? '');
            mnemonicLink.push(link ?? '');
        });
        const fragment = this.fragmentStore.get();
        fragment.updateField('mnemonicIcon', mnemonicIcon);
        fragment.updateField('mnemonicAlt', mnemonicAlt);
        fragment.updateField('mnemonicLink', mnemonicLink);
        this.fragmentStore.set(fragment);
    }

    #formatName(name) {
        return name
            .split('-')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    async #updateAvailableSizes() {
        if (!this.fragment) return;
        const merchCardCustomElement = await merchCardCustomElementPromise;
        const variant = merchCardCustomElement?.getFragmentMapping(
            this.fragment.variant,
        );
        this.availableSizes = ['Default', ...(variant?.size || ['Default'])];
    }

    async #updateAvailableColors() {
        if (!this.fragment) return;
        const merchCardCustomElement = await merchCardCustomElementPromise;
        const variant = merchCardCustomElement?.getFragmentMapping(
            this.fragment.variant,
        );
        this.availableColors = variant?.allowedColors || [];
    }

    async #updateBackgroundColors() {
        if (!this.fragment) return;
        const merchCardCustomElement = await merchCardCustomElementPromise;
        const variant = merchCardCustomElement?.getFragmentMapping(
            this.fragment.variant,
        );
        this.availableBackgroundColors = {
            Default: undefined,
            ...variant.allowedColors,
        };
    }

    #formatColorName(color) {
        return color
            .replace(/(spectrum|global|color|-)/gi, ' ')
            .replace(/\b\w/g, (l) => l.toUpperCase())
            .replace(/\s+/g, ' ')
            .trim();
    }

    #renderColorPicker(id, label, colors, selectedValue, dataField) {
        const isBackground = dataField === 'backgroundColor';
        const options = isBackground
            ? ['Default', ...colors]
            : dataField === 'borderColor'
              ? ['', ...colors]
              : colors;

        return html`
            <sp-field-group class="toggle" id="${id}">
                <sp-field-label for="${id}">${label}</sp-field-label>
                <sp-picker
                    id="${id}"
                    data-field="${dataField}"
                    value="${selectedValue || (isBackground ? 'Default' : '')}"
                    data-default-value="${isBackground ? 'Default' : ''}"
                    @change="${this.updateFragment}"
                >
                    ${options.map(
                        (color) => html`
                            <sp-menu-item value="${color}">
                                <div
                                    style="display: flex; align-items: center; gap: 8px;"
                                >
                                    ${color
                                        ? html`
                                              ${!isBackground
                                                  ? html`
                                                        <div
                                                            style="
                                            width: 16px;
                                            height: 16px;
                                            background: var(--${color});
                                            border: 1px solid var(--spectrum-global-color-gray-300);
                                            border-radius: 3px;
                                        "
                                                        ></div>
                                                    `
                                                  : nothing}
                                              <span
                                                  >${isBackground
                                                      ? this.#formatName(color)
                                                      : this.#formatColorName(
                                                            color,
                                                        )}</span
                                              >
                                          `
                                        : html`
                                              <span
                                                  >${isBackground
                                                      ? 'Default'
                                                      : 'Transparent'}</span
                                              >
                                          `}
                                </div>
                            </sp-menu-item>
                        `,
                    )}
                </sp-picker>
            </sp-field-group>
        `;
    }

    #backgroundColorSelection(colors, selectedValue, dataField) {
        const options = { Default: undefined, ...colors };
        return html`
            <sp-field-group class="toggle" id="backgroundColor">
                <sp-field-label for="backgroundColor"
                    >Background Color</sp-field-label
                >
                <sp-picker
                    id="backgroundColor"
                    data-field="${dataField}"
                    value="${selectedValue || 'Default'}"
                    data-default-value="${selectedValue || 'Default'}"
                    @change="${this.updateFragment}"
                >
                    ${Object.entries(options)
                        .sort(([a], [b]) =>
                            a === 'Default' ? -1 : b === 'Default' ? 1 : 0,
                        )
                        .map(
                            ([colorName, colorValue]) => html`
                                <sp-menu-item value="${colorName}">
                                    <div
                                        style="display: flex; align-items: center; gap: 8px;"
                                    >
                                        ${colorName === 'Default'
                                            ? html`<span>Default</span>`
                                            : html`
                                                  <div
                                                      style="
                                            width: 16px;
                                            height: 16px;
                                            background: ${colorValue};
                                            border: 1px solid var(--spectrum-global-color-gray-300);
                                            border-radius: 3px;
                                        "
                                                  ></div>
                                                  <span>${colorName}</span>
                                              `}
                                    </div>
                                </sp-menu-item>
                            `,
                        )}
                </sp-picker>
            </sp-field-group>
        `;
    }
}

customElements.define('merch-card-editor', MerchCardEditor);
