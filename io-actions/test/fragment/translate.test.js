jest.mock('node-fetch');
const fetch = require('node-fetch');
const action = require('./../../src/fragment/translate.js');

mockResponse = (input) => {
    const response = {
        ok: true,
        json: () => Promise.resolve(input),
    };
    fetch.mockResolvedValueOnce(response);
};

describe('translate typical cases', () => {
    test('should return translated fragment', async () => {
        mockResponse({
            path: '/content/dam/mas/nico/fr_FR/someFragment',
            some: 'corps',
        });
        expect(
            await action.main({
                status: 200,
                body: {
                    path: '/content/dam/mas/nico/en_US/someFragment',
                    some: 'body',
                },
                locale: 'fr_FR',
            }),
        ).toEqual({
            status: 200,
            body: {
                path: '/content/dam/mas/nico/fr_FR/someFragment',
                some: 'corps',
            },
        });
    });
});

describe('translate corner cases', () => {
    test('main should be defined', () => {
        expect(action.main).toBeInstanceOf(Function);
    });

    test('no arguments should return 400 ', async () => {
        expect(await action.main({})).toEqual({
            status: 400,
        });
    });

    test('400 entries should return 400', async () => {
        expect(
            await action.main({
                status: 400,
                body: { path: '/content/blah' },
                locale: 'fr_FR',
            }),
        ).toEqual({
            status: 400,
        });
    });

    test('no path should return 400', async () => {
        expect(
            await action.main({ status: 200, body: {}, locale: 'fr_FR' }),
        ).toEqual({
            status: 400,
        });
    });

    test('bad path should return 400', async () => {
        expect(
            await action.main({
                status: 200,
                body: { path: 'something/rather/wrong' },
                locale: 'fr_FR',
            }),
        ).toEqual({
            status: 400,
        });
    });

    test('bad path should return 400', async () => {
        expect(
            await action.main({
                status: 200,
                body: { path: 'something/rather/wrong' },
                locale: 'fr_FR',
            }),
        ).toEqual({
            status: 400,
        });
    });

    test('same locale should return same body', async () => {
        expect(
            await action.main({
                status: 200,
                body: {
                    path: '/content/dam/mas/nico/fr_FR/someFragment',
                    some: 'body',
                },
                locale: 'fr_FR',
            }),
        ).toEqual({
            status: 200,
            body: {
                path: '/content/dam/mas/nico/fr_FR/someFragment',
                some: 'body',
            },
            locale: 'fr_FR',
        });
    });
});
