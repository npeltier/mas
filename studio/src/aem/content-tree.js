import { html, LitElement } from 'lit';

class ContentTree extends LitElement {
    static get properties() {
        return {
            items: { type: Array },
        };
    }

    constructor() {
        super();
        this.items = [];
    }

    render() {
        return html`
            <nav>
                <ul>
                    ${this.items.map(
                        (item) => html`
                            <li>
                                <a href="${item.url}">${item.title}</a>
                            </li>
                        `,
                    )}
                </ul>
            </nav>
        `;
    }
}

customElements.define('content-tree', ContentTree);
