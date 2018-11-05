# Authentication

## Overview

**Odi** provides build in `Authentication` module based on [JWT](https://jwt.io/). Module is fully configurable and extendable. Also, `Authentication` is integrated with [Controllers](controller.md).

Controller example

```typescript
import { Get, Post, Controller, IController, Autowired } from "odi":
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

## Auth Service



