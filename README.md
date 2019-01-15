<p align="center"> <img src="https://i.imgur.com/4Zf3O35.png" height="94"/> </p>

<p align="center"> 
	<a href="https://codeclimate.com/github/Odi-ts/odi/maintainability">
		<img src="https://api.codeclimate.com/v1/badges/5c736ec0fc59f431128c/maintainability" />
	</a>
	<a href="https://codeclimate.com/github/Odi-ts/odi/test_coverage">
		<img src="https://api.codeclimate.com/v1/badges/5c736ec0fc59f431128c/test_coverage" />
	</a>
</p>

<p align="center"> 
	<img src="https://img.shields.io/npm/v/odi.svg" /> 
	<img src="https://img.shields.io/github/license/Odi-ts/Odi.svg" /> 
	<img src="https://img.shields.io/depfu/Odi-ts/odi.svg" />
	<img src="https://img.shields.io/github/last-commit/Odi-ts/Odi.svg" />
	<img src="https://travis-ci.com/Odi-ts/odi.svg?branch=master" />
	<a href="https://gitter.im/odiland/community" target="_blank">
		<img src="https://img.shields.io/gitter/room/nwjs/nw.js.svg" />
	</a>
</p>

TypeScript framework for creating enterprise-grade (web) applications with simple and minimalistic API, that allows you to focus on business logic. Based on declarative and imperative programming, inspiried by [ASP.NET](https://www.asp.net/) / [Spring](https://spring.io/). 

**Check [Docs](https://odi.gitbook.io/core/basics/getting-started) for more details.**

Odi provides feature set for creation of easy supportable and scalable web applications.

Features Overview:
 - [x] MVC
 - [x] Full-typed DI / IoT
 - [x] Authentication
 - [x] WebSockets
 - [x] TypeORM integration
 - [ ] GraphQL
 - [ ] AOP
 - [ ] SSR
 
For future updates check [Roadmap](https://github.com/Odi-ts/Odi/wiki/Roadmap)

[![Edit Odi](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/pjov89947x)
 
## 🚀 Getting Started 
1. Install npm package<br/>
  `npm install odi --save`

2. Install reflect-metadata <br/>
	 `npm install reflect-metadata --save`
	
3. Import reflect-metadata (for example in  `index.ts`):<br/>
	 `import "reflect-metadata";`
	
4. Enabled the following settings in `tsconfig.json`
	```json
	"emitDecoratorMetadata":  true, 
	"experimentalDecorators":  true
	```

## 🌪 Overview

### Controller
Controllers serve as a simple yet powerful routing mechanism in a minimalistic style.

```typescript
@Controller('foo') 
export class FooController extends IController {      
        
    @RoutePatch('{id}')     
    bar(id: string, payload: FooDTO) {         
        ...some updates..          
        return Ok();     
    } 

    @Get index() {
        return 'Foo';
    }
} 
```

So, as you see, there no need to provide any additional param decorators for injection data from the HTTP request. It's just a small controller overview, there are a lot of other possibilities.You can read more in [docs](https://odi.gitbook.io/core/basics/controller).


### Dependency Injection
Odi has powerful dependency injection mechanism out of the box. 
(Let's imagine that we already have `FooRepository`)

```typescript
//foo.service.ts
@Service()
export class FooService {
​
    @Autowired()
    repository: FooRepository;
​
    public getFoo(id: string) {
        return this.repository.findOne(id);
    }​
}


//foo.controller.ts
@Controller('foo')
export class OrderController extends IController {
​
    @Autowired()
    fooService: OrderService;
    
    @Get async '{id}' (id: string) {
        const foo = this.fooService.getFoo(id);
        
        if(!foo)
            return NotFound();

        return foo;
    }​
} 
```

As you can see, all dependencies will be automatically provided to all application components.

Currently, Odi support 3 ways of injection: 
* By constructor
* By property
* By method

Classes that are not Odi components can participate in DI. You can simply define behaviour with preset properties and constructor args.

```typescript
class Pet {
    ...
}

​define(Pet)
    .set('default', {
        constructorArgs: [...],        
        props: {...},
        type: 'singleton'
    })
    .set('special', {
        constructorArgs: [...],        
        props: {...},
        type: 'scoped'
    });
```
### DTO
It's a common scenario when web server should validate data before processing. DTO can optimize and automate this process.

```typescript
@Data()
export class TodoDTO {
   
    @MaxLength(80)
    title: string;
    
    @IsOptional()
    @MaxLength(255)
    desctiption: string;
}
```

Then, DTO class should be added as an argument for the controller method

```typescript
@Controller('todo')
export class TodoController extends IController {

    @Autowired()
    todoService: TodoService;   
     
    @Post async index(payload: TodoDTO) {
        ...
    }​
}
```
And it's all! Odi will automatically inject the validated request body in this argument. If there are some errors during validation, 400 status code will be sent with errors description.

Odi provides a wide set for DTO description, supporting nested DTOs, arrays, enums and etc.

### To Sum up
It was a small overview of some features. If you interested in more, check the [Docs](https://odi.gitbook.io/core/).

 
## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)
