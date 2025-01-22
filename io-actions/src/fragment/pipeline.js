const fetchFragment = require('./fetch.js').fetchFragment;
const translate = require('./translate.js').translate;
const replace = require('./replace.js').replace;

async function main(params) {
    const sequence = [fetchFragment, translate, replace];
    let context = { ...params, status: 200 };
    sequence.forEach(async (worker) => {
        if (context.status != 200) return;
        context = await worker(context);
    });
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
