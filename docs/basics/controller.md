# Controller

## Routing

Controllers is about routing. Methods of controller will be mapped to web server paths. Data from method`return` will be send as answer.

For creating controller - you need to use `@Controller` decorator and `IController` class. Decorator sets component type, so DI composer can detect for what this class will be used.

### Overview

```typescript
import { Controller, IController, Get, Post, All, Route, Method } from "odi";
import { SampleDTO } from "./sample.dto.ts";

@Controller('sample')
export class SampleController extends IController {

    @Get '{id}' (id: string) {
        return `Your id is - ${id}`;
    }

    @Get index() {
        return `Hello world !`;
    }
    
    @RoutePost('save') 
    saveSample(payload: SampleDTO) {
        return `Your sample name is - ${payload.name}`;
    }

    @All all() {
        return `Your HTTP method is - ${this.request.method}`;
    }

    /* Using @Route decorator */    
    @RouteGet(Method.GET, 'somewhere/hello')
    anyMethodName() {
        return `Hello from other route !`;
    }
}
```

**SampleController** will be mapped to following routes:

* /sample/{id}
* /sample
* /sample/save
* /sample/all
* /sample/somewhere/hello

So, as you see, method names participate in route building. Also, `@Controller` decorator accepts base path as argument. 

Information from request **body** or request **params** will be automatically injected in method, so you don't need to write any additional code for those purposes.



### Decorators

There is fixed set of decorators for routing.

* `@Controller(basePath: string = "/")` __- sets class as controller. Accepts only one optional argument - base path. \(I.E: prefix for all routes in controller\). 
* `@Route(method: Method, path: string = "/")` -  sets method of controller as route handler. Accepts two arguments. HTTP method and path. But path also got default value - "/"

{% hint style="info" %}
Note, **@Route** decorator got short version. Check it below.
{% endhint %}

And set of decorators for binding class methods of controller, to routes such as method name. Decorator name are similar to HTTP method. Method decorated by `@All` decorator accepts all HTTP methods.

* `@All` 
* `@Get`
* `@Del`
* `@Put`
* `@Post`
* `@Patch`

#### Route Shorthand

Also, there is available shorthand for `@Route` decorator, to omit _method_ parameter. All those decorators accept path as a parameter. Default value is - "/". 

* `@RouteAll`
* `@RouteGet`
* `@RouteDel`
* `@RoutePut`
* `@RoutePost`
* `@RoutePatch`

{% hint style="warning" %}
Note, if method was decorated by both **@Route** and **@Get** \(or others like Post, All, ..etc\). Metadata from **@Route** will be in priority during build time.
{% endhint %}

### Route definition

In all routing decorators, leading slash can be omitted.

`@RouteGet('foo')` is equals to `@RouteGet('/foo')` 



Another thing is route params. **Odi** provides special syntax for it

`@RouteGet('foo/{id}')` is equals to `@RouteGet('/foo/:id')`  

There are no limitations, so both variants can be used and are valid for the build process.

### Data Injection

As you can see in Controller preview, you can directly inject data from request into route method as arguments.

Supported types of data:

* Route parameter 
* Request body

To inject route parameter, just specify parameter name. That will be enough. Only `string` type is supported for now. You can inject unlimited number of route parameters.

For example, to get route parameter **id:**

```typescript
@RouteGet('{id}')
getSomething(id: string) {
    return `Your id is - ${id}`;
}
```

To inject body, DTO class should be specified as argument. You can use any name for argument, but type of argument should be DTO class, that is decorated by **@Data** decorator.

Probably, you can inject unlimited numbers of DTOs, but there is no reason to do it. As you get only one request body, there should be only one DTO.

```typescript
@Post save(payload: SampleDTO) {
    return `Your sample name is - ${payload.name}`;
}
```

Check **DTO** docs for more details:

{% page-ref page="dto.md" %}

### 

### Tips and Techniques

Decorators without arguments \(I.E: Get, Post, Put and etc.\) are preferred to use. But it's common situation, when you need to setup same routes for different HTTP methods. You can't do it via binding method by name directly, as method names should be unique. 

