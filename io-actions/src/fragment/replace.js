const fetch = require('node-fetch');
const { odinReferences, odinPath } = require('./paths.js');
const DICTIONARY_ID_PATH = 'dictionary/index';
const PH_REGEXP = /{{(\s*([\w\-]+)\s*)}}/gi;

const getDictionaryId = async ({ surface, locale }) => {
    try {
        const response = await fetch(
            odinPath(surface, locale, DICTIONARY_ID_PATH),
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
            Object.keys(raw.references).forEach((id) => {
                const ref = raw.references[id]?.value?.fields;
                if (ref?.key) {
                    //we just test truthy keys as we can have empty placeholders
                    //(treated different from absent ones)
                    dictionary[ref.key] = ref.value || '';
                }
            });
            return dictionary;
        }
    } catch (e) {
        console.error(e);
    }
    return null;
};

replaceValues = (input, dictionary, calls) => {
    const placeholders = input.matchAll(PH_REGEXP);
    let replaced = '';
    let nextIndex = 0;
    for (const match of placeholders) {
        //match without {{ }}
        const key = match[1];
        //we concatenate everything from last iteration to index of placeholder
        replaced = replaced + input.slice(nextIndex, match.index);
        //value will be key in case of undefined or circular reference
        let value =
            dictionary[key] == undefined || calls.includes(key)
                ? key
                : dictionary[key];
        if (value.match(PH_REGEXP)) {
            //the value has nested PH
            calls.push(key);
            value = replaceValues(value, dictionary, calls);
            calls.pop();
        }
        //we concatenate value
        replaced = replaced + value;
        //and update index for next iteration
        nextIndex = match.index + match[0].length;
    }
    replaced = replaced + input.slice(nextIndex);
    return replaced;
};

async function replace(context) {
    const { body } = context;
    let fieldsString = JSON.stringify(body.fields);
    if (fieldsString.match(PH_REGEXP)) {
        const dictionary = await getDictionary(context);
        if (dictionary && Object.keys(dictionary).length > 0) {
            fieldsString = replaceValues(fieldsString, dictionary, []);
            body.fields = JSON.parse(fieldsString);
        }
    }
    return {
        ...context,
        status: 200,
        body,
    };
}
exports.replace = replace;
