import { FooModel } from '../utils/db.utils';
import { expect } from 'chai';
import { Core } from '../../src/core/server';
import { resolve } from 'path';
import DependencyComposer from '../../src/dependency/dependency.composer';
import { DependencyClassifier } from '../../src/dependency/dependency.processor';
import { Connection, getConnection } from 'typeorm';


let core: Core;
describe('Core', async () => {

    let connection: Connection;

    core = new Core({
        server: { port: 8080 },
        sources: resolve(__dirname, './deps/classes'),
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

    describe('#constuctor', async () => {

        it('should path options to field ', () => expect(core['options']).to.be.a('object'));

        it('should create epxress app', () => expect(core['app']).to.be.not.eq(undefined));

        it('should create dependency composer', () => expect(core['dependencyComposer']).to.be.instanceOf(DependencyComposer));
    });


    describe('#setDatabase(..)', async () => {
        if(core['database'])
            await core['database'].close();

        connection = await core['setDatabase']();

        it('should return typeorm connection', () => expect(connection).to.be.instanceOf(Connection));
    });

    describe('#setMiddleware(..)', async () => {
        core['setMiddleware']();

        // Probably 2 middlewares body-parser and cookie-parser produces 4 funcs 
        it('should set at least 2 default middlewares', () => expect(core['app']._router.stack.length).to.be.greaterThan(3));
    });

    describe('#loadDependencies(...)', async () => {
        it('should create deps loader', async () => {
            await core['loadDependencies']();
            expect(core['dependencyLoader']).to.be.instanceOf(DependencyClassifier)
        });
    });

    describe('#setUp(...)', async () => {
        if(core['database'])
            await core['database'].close();

        await core['setUp']();

        it('should create deps loader', () => expect(core['dependencyLoader']).to.be.instanceOf(DependencyClassifier));
        it('should return typeorm connection', () => expect(core['database']).to.be.instanceOf(Connection));
        it('should set at least 2 default middlewares', () => expect(core['app']._router.stack.length).to.be.greaterThan(3));
    });

    describe('#setUp(...)', async () => {  

        it('should run whole application without errors', async () => {
            if(core['database'])
                await core['database'].close();

            if(getConnection())
                await getConnection().close();

            await core.listen();            
        });

    });
});

after((done) => core['server'].close(() =>  done()));