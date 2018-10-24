# Middleware

## Overview

Middleware is useful for adding other libs for additional features. Local middleware will be replaced with **AOP** soon.

{% hint style="danger" %}
**Note, current middleware API is experimental. There can be breaking changes in next release.**
{% endhint %}

For now, middleware is pretty trivial. You can use **@Middleware** decorator and define it on route or on whole controller.

Simple example: 

```typescript
import { Controller, IController, Get, Middleware, IRouterContext } from "odi";

const logUrl= (context: IRouterContext, next: () => Promise<any>) => {
    console.log(context.request.url);
    next();
}

@Controller()
export class SampleController extends IController {
      
    @Middleware(logUrl)
    @Get index() {
        return `Hello, world from index !`;
    }

    @Get about() {
        return `Hello, world from about !`;
    }
}
```

## Decorators

There are 2 different decorators for middleware purposes. 

<table>
  <thead>
    <tr>
      <th style="text-align:left">Decorator</th>
      <th style="text-align:left">Arguments</th>
      <th style="text-align:left">Reference</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="text-align:left"><b>@CMiddleware</b>
      </td>
      <td style="text-align:left"><em>(...functions: MiddlewareFunction[])        </em> 
      </td>
      <td style="text-align:left">Set middleware for whole controller. Accepts unlimited number of middleware
        functions.</td>
    </tr>
    <tr>
      <td style="text-align:left"><b>@Middleware</b>
      </td>
      <td style="text-align:left"><em>(...functions: MiddlewareFunction[])</em>  <em>                                                       </em>
      </td>
      <td style="text-align:left">
        <p>Set middleware for only one path. Accepts</p>
        <p>unlimited number of middleware functions.</p>
      </td>
    </tr>
  </tbody>
</table>Don't forget about function context. You should set it manually or use lambda functions instead.

## Purposes

Unfortunately, due to middleware structure, dependency injection cannot be applied for middleware functions. It should be used only for request data preprocessing, parsing and etc. 

{% hint style="success" %}
Check out future releases for **AOP**

AOP will solve most middleware cases
{% endhint %}



