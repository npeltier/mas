const { expect } = require('chai');
const nock = require('nock');
const replace = require('../../src/fragment/replace.js').replace;
const DICTIONARY_RESPONSE = require('./dictionary.json');

const DICTIONARY_CF_RESPONSE = {
    path: '/content/dam/mas/nico/fr_FR/dictionary/index',
    id: 'fr_FR_dictionary',
};

const ODIN_RESPONSE = {
    path: '/content/dam/mas/nala/ccd/slice-cc-allapps31211',
    id: 'test',
    fields: {
        variant: 'ccd-slice',
        description: 'please {{view-account}} for {{cai-default}}',
        cta: '{{buy-now}}',
    },
};

const nockNock = () => {
    nock('https://odin.adobe.com')
        .get('/adobe/sites/fragments')
        .query({ path: '/content/dam/mas/nico/fr_FR/dictionary/index' })
        .reply(200, DICTIONARY_CF_RESPONSE);
    nock('https://odin.adobe.com')
        .get(
            '/adobe/sites/fragments/fr_FR_dictionary/variations/master/references',
        )
        .reply(200, DICTIONARY_RESPONSE);
};
describe('replace', () => {
    it('returns 200 & replaced entries keys with text', async () => {
        nockNock();
        const response = await replace({
            status: 200,
            surface: 'nico',
            parsedLocale: 'fr_FR',
            body: ODIN_RESPONSE,
        });
        expect(response).to.deep.equal({
            statusCode: 200,
            body: {
                path: '/content/dam/mas/nala/ccd/slice-cc-allapps31211',
                id: 'test',
                fields: {
                    variant: 'ccd-slice',
                    description:
                        'please View account for An AI tool was not used in creating this image region',
                    cta: 'Buy now',
                },
            },
        });
    });
});
