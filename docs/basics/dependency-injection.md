# Dependency Injection

## Overview

Odi has powerful dependency injection mechanism out of the box. 

For example we have service and class for some calculations. Our goal is to inject those dependencies into `@Controller`  and `@Service`

### Code

Calculation class:

```typescript
import { define } from "odi";

class DiscountCalculator {

    discount: number;

    getDiscount(total: number) {
        return (this.discount * total) / 100;
    }

}

define(DiscountCalculator)
        .set('default', { props: { discount: 20 }});
```

Service class:

```typescript
import { Service, Autowired } from "odi";
import { OrderRepository } from "./order.repository";
import { DiscountCalculator } from "./discounter.ts"

@Service()
export class OrderService {

    @Autowired()
    repository: OrderRepository;

    @Autowired()
    discounter: DiscountCalculator;

    public getDiscount(orderId: string) {
        const order = await this.repository.findOne(orderId);
        
        if(!order)
            throw Error(`No order with id - ${orderId}`);
            
        return this.discounter.getDiscount(order.total);
    }

}
```

Controller class:

```typescript
import { Get, Controller, IController, Autowired } from "odi";
import { OrderService } from "./order.service";

@Controller('/orders')
export class OrderController extends IController {

    @Autowired()
    orderService: OrderService;

    @Get async '/:orderId' (orderId: string) {
        const multiplier = this.getQueryParam('multiplier');
        const discount = await this.orderService.getDiscount(orderId);
        
        return multiplier * discount;
    }

}
```

### Explanations

All dependencies will be automatically injected in proper order. `DiscountCalculator` component was defined with predefined prop `discount` , as default instance for injection. 

OrderService property `discounter` will be an instance of `DiscountCalculator` class and `discount` value will be `10`. By default, `DiscountCalculator` will be singleton, but this behavior can be changed.

## Decorators

There is only 1 decorator for **DI**:

`@Autowired(id?: string)` - sets method or property which will be provided with dependencies. Have one optional parameter id with default value `"default"`.  If you use `define` method for configuring instances, autowired will find that instance by passed id for injection.

{% hint style="warning" %}
Decorator for parameters will be added in next small release. 
{% endhint %}

## Injection

Currently there are three supported types of injection.

* By constructor
* By property
* By method

{% hint style="success" %}
Note, in next major release injection by **Providers** and **Factories** will be added.
{% endhint %}

### Constructor

Every argument of constructor will be automatically injected by type. Primitive or unresolved types will be ignored. For more control over the process, **property** or **method** injection should be used.

### Property

### Method

