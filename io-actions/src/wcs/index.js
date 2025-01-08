async function main(params) {
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
            'Last-Modified': 'Mon, 08 Jan 2024 12:34:56 GMT',
        },
        body: '{"resolvedOffers":[]}',
    };
}

exports.main = main;
