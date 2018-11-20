const naming = '__Odi';

/* Basic controller metadata */
export const CONTROLLER = `${naming}_controller`;
export const ROUTE = `${naming}_route`;
export const RAW_ROUTE =`${naming}_raw_route`;
export const ROUTE_HANDLER = `${naming}_route_handler`

/* Controller advanced metadata */
export const ROUTE_ARGS = `${naming}_route_args`
export const ROUTE_MIDDLEWARE = `${naming}_route_md`;
export const CONTROLLER_MIDDLEWARE = `${naming}_controller_md`;

/* WebSocket metadata */
export const SOCKET = `${naming}_sockets`;
export const SOCKET_EVENT = `${naming}_socket_event`;

/* Repository metadata */
export const REPOSITORY = `${naming}_repository`

/* Service metadata */
export const SERVICE = `${naming}_service`;

/* Dependency tools */
export const AUTOWIRED = `${naming}_autowired`
export const AUTOWIRED_PROPS = `${naming}_autowired`;

export const INJECT = `${naming}_inject`;
export const INJECT_ID = `${naming}_inject_id`;

/* DTO */
export const DATA_CLASS = `${naming}_data_class`;
export const DATA_VALIDATION_PROP = `${naming}_data_validation`

/* Auth */
export const AUTH = `${naming}_auth_defaults`
export const AUTH_MIDDLEWARE = `${naming}_auth_middleware`

export const MAIN_COMPONENTS = [CONTROLLER, SOCKET, SERVICE, AUTH, REPOSITORY];


export const DB_CONNECTION = `#${naming}_db_connection_default`;