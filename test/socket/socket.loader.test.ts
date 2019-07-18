import * as socketServer from "socket.io";
import * as socketClient from "socket.io-client";

import { expect } from "chai";

import SocketLoader from "../../src/sockets/socket.loader";

import { OnEvent, Socket } from "../../src/sockets/socket.decorator";
import { ISocket } from "../../src/sockets/socket.interfaces";
import { getDependencyComposer } from "../utils/di.utils";

import fastify = require("fastify");

@Socket("admin")
class HomeSocket extends ISocket {

    public onConnect() {
        console.log("connected");
    }

    @OnEvent("message")
    public foo() {
        this.emit("response", "Hello world!");
    }

    @OnEvent("exit")
    public exit() {
        this.emit("quite", "Goodby world!");
    }

}

describe("Socket Loader", async () => {
    const app = fastify();
    const socketio = socketServer(app.server);

    const dependencyComposer = getDependencyComposer();
    const socketLoader = new SocketLoader({ socketio, dependencyComposer });
    const processor = await socketLoader.processBase();

    before((done) => app.listen(8082, done));

    describe("#processBase(...)", async () => {

        it("should return processing function", () => expect(processor).to.be.instanceOf(Function));

        it("should put instance in DI container", async () => {
            await processor(HomeSocket);
            expect(dependencyComposer["container"].contain(HomeSocket, "default")).to.be.eq(true);
        });
    });

    describe("#bindHandlers", async () => {
        const handerls = Array.from(socketLoader["bindHandlers"](new HomeSocket));

        it("should collect handlers", () => expect(handerls).to.have.length(2));

        it("should have functions and names", () => {
            const [ first, second ] = handerls;

            expect(first[0]).to.be.eq("message");
            expect(second[0]).to.be.eq("exit");
        });
    });

    describe("handling", () => {
        let socket: SocketIOClient.Socket;

        before(function(done) {
            socket = socketClient("http://localhost:8082/admin", { transports: ["websocket"] });
            socket.on("connect", () => done());
        });

        it("should emmit message event and accept response event", (done) => {
            socket.on("response", (res: any) => {
                expect(res).to.be.eq("Hello world!");
                done();
            });

            socket.emit("message", "Hello!");
        });

        it("should emmit exit event and accept quite event", (done) => {
            socket.on("quite", (res: any) => {
                expect(res).to.be.eq("Goodby world!");
                done();
            });

            socket.emit("exit", "Hello!");
        });

        after((done) => {
          //  socket.close();
           socketio.close(() => done());
        });
    }).timeout(40000);

});
