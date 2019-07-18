import { expect } from "chai";
import { resolve } from "path";
import { Connection, getConnection, getManager } from "typeorm";
import { Core } from "../../src/core/server";
import DependencyComposer from "../../src/dependency/dependency.composer";
import { DependencyManager } from "../../src/dependency/dependency.manager";
import { FooModel } from "../../src/utils/db.utils";

function getCore() {
    return new Core({
        server: {
            port: 8080,
            socket: true
        },
        sources: resolve(__dirname, "./deps/classes"),
        database: {
            name: "scoped",
            type: "postgres",
            host: "localhost",
            port: 5432,
            username: "postgres",
            password: "",
            database: "test_db_2",
            synchronize: true
        }
    });
}

let core: Core;
describe("Core", async () => {

    let connection: Connection;

    core = getCore();

    describe("#constuctor", async () => {

        it("should path options to field ", () => expect(core["options"]).to.be.a("object"));

        it("should create epxress app", () => expect(core["app"]).to.be.not.eq(undefined));

        it("should create dependency composer", () => expect(core["dependencyComposer"]).to.be.instanceOf(DependencyComposer));
    });

    describe("#setDatabase(..)", async () => {
        it("should return typeorm connection", async () => {
            if (core["database"]) {
                await core["database"].close();
            }

            connection = await core["setDatabase"]();
            expect(connection).to.be.instanceOf(Connection);
        });
    });

    describe("#setMiddleware(..)", () => {
        it("should set at least 2 default middlewares", () => core["setMiddleware"]());
    });
    describe("#setUp(...)", async () => {

        before(async () => {
            core = getCore();

            const manager = getManager("scoped");

            if (manager && manager.connection.isConnected) {
                await manager.connection.close();
            }

            await core["setUp"]();
        });

        it("should create deps loader", () => expect(core["dependencyManager"]).to.be.instanceOf(DependencyManager));
        it("should return typeorm connection", () => expect(core["database"]).to.be.instanceOf(Connection));
    });

    describe("#loadDependencies(...)", async () => {
        it("should create deps loader", async () => {
            await core["loadDependencies"]();
            expect(core["dependencyManager"]).to.be.instanceOf(DependencyManager);
        });
    });

    describe("#listen(...)", () => {

        before(async () => {
            if (core["database"]) {
                await core["database"].close();
            }

            if (getConnection()) {
                await getConnection().close();
            }

            core = getCore();
        });

        it("should run whole application without errors", async () => core.listen());
    });

    after((done) =>  core["app"].close(() => core["app"].close(() => done())));
});
