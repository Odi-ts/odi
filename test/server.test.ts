import { FooModel } from './utils/db.utils';
import { expect } from 'chai';
import { Core } from '../src/core/server';
import { resolve } from 'path';
import DependencyComposer from '../src/dependency/dependency.composer';
import { Connection, getConnection } from 'typeorm';
import { DependencyClassifier } from '../src/dependency/dependency.processor';

describe('Core', () => {
    const core = new Core({
        server: { port: 8080 },
        sources: resolve(__dirname, './deps/classes'),
        database: {
            type: "postgres",
            host: "localhost",
            port: 5432,
            username: "postgres",
            password: "",
            database: "test_db",
            entities: [ FooModel ],
            synchronize: true
        }
    });

    describe('#constuctor', () => {

        it('should path options to field ', () => expect(core['options']).to.be.a('object'));

        it('should create epxress app', () => expect(core['app']).to.be.not.eq(undefined));

        it('should create dependency composer', () => expect(core['dependencyComposer']).to.be.instanceOf(DependencyComposer));
    });

    describe('#setDatabase(..)', async () => {
        const db = await core['setDatabase']();

        it('should return typeorm connection', () => expect(db).to.be.instanceOf(Connection));
    });

    describe('#setMiddleware(..)', async () => {
        core['setMiddleware']();

        /* Probably 2 middlewares body-parser and cookie-parser produces 4 funcs */
        it('should set at least 2 default middlewares', () => expect(core['app']._router.stack.length).to.be.greaterThan(3));
    });

    describe('#loadDependencies(...)', async () => {
        await core['loadDependencies']();

        it('should create deps loader', () => expect(core['dependencyLoader']).to.be.instanceOf(DependencyClassifier))

    });

    after(async () => await getConnection().close())
});