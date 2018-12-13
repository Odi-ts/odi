
function normilizeParams(path: string) {
    const route = path.replace(/\/{/g, '/:').replace(/}\//g, '/');

    return route.charAt(route.length - 1) === '}' ? route.substring(0, route.length - 1) : route;
}

export function normalizeRoutePath(path: string, controller: boolean = false) {
    let route = path;

    if(route === 'index')
        route = '/';

    if(route.charAt(0) !== '/' && !controller)
        route = `/${route}`;

    if(route.charAt(0) === '/' && controller)
        route = '';

    return normilizeParams(route);
}