import { Namespace, Socket } from 'socket.io';

export abstract class ISocket{
    protected nsp: Namespace;
    protected socket: Socket;

    protected onConnect() {}

    protected onDisconnect(reason: string) {}

    protected onError(error: Error) {}
    
    
    emit(event: string | symbol, ...args: any[]) {
        this.nsp.emit(event, ...args);
    }

    emitTo(room: string) {
        return (event: string | symbol, ...args: any[]) => this.nsp.to(room).emit(event, ...args);
    }

    broadcast(event: string | symbol, ...args: any[]) {
        this.socket.broadcast.emit(event, ...args);
    }

    broadcastTo(room: string) {
        return (event: string | symbol, ...args: any[]) => this.socket.broadcast.to(room).emit(event, ...args);
    }
}