There are several ways to solve this situation:

Using **@All** decorator

```typescript
import { Controller, IController, All } from "odi";

@Controller('todo')
export class TodoController extends IController {

    @All '{id}' (id: string) {
        const method = this.request.method;                  
        // Set your logic depending on method.
    }
    
}
```

Using short versions of **@Route** decorator

```typescript
import { Controller, IController, RouteGet, RouteDel } from "odi";

@Controller('todo/{id}')
export class TodoController extends IController {

    @RouteGet()
    getTodo(id: string) {
        // Get todo...
    }
    
    @RouteDel()
    delTodo(id: string) {
        // Delete todo...
    }
    
}
```

Using only **@Route** decorator

```typescript
import { Controller, IController, Route, Method } from "odi";

@Controller('todo/{id}')
export class TodoController extends IController {

    @Route(Method.Get)
    getTodo(id: string) {
        // Get todo...
    }
    
    @Route(Method.Del)
    delTodo(id: string) {
        // Delete todo...
    }
    
}
```

{% hint style="info" %}
Note, in feature releases, new Controller API will be added, to handle such situations, easily.
{% endhint %}

## Actions

There are 3 helper actions that can be used in controllers.

* `Ok(body?: any)` - set status code to 200 and send body

* `BadRequest(body?: any)` - set status code to 400 and send body

* `NotFound(body?: any)` - set status code to 404 and send body

*  `Forbidden(body?: any)` - set status code to 403 and send body

## Abstract Controller

Every controller must be extended from **IController** class. It provides useful methods that can be used for interaction with request data, cookies and other http thing. Also there are methods, that allows to work with **user**.

### Methods and props \(HTTP\) 

There are set of methods to work with headers, cookies, and other HTTP parameters/fields. without any additional calls or interacting _raw request/ raw response_ directly.

{% hint style="info" %}
Note, new methods will be added in next major release for convenient work.
{% endhint %}

#### Headers

There are 3 methods to work with **headers:**

* `getHeader(key: string)` - return header value by key 
* `setHeader(key: string, value: string)` - set header value 
* `getHeaders()` - return all headers as object 

#### Cookies

There are 2 methods to work with **cookies:**

* `getCookie(key: string)` - get cookie value by key 
* `setCookie(key: string, value: string)`  - set cookie value by key 

#### Query

There are 3 methods to work with **query:**

* `getQueryParam(key: string)` - return query parameter value by key 
* `getQuery()`  - return all query parametes as object 

#### Route Parameters

There are only 1 method to work with **route parameters**:

* `getParam(key: string)` - return query parameter value by key

But if you need full list or additional information, you can always reference to raw http request. Read below about it.

#### Raw HTTP Request/Response

Information about request/response objects persist like a properties of class instance.

* `request` - wrapped http request 
* `response` - wrapped http response

  

### Other methods and props

There are few other methods

* `redirect(url: string)` - redirect request to another url 

And property for user

*  `user` - return user instance class

For more details check **authentication** docs:

{% page-ref page="authentication.md" %}



## Flow

New instance of controller is created for each request. It allows to work conveniently and to avoid repeated code in your application. 

### **Dependency Injection**

Controller can participate in **DI**, so you can use all injection strategies.

Read more about strategies in **DI** docs:

{% page-ref page="dependency-injection.md" %}

Controller can be treated like a root node in dependencies tree. For performance optimization and zero overhead, **Controller** does not support dynamic dependencies. It will be created only once, on start of application. Other instances will copy only references of injected dependencies. Only context will be set.

### Lifecycle

When route handler is triggered by client request, new instance of controller will be created using **copy** from original instance. Then methods that is responsible for route will be called with parsed and injected method parameters. Result from method \(I.E: return value\) will be send as answer.

{% hint style="info" %}
Note, in future major release, **AOP** will be added to **Odi**, so lifecycle behaviour can be changed. But no braking changes.
{% endhint %}

