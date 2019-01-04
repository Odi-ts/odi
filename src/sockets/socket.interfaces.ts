import { Namespace, Socket } from 'socket.io';

export abstract class ISocket{
    private nsp: Namespace;
    private socket: Socket;

    protected onConnect(): void {}

    protected onDisconnect(): void {}

    protected onReconnect(): void {}

    
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

