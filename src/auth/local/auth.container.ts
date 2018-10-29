import { Request, Response, Context } from "koa";
import { CoreAuth } from "./auth.interface";
import { SignOptions } from "jsonwebtoken";

export class UserData<Decoding extends object, User>{     
    private _decoding: Decoding | null;
    public token: string;
    
    constructor(
        private readonly ctx: Context,
        private readonly authService: CoreAuth<Decoding, User>
    ) {}


    get decoding(): Decoding | null {
        if(!this._decoding) {
            this._decoding = this.authService.decodeToken(this.token);
        }

        return this._decoding;
    }

    verify() {
        let result: [ Decoding | null, Error | null];

        try {
            result = [ this.authService.verifyToken(this.token), null ];
        } catch (err) {
            result = [ null, (err as Error)];
        }

        return result;
    }
 
    assign(data: Decoding, options?: SignOptions): string {
        return this.authService.createToken(data, options)
    }


    //abstract requestStrategy(name: string, options? :any): void;
    //abstract acceptStrategy(name: string, options?: any): Promise<any>;
}
   