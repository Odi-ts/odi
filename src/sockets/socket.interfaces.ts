import { Namespace, Socket } from "socket.io";

export abstract class ISocket {
    protected nsp: Namespace;
    protected socket: Socket;

    public emit(event: string | symbol, ...args: any[]) {
        this.nsp.emit(event, ...args);
    }

    public emitTo(room: string) {
        return (event: string | symbol, ...args: any[]) => this.nsp.to(room).emit(event, ...args);
    }

    public broadcast(event: string | symbol, ...args: any[]) {
        this.socket.broadcast.emit(event, ...args);
    }

    public broadcastTo(room: string) {
        return (event: string | symbol, ...args: any[]) => this.socket.broadcast.to(room).emit(event, ...args);
    }

    protected onConnect() {}

    protected onDisconnect(reason: string) {}

    protected onError(error: Error) {}
}
