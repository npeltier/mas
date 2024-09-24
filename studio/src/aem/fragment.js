export class Fragment {
    path = '';
    hasChanges = false;
    status = '';

    fields = [];

    selected = false;

    /**
     * @param {*} AEM Fragment JSON object
     * @param {*} eventTarget DOM element to dispatch events from
     */
    constructor(
        { id, model, path, title, status, modified, fields },
        eventTarget,
    ) {
        this.id = id;
        this.model = model;
        this.path = path;
        this.name = path.split('/').pop();
        this.title = title;
        this.status = status;
        this.modified = modified;
        this.fields = fields;
        this.eventTarget = eventTarget;
    }

    get variant() {
        return this.fields.find((field) => field.name === 'variant')
            ?.values?.[0];
    }

    get fragmentName() {
        return this.path.split('/').pop();
    }

    get statusVariant() {
        if (this.hasChanges) return 'yellow';
        return this.status === 'PUBLISHED' ? 'positive' : 'info';
    }

    notify() {
        this.eventTarget.dispatchEvent(
            new CustomEvent('change', { detail: this }),
        );
    }

    toggleSelection(value) {
        if (value !== undefined) this.selected = value;
        else this.selected = !this.selected;
        this.notify();
    }

    updateField(fieldName, value) {
        let change = false;
        this.fields
            .filter((field) => field.name === fieldName)
            .forEach((field) => {
                if (
                    field.values.length === value.length &&
                    field.values.every((v, index) => v === value[index])
                )
                    return;
                field.values = value;
                this.hasChanges = true;
                change = true;
            });
        this.notify();
        return change;
    }
}
