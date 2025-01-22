const fetch = require('node-fetch');
const { odinReferences, odinPath } = require('./paths.js');
const DICTIONARY_ID_PATH = 'dictionary/index';
const PH_REGEXP = /{{(\s*([\w\-]+)\s*)}}/gi;

const getDictionaryId = async ({ surface, parsedLocale }) => {
    try {
        const response = await fetch(
            odinPath(surface, parsedLocale, DICTIONARY_ID_PATH),
        );
        if (response.status == 200) {
            const raw = await response.json();
            return raw.id;
        }
    } catch (e) {
        console.error(e);
    }
    return null;
};

const getDictionary = async (context) => {
    try {
        const id = await getDictionaryId(context);
        if (!id) {
            return null;
        }
        const response = await fetch(odinReferences(id, true));

        if (response.status == 200) {
            const raw = await response.json();
            const dictionary = {};
            for (let i = 0; i < raw.fields.key.length; i++) {
                dictionary[raw.fields.key[i]] = raw.fields.value[i];
            }
            return dictionary;
        }
    } catch (e) {
        console.error(e);
    }
    return null;
};

replaceValues = (input, dictionary, calls) => {
    const placeholders = input.matchAll(PH_REGEXP);
    let replaced = input;
    placeholders.forEach((match) => {
        const key = match.groups[1];
        //value will be key in case of undefined or circular reference
        const value =
            !dictionary[key] || calls.includes(key) ? key : dictionary[key];
        if (value.test(PH_REGEXP)) {
            calls.push(key);
            value = replaceValues(value, dictionary, calls);
        }
    });
    return replaced;
};

async function replace(context) {
    const bodyString = JSON.stringify(context.body);
    const dictionary = getDictionary(context);
    const placeholders = bodyString.matchAll(PH_REGEXP);
    let replaced;
    placeholders.forEach((match) => {
        const value = computeValue(match.groups[1], dictionary, new Stack());
        if (value) {
            body = body.replace(match, value);
        }
    });
    return {
        statusCode: 200,
        body: JSON.parse(body),
    };
}
exports.replace = replace;
