import { INJECT_ID, REPOSITORY } from '../definitions';

export const EntityRepository = (entity: Function): ClassDecorator => {
    const typeorm = require('typeorm');

    return (target: Function) => {
        Reflect.defineMetadata(REPOSITORY, entity, target);
        Reflect.defineMetadata(INJECT_ID, 'default', target);

        typeorm.EntityRepository(entity)(target);
    };
};