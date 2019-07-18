import { SOCKET, SOCKET_EVENT } from "../definitions";
import DependencyComposer from "../dependency/dependency.composer";
import DependencyContainer from "../dependency/dependency.container";
import { Constructor } from "../types";
import { ILoader, reflectOwnProperties, reflectProperties } from "../utils/directory.loader";
import { metadata } from "../utils/metadata.utils";
import { Namespace } from "./socket.decorator";
import { ISocket } from "./socket.interfaces";

export interface LoaderOptions {
    socketio: SocketIO.Server;
    dependencyComposer: DependencyComposer;
}

interface HandlersMap { [index: string]: string; }

export default class SocketLoader implements ILoader {

    constructor(readonly options: LoaderOptions) {}

    public async processBase() {
        const container = DependencyContainer.getContainer();

        return async (classType: Constructor) => {
            if (container.contain(classType)) {
                return container.get(classType)!;
            }

            const sckMeta = metadata(classType);
            const base: Namespace = sckMeta.getMetadata(SOCKET);

            const instance: ISocket = await this.options.dependencyComposer.instanciateClassType(classType);
            const handlers = this.bindHandlers(instance);
            const nsp = this.options.socketio.of(base);

            instance["nsp"] = nsp;
            instance["nsp"].on("connect", (socket: SocketIO.Socket) => {
                const isocketHandler: ISocket = this.bindController(instance);
                isocketHandler["socket"] = socket;
                isocketHandler["onConnect"]();

                socket.on("disconnect", (reason) => isocketHandler["onDisconnect"](reason));
                socket.on("error", (error) => isocketHandler["onError"](error));

                for (const [ eventName, method] of handlers) {
                    socket.on(eventName, (...args) => (isocketHandler as any)[method](...args));
                }
            });

            container.put(classType, instance);

            return instance;
        };
    }

    private bindController(target: ISocket) {
        return Object.assign(Object.create(Object.getPrototypeOf(target)), target);
    }

    private bindHandlers(instance: ISocket) {
        const map: HandlersMap = {};

        for (const method of reflectOwnProperties(instance)) {
            const eventName: string = Reflect.getMetadata(SOCKET_EVENT, instance, method);

            if (eventName) {
                map[eventName] = method;
            }
        }

        return Object.entries(map);
    }
}
