async function main(params) {
    if (
        params?.__ow_headers?.['If-Modified-Since'] ||
        params?.__ow_headers?.['if-modified-since']
    ) {
        return {
            statusCode: 304,
            headers: {
                'Content-Type': 'application/json',
                'Last-Modified': 'Mon, 08 Jan 2024 12:34:58 GMT',
            },
            body: '',
        };
    }
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
            'Last-Modified': 'Mon, 08 Jan 2024 12:34:58 GMT',
        },
        body: '{"resolvedOffers":[]}',
    };
}

exports.main = main;
