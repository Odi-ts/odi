export abstract class IUser<Decoding extends object, User>{     
        
    abstract async load(options?: any): Promise<User | any>;
 
    abstract async assign(user: User, options?: any): Promise<Decoding | any>;

}