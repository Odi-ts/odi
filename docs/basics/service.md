# Service

## Overview

**Services** is some kind of logic center in **Odi** applications. It's like connection between network and data layer.

```typescript
import { Service, Autowired } from "odi";
import { TodoRepository } from "./todo.repository"

@Service()
export class TodoService {

    @Autowired()
    todoRep: TodoRepository;    

    public getTodos() {
        return this.todoRep.find();
    }

    public async getUsedSpace() {
        const todos = await this.getTodos();
        const rolled = todos.reduce((p,todo) => p += todo.title, '');
        
        return Buffer.byteLength(rolled, 'utf8');
    }
}
```

## Definition

There are no special requirements for service declaration. 

`@Service()` - sets class as service.

And that's all. You can start using your service. It's more about semantics than about code. You can easily replace any service with simple class, but services will help to make abstraction \(architecture\) more clear.

## Dependency Injection

Service is one of root units. It's always presented as singleton in global container. 

Services can be injected into other dependencies and can have injected dependencies. All features of **DI** can be used, except of changing definition behaviour. You can't manually set props or constructor arguments for default instance.



