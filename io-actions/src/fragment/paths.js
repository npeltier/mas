const MAS_ROOT = '/content/dam/mas';

const FRAGMENT_URL_PREFIX = 'https://odin.adobe.com/adobe/sites/fragments';

const PATH_TOKENS =
    /\/content\/dam\/mas\/(?<surface>[\w]+)\/(?<parsedLocale>[\w_]+)\/(?<fragmentPath>.*)/;

/**
 * builds a full fetchable path to the fragment
 * @param {*} id id of the fragment,
 * @returns full fetchable path to the fragment
 */
const odinId = (id) => `${FRAGMENT_URL_PREFIX}/${id}`;

/**
 * builds a full fetchable path to the fragment references
 * @param {*} id id of the fragment,
 * @returns full fetchable path to the fragment references
 */
const odinReferences = (id) => `${odinId(id)}/variations/master/references`;

/**
 * builds a full fetchable path to the fragment
 * @param {*} surface surface of the fragment,
 * @param {*} locale locale of the fragment,
 * @param {*} fragmentPath subpath of the fragment from the locale root
 * @returns full fetchable path to the fragment
 */
const odinPath = (surface, locale, fragmentPath) =>
    `${FRAGMENT_URL_PREFIX}?path=${MAS_ROOT}/${surface}/${locale}/${fragmentPath}`;

module.exports = {
    PATH_TOKENS,
    FRAGMENT_URL_PREFIX,
    MAS_ROOT,
    odinPath,
    odinId,
    odinReferences,
};
