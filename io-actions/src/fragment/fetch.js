const fetch = require('node-fetch');

async function main({ id, locale }) {
    if (id) {
        const response = await fetch(
            `https://odin.adobe.com/adobe/sites/fragments/${id}`,
        );
        const body = await response.json();
        return {
            status: 200,
            body,
            locale,
        };
    }
    return {
        status: 400,
    };
}

exports.main = main;
