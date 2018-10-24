# Read Me

## Odi

TypeScript framework for creating enterprise-grade \(web\) applications with simple and minimalistic API, that allows you to focus on business logic. Based on declarative and imperative programming, inspiried by [ASP.NET](https://www.asp.net/) / [Spring](https://spring.io/).

Odi provides feature set for creation of easy supportable and scalable web applications.

Features Overview:

* [x] MVC
* [x] Full-typed DI / IoT
* [x] Authentication
* [x] WebSockets
* [x] TypeORM integration
* [ ] GraphQL
* [ ] CLI
* [ ] AOP
* [ ] SSR

For future updates check [Roadmap](https://github.com/Odi-ts/Odi/wiki/Roadmap)

{% page-ref page="basics/getting-started.md" %}

### Example

```typescript
import { Controller, IController, Post, Get, Autowired } from "odi";
import { TodoService } from "./todo.service";
import { TodoDTO } from "./todo.dto";

@Controller()
export class TodoController extends IController {

   @Autowired()
   todoService: TodoService;

   @Get index() {
       return `Hello, ${this.request.ip}`;
   }

   @Post async save(toDo: TodoDTO) {
       await this.todoService.save(toDo);
   }
   
   @Get async '/:id' (id: string) {
       const todo = await this.todoService.find(id);
       
       if(!todo) 
         throw NotFound;
       
       return todo;
   }
}
```

