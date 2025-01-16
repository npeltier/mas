const fetch = require('node-fetch');

const PATH_TOKENS =
    /\/content\/dam\/mas\/(?<surface>[\w]+)\/(?<parsedLocale>[\w_]+)\/(?<fragmentPath>.*)/;

/**
 * we expect a body to already have been fetched, and a locale to be requested
 */
async function main({ status, body, locale }) {
    if (!status || status != 200 || !body || !locale) {
        return {
            status: 400,
        };
    }
    const match = body.path?.match(PATH_TOKENS);
    if (!match) {
        return {
            status: 400,
        };
    }
    const { surface, parsedLocale, fragmentPath } = match.groups;
    if (parsedLocale !== locale) {
        const response = await fetch(
            `https://odin.adobe.com/adobe/sites/fragments?path=/content/dam/mas/${surface}/${locale}/${fragmentPath}`,
        );
        const resp = await response.json();
        if (resp?.items?.length == 1) {
            return {
                status: 200,
                body: resp.items[0],
            };
        } else {
            return {
                status: 400,
            };
        }
    }
    return {
        status: 200,
        body,
    };
}

exports.main = main;
