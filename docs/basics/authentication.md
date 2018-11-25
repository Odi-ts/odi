# Authentication

## Overview

**Odi** provides build in `Authentication` module based on [JWT](https://jwt.io/). Module is fully configurable and extendable. Also, `Authentication` is integrated with [Controllers](controller.md).

Controller example

```typescript
import { Get, Post, Controller, IController, Autowired, Auth } from "odi":
import { UserService } from "./user.service";
import { AuthService } from "./auth.service";
import { SigninDTO } from "./dto/signin.dto";

@Controller()
export class TodoController extends IController<AuthService> {
        
    @Autowired()
    userService: UserService;   
    
    @Post signin (payload: SigninDTO) {
        const user = this.userService.signinUser(payload);
        
        if(!user)
            throw new Error('Wrong credentials');
        
        this.user.assign(user);
    }
    
    @Auth()
    @Get user() {
        return this.user.decode();
    }
    
    @Get verify() {
        const [ user, err ] = this.user.verify();
        
        if(err)
            throw new Error('Token expired');
            
        return user;        
    }
}
```

## Getting started

[JWT](https://jwt.io/) module should be installed

1. Install npm package  `npm install jsonwebtoken --save`   

## Authentication

Auth Service should be created, to start working with authentication in **Odi** application. **Odi** automatically extracts token from request and starts processing.

### Service

Implementation must be provided for abstract class `CoreAuth` with 2 generics.

```typescript
import { Authentication, CoreAuth, Context, Autowired } from 'odi';
import User from './models/user.model';
import UserService from './services/user.service';

export interface Decoding {
    id: string;
    role: number;
}

@Authentication()
export class AuthService extends CoreAuth<Decoding, User> {

    @Autowired()
    userService: UserService;

    serialize(user: User) {
        const role = this.userService.findRole(user);
                
        return { role, id: user.id };
    }

    deserialize(decoding: Decoding) {
        return this.userService.findById(decoding.id);
    }    
}
```

Only 2 methods must be implemented

* `serialize(user: User)` - will be called when `user.assign(...)` called. 
* `deserialize(decoding: Decoding)` - will be called, when `user.load()` called.

### Controller Integration

To have fully typed code, you should pass your Auth Service to first Controller generic.

```typescript
@Controller()
export class TodoController extends IController<AuthService> { ...
```

For interacting with user in `Controller`, `UserData` instance will be passed to `user` property. It has only few methods. 

* `load(options?: DecodeOptions)` - this method decode token and pass it to `deserialize(...)` method. Semantically, it should be used to load user from database. 
* `decode(options?: DecodeOptions)` - wrapper for JWT decode. Decodes `Object` from token 
* `verify(options?: VerifyOptions)` - wrapper for JWT verify. Decodes  and verofy `Object`

  from token. Method returns `[ Decoding | null, Error | null ]` 

* `assign(user: User, options?: SignOptions)` -  this method encode token and return it \(as string\). Custom options can be passed for encoding. `user` will be passed to `serialize(...)`





