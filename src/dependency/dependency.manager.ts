
export type Omit<T, K extends keyof T | undefined> = Pick<T, Exclude<keyof T, K>>;

export type MethodProps<T> = ({ [P in keyof T]?: (T[P] extends Function ? P : never)  })[keyof T];

export type ValuedProps<T> = Omit<T, MethodProps<T>>;

export type ConstructorParameters<T extends new (...args: any[]) => any> = T extends new (...args: infer P) => any ? P : never;