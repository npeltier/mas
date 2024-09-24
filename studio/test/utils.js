export const getTemplateContent = (template) => {
    const templateEl = document.getElementById(template);
    // @ts-ignore
    const templateContent = templateEl.content.cloneNode(true);
    return [...templateContent.children];
};

export const delay = (ms = 0) =>
    new Promise((resolve) => setTimeout(resolve, ms));
