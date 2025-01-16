const reduceFields = (obj, field) => {
    const newObj = obj;
    switch (field.type) {
        case 'long-text':
            newObj[field.name] = {
                mimeType: field.mimeType,
            };
            if (field.values.length > 0) {
                newObj[field.name].value = field.values[0];
            }
            break;
        case 'tag':
            newObj[field.name] = field.values;
            break;
        default:
            if (field.multiple) {
                newObj[field.name] = field.values;
                break;
            }
            if (field.values.length > 0) {
                newObj[field.name] = field.values[0];
            }
            break;
    }

    return newObj;
};

async function main({ status, body }) {
    if (status == 200 && body?.items) {
        const firstItem = body?.items?.[0];
        if (firstItem) {
            const body = {
                title: firstItem.title,
                description: firstItem.description,
                id: firstItem.id,
                path: firstItem.path,
                name: firstItem.name || '',
                references:
                    firstItem.references.length > 0 ? firstItem.references : {},
                referencesTree: firstItem.referencesTree || [],
                model: {
                    id: firstItem.model.id,
                },
                fields: firstItem.fields?.reduce(reduceFields, {}),
            };
            return {
                status: 200,
                body,
            };
        }
    }
}

exports.main = main;
