import { Constructor } from "../types";
import { KeyMap } from "../utils/object.utils";
import { ComponentEntry } from "./dependency.decorators";

export type Omit<T, K extends keyof T | undefined> = Pick<T, Exclude<keyof T, K>>;

export type MethodProps<T> = ({ [P in keyof T]?: (T[P] extends Function ? P : never)  })[keyof T];

export type ValuedProps<T> = Omit<T, MethodProps<T>>;

export type ConstructorParameters<T extends Constructor> = T extends new (...args: infer P) => unknown ? P : never;

export const ComponentSettingsStorage = new WeakMap<object, KeyMap<ComponentEntry<Constructor>>>();
