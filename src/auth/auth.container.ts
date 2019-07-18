export abstract class IUser<Decoding extends object, User> {

    public abstract async load(options?: any): Promise<User | any>;

    public abstract async assign(user: User, options?: any): Promise<Decoding | any>;

}
