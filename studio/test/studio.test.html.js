// @ts-nocheck
import { runTests } from '@web/test-runner-mocha';
import { expect } from '@esm-bundle/chai';

// import '@adobecom/milo/libs/features/mas/mas/src/mas.js';
import '@adobecom/milo/libs/deps/mas/mas.js';

import '../../src/aem/content-navigation.js';
import '../../src/aem/aem-fragments.js';
import '../../src/aem/table-view.js';
import '../../src/aem/render-view.js';

import '../src/swc.js';
import '../src/studio.js';

import { mockFetch } from '@adobecom/milo/libs/features/mas/mocks/fetch.js';
import { withAem } from '@adobecom/milo/libs/features/mas/mocks/aem.js';
import { withWcs } from '@adobecom/milo/libs/features/mas/mocks/wcs.js';

import { getTemplateContent, delay } from './utils.js';

import '@tinymce/tinymce-webcomponent';

runTests(async () => {
    describe('M@S Studio', () => {
        beforeEach(() => {
            //document.location.hash = '#';
            document.querySelector('main').innerHTML = '';
        });

        it('should render', async () => {
            const [studio] = getTemplateContent('studio');
            document.querySelector('main').append(studio);
            expect(studio).exist;
        });
    });
});
