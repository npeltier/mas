import { FRAGMENT_URL_PREFIX, MAS_ROOT, odinReferences } from '../utils/paths.js';
import { fetch, getRequestInfos, matchesGeo } from '../utils/common.js';
import { log, logDebug, logError } from '../utils/log.js';

const CONFIG_CACHE_TTL = 5 * 60 * 1000;
const PROMOTIONS_PATH = `${MAS_ROOT}/promotions`;

let projectsCache;

export function clearPromoCache(preview = false) {
    if (preview) {
        localStorage.removeItem('promotions');
    } else {
        projectsCache = undefined;
    }
}

function getCachedProjects(preview) {
    const cacheEntry = preview ? JSON.parse(localStorage.getItem('promotions')) : projectsCache;
    if (cacheEntry) {
        cacheEntry.isExpired = Date.now() - cacheEntry.timestamp > CONFIG_CACHE_TTL;
        return cacheEntry;
    }
    return null;
}

function cacheProjects(preview, projects) {
    const cacheEntry = { projects, timestamp: Date.now() };
    if (preview) {
        localStorage.setItem('promotions', JSON.stringify(cacheEntry));
    } else {
        projectsCache = cacheEntry;
    }
    return projects;
}

async function fetchProjects(context) {
    const cached = getCachedProjects(context.preview);
    if (cached && !cached.isExpired) {
        logDebug(() => 'Using cached promotion projects', context);
        return cached.projects;
    }

    const baseUrl = context.preview?.url ?? FRAGMENT_URL_PREFIX;
    const folderUrl = `${baseUrl}?path=${PROMOTIONS_PATH}`;
    const response = await fetch(folderUrl, context, 'promotions-folder');
    if (response.status !== 200) {
        logDebug(() => `Failed to fetch promotions folder: ${response.message}`, context);
        return null;
    }

    const items = response.body?.items ?? [];
    const projects = items.map(({ id, path, fields }) => ({
        id,
        path,
        surfaces: fields?.surfaces ?? [],
        geos: fields?.geos ?? [],
        startDate: fields?.startDate ?? null,
        endDate: fields?.endDate ?? null,
        tags: fields?.tags ?? [],
        offerLines: fields?.offers ?? [],
    }));

    return cacheProjects(context.preview, projects);
}

function toInstant(value) {
    if (!value) return Date.now();
    if (typeof value === 'number') return value;
    return new Date(value).getTime();
}

const PROMO_TAG_PREFIX = '/content/cq:tags/mas/promotion';

/**
 * Parses project-level offer override lines of the form "<osis>:<promocode>:<countries>"
 * where osis and countries are comma-separated lists (may be empty), promoCode is required.
 * @param {string[]} lines
 * @returns {{ osis: string[], promoCode: string, countries: string[] }[]}
 */
function parseOfferOverrides(lines) {
    return lines
        .map((line) => {
            const [osisPart, promoCode, countriesPart] = line.split(':');
            if (!promoCode?.trim()) return null;
            return {
                osis: osisPart
                    ? osisPart
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean)
                    : [],
                promoCode: promoCode.trim(),
                countries: countriesPart
                    ? countriesPart
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean)
                    : [],
            };
        })
        .filter(Boolean);
}

function matchesProject(project, { surface, country, regionLocale, instant }, context) {
    if (!project.tags.some((tag) => tag.startsWith(PROMO_TAG_PREFIX))) {
        logDebug(() => `Project "${project.name}" skipped: no promo tag (expected prefix: ${PROMO_TAG_PREFIX})`, context);
        return false;
    }
    if (!project.surfaces.includes(surface)) {
        logDebug(() => `Project "${project.name}" skipped: surface "${surface}" not in [${project.surfaces}]`, context);
        return false;
    }
    if (project.startDate && instant < new Date(project.startDate).getTime()) {
        logDebug(
            () =>
                `Project "${project.name}" skipped: instant ${new Date(instant).toISOString()} is before startDate ${project.startDate}`,
            context,
        );
        return false;
    }
    if (project.endDate && instant > new Date(project.endDate).getTime()) {
        logDebug(
            () =>
                `Project "${project.name}" skipped: instant ${new Date(instant).toISOString()} is after endDate ${project.endDate}`,
            context,
        );
        return false;
    }
    const { geos } = project;
    if (geos.length > 0 && !matchesGeo(geos, { regionLocale, country })) {
        logDebug(
            () =>
                `Project "${project.name}" skipped: none of regionLocale="${regionLocale}", country="${country}" found in geos [${geos}]`,
            context,
        );
        return false;
    }
    return true;
}

function parseFragments(hydratedProject) {
    const { references } = hydratedProject;
    const offerRefs = hydratedProject.fields?.offers ?? [];
    return offerRefs
        .map((refId) => {
            const ref = references?.[refId]?.value;
            if (!ref) return null;
            const { osi, promoCode } = ref.fields ?? {};
            if (!osi || !promoCode) return null;
            return { osi, promoCode };
        })
        .filter(Boolean);
}

async function init(context) {
    // Fire projects fetch immediately — needs no context dependencies
    const projectsPromise = fetchProjects(context);

    // Resolve request info in parallel
    const { surface } = await getRequestInfos(context);
    if (!surface) return { status: 200, activeProject: null };

    const projects = await projectsPromise;
    if (!projects?.length) return { status: 200, activeProject: null };

    const instant = toInstant(context['mas.instant']);
    const { locale, country, regionLocale } = context;

    let active = null;
    let matchCount = 0;
    for (const project of projects) {
        if (matchesProject(project, { surface, locale, country, regionLocale, instant }, context)) {
            matchCount++;
            if (!active) active = project;
        }
    }
    if (matchCount > 1) {
        log(`Multiple promotion projects matched (${matchCount}), using first: ${active.id}`, context);
    }
    if (!active) return { status: 200, activeProject: null };

    const response = await fetch(odinReferences(active.id, true, context.preview), context, 'promotions-hydrate');
    if (response.status !== 200) {
        logError(`Failed to hydrate promotion project ${active.id}: ${response.message}`, context);
        return { status: 200, activeProject: null };
    }

    const hydratedProject = response.body;
    const fragments = parseFragments(hydratedProject);
    logDebug(() => `Active promotion project ${active.id} with ${fragments.length} fragments`, context);

    return {
        status: 200,
        activeProject: {
            id: active.id,
            path: active.path,
            fields: hydratedProject.fields,
            fragments,
            offerOverrides: parseOfferOverrides(active.offerLines),
            references: hydratedProject.references ?? {},
        },
    };
}

function buildPromoMap(fragments, offerOverrides, country) {
    const map = {};
    for (const { osi, promoCode } of fragments) {
        map[osi] = promoCode;
    }
    for (const override of offerOverrides) {
        const countryMatch = override.countries.length === 0 || (country && override.countries.includes(country));
        if (!countryMatch) continue;
        if (override.osis.length === 0) {
            map['*'] = override.promoCode;
        } else {
            for (const osi of override.osis) {
                map[osi] = override.promoCode;
            }
        }
    }
    return map;
}

async function promotions(context) {
    const { activeProject } = (await context.promises?.promotions) ?? {};
    if (!activeProject) return { ...context, status: 200 };
    const { fragments = [], offerOverrides = [] } = activeProject;
    const promoMap = buildPromoMap(fragments, offerOverrides, context.country);
    return { ...context, status: 200, promoMap };
}

export const transformer = {
    name: 'promotions',
    process: promotions,
    init,
};
