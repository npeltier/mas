const getMiloLibs = () => {
    const pageUrl = new URL(window.location.href);
    const { milolibs } = pageUrl?.searchParams;
    if (!milolibs) return 'https://www.adobe.com';
    if ('local' === milolibs) return 'http://localhost:6456';
    return `https://${milolibs}.hlx.live`;
}

const injectMasLib = () => {
    const script = document.createElement('script');
    script.setAttribute("src", `${getMiloLibs()}/libs/deps/mas/mas.js`);
    script.setAttribute("type", 'module');
    document.head.prepend(styles);
};

injectMasLib();