
# Odi

TypeScript framework for creating enterprise-grade (web) applications with simple and minimalistic API, that allows you to focus on business logic. Based on declarative and imperative programming, inspiried by [ASP.NET](https://www.asp.net/) / [Spring](https://spring.io/). 

Odi provides feature set for creation of easy supportable and scalable web applications.

Features Roadmap:
 - [x] MVC
 - [x] Extendable DI / IoT
 - [x] Authentication
 - [x] WebSockets
 - [x] TypeORM integration
 - [ ] GraphQL
 - [ ] AOP
 - [ ] SSR
 
 Example:
 ```typescript
import { Controller, IController, Post, Get, Data } from 'odi';
import { IsDate, IsOptional, MaxLength } from 'odi/validator';

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


@Data()
class TodoDTO {

    @MaxLength(255)
    summary: string;

    @IsOptional()
    tags: string[];

    @IsDate()
    deadline: Date;
}

 ```
