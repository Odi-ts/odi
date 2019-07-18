import { load }from "cheerio";

function extractWrapper(html: string, containerId: string) {
    const document = load(html);
    const container = document(containerId);

    return { document, container };
}
