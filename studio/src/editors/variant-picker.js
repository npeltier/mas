import { html } from 'lit';

//TODO make that feed (excepts ALL maybe) dynamically served from milo
const VARIANTS = [
    { label: 'All', value: 'all', surface: 'all' },
    { label: 'Catalog', value: 'catalog', surface: 'acom' },
    { label: 'CCD Action', value: 'ccd-action', surface: 'ccd' },
    { label: 'Slice', value: 'ccd-slice', surface: 'ccd' },
    { label: 'Special offers', value: 'special-offers', surface: 'acom' },
];

const renderVariants = () => {
    return VARIANTS.map(
        (variant) =>
            html`<sp-menu-item value="${variant.value}"
                >${variant.label}</sp-menu-item
            >`,
    );
};

export const renderVariantPicker = (value, handler, id) => {
    return html`<sp-picker
        id="${id || 'card-variant'}"
        label="Card Variant"
        size="m"
        value=${value}
        @change="${handler}"
    >
        ${renderVariants()}
    </sp-picker>`;
};
