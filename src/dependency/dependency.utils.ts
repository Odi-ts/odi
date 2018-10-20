
import { Class } from "../utils/object.reflection";
import { ComponentSettings } from "./dependency.decorators";
import { ClassType } from "class-transformer/ClassTransformer";
import { ObjectType } from "typeorm";
import { ValuedProps } from "./dependency.manager";

export const onInit = Symbol('onInit');

export const autowiredPropsStore = new WeakMap<object, (string | symbol)[]>();

export function define<T extends Class> (classType: T) {
    return (settings: ComponentSettings<T>) => {

    };
}