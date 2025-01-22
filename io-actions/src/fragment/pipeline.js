const fetchFragment = require('./fetch.js').fetchFragment;
const translate = require('./translate.js').translate;

async function main(params) {
    let context = await fetchFragment(params);
    if (context.status == 200) {
        context = await translate(context);
    }
    returnValue = {
        status: context.status,
    };
    if (context.status == 200) {
        returnValue.body = context.body;
    } else {
        returnValue.message = context.message;
    }
    return returnValue;
}

exports.main = main;
