# Controller

## Routing

Controllers serve as a simple yet powerful routing mechanism. Controller methods are mapped to webserver paths. The value returned by the method is sent as the response.

In order to create a Controller, you must use the `@Controller` decorator and inherit the `IController` class. The decorator sets the component type, so the DI \(dependency injection\) container can detect what the class will be used for.

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

**SampleController** produces the following routes:

* /sample/{id}
* /sample
* /sample/save
* /sample/all
* /sample/somewhere/hello

As you can see, method names are taken into account when constructing the routing table. Also, the `@Controller` decorator accepts a base path as an argument.

Information from the request **body** and request **params** is automatically injected into the method via `this`, so no further declaration is necessary.

### Decorators

* `@Controller(basePath: string = "/")` \_\_- sets a class as a controller. Accepts only one optional argument: the base path, which prefixes all routes in a controller.
* `@Route(method: Method, path: string = "/")` -  sets a method of a controller as a route handler. Accepts two arguments: the HTTP method and the path. The default path is "/".

{% hint style="info" %}
Note: There is an optional shorthand for the **@Route** decorator. Keeping reading to find out more.
{% endhint %}

There is also a set of decorators for binding class methods of a controller to specific methods of routes. The decorator names are similar to the HTTP method names. Methods decorated by the `@All` decorator accept all HTTP methods.

* `@All` 
* `@Get`
* `@Del`
* `@Put`
* `@Post`
* `@Patch`

#### Route Shorthand

There is a shorthand available for the `@Route` decorator which allows you to omit the _method_ parameter. All of the following decorators accept the path as a parameter. The default value is "/".

* `@RouteAll`
* `@RouteGet`
* `@RouteDel`
* `@RoutePut`
* `@RoutePost`
* `@RoutePatch`

{% hint style="warning" %}
Note: If a method is decorated with both the **@Route** and **@Get** headers \(or others like Post, All, etc.\), metadata from **@Route** will take priority at build time.
{% endhint %}

### Route definition

In all routing decorators, the leading slash can be omitted.

`@RouteGet('foo')` is equivalent to `@RouteGet('/foo')`

**Odi** provides special syntax for routing parameters.

`@RouteGet('foo/{id}')` is equivalent to `@RouteGet('/foo/:id')`

There are no limitations and both variants can be used and are valid for the build process.

### Data Injection

As you can see in the Controller preview, you can directly inject data from the request into the route method as arguments.

Supported data type:

* Route parameter
* Request body
* Request query parameters 

To inject a route parameter, simply specify the parameter name. Only the `string` type is supported for now. You can inject an unlimited number of route parameters.

For example, to get the route parameter **id:**

```typescript
@RouteGet('{id}')
getSomething(id: string) {
    return `Your id is - ${id}`;
}
```

To inject the body or the query parameters, a DTO class should be specified as an argument. You can use any name for this argument, but the type of the argument should be a DTO class that is decorated by the **@Data** or **@Query** decorator.

```typescript
@Post save(body: BodyDTO, query: QueryDTO) {
    return `Your name is - ${body.name}, and your age is - ${query.age}`;
}
```

Read the **DTO** docs for more details:

{% page-ref page="dto.md" %}

### Tips and Techniques

Decorators without arguments \(e.g. Get, Post, Put\) are preferred. However, there is a common situation where multiple HTTP methods must be available for the same route. In this situation, you cannot bind the method by name, as method names should be unique.

There are several ways to resolve this situation:

Using the **@All** decorator

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

Using short versions of the **@Route** decorator

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

Using only the **@Route** decorator

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
Note: In feature releases, a new Controller API will be added to handle such situations easily.
{% endhint %}

## Actions

There are 3 helper actions that can be used in controllers.

* `Ok(body?: any)` - set status code to 200 and send body
* `BadRequest(body?: any)` - set status code to 400 and send body
* `NotFound(body?: any)` - set status code to 404 and send body
* `Forbidden(body?: any)` - set status code to 403 and send body

## Abstract Controller

Every controller must extend the **IController** class. It provides useful methods that can be used for interaction with request data, cookies and other http thing. Also there are methods, that allows to work with **user**.

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

Can be accessed and validated using DTO.

{% page-ref page="dto.md" %}

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

* `user` - return user instance class

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

