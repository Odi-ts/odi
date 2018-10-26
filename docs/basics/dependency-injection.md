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

There are 2 decorators for **DI**:

* `@Autowired(id?: string)` - sets method or property which will be provided with dependencies. Have one optional parameter id with default value `"default"`.  If you use `define` method for configuring instances, autowired will find that instance by passed `id` for injection. Note, `id` will work only for class properties, methods will ignore it.  
* `@Inject(id?: string)` - define dependency by `id` for parameter. It can be used for constructor and method injection. If `default` instance is needed, just omit usage of this decorator.

{% hint style="success" %}
View examples below
{% endhint %}

## Injection

Currently there are three supported types of injection.

* By constructor
* By property
* By method

{% hint style="success" %}
Note, in next major release injection by **Providers** and **Factories** will be added.
{% endhint %}

Example of  equivalent injection in 3 different ways: **Constructor**, **Property**, **Method**

### Constructor

Every argument of constructor will be automatically injected by type. Primitive or unresolved types will be ignored. For more control over the process **method** injection should be used.

```typescript
import { Service, Inject } from "odi";
import { FoodManager } from "./food.manager";
import { MedicineManager } from "./medicine.manager";

@Service()
export class PetService {

    constructor(
        readonly food: FoodManager,
        @Inject('pets') readonly medicine: MedicineManager 
    ) {}

}
```

`FoodManager` and `MedicineManager` dependencies will be automatically injected. `MedicineManager` will be injected by `pets` id.

### Property

Only properties that decorated by `@Autowired()` will be injected.

```typescript
import { Service, Inject } from "odi";
import { FoodManager } from "./food.manager";
import { MedicineManager } from "./medicine.manager";

@Service()
export class PetService {

    @Autowired()
    food: FoodManager;
    
    @Autowired('pets'):
    medicine: MedicineManager;
    
}
```

### Method

Only properties that decorated by `@Autowired()` will be injected. But `id` parameter of  `@Autowired()` will be ignored. For classifying dependencies use `@Inject()` decorator. Any method can be used for injection.

```typescript
import { Service, Inject } from "odi";
import { FoodManager } from "./food.manager";
import { MedicineManager } from "./medicine.manager";

@Service()
export class PetService {

    @Autowired()
    injectManagers(food: FoodManager, @Inject('pets') medicine: MedicineManager ) {
        ...
    }
    
}
```

Autowired Methods will be called on instance initialization.

## Dependencies definition

Definition method is fully typified. Constructor parameters and properties can be manually setted during definition.

Use `define` function for it

```typescript
import { define } from "odi";

class Pet {
    ...
}

define(Pet)
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

{% hint style="success" %}
Other methods \(ways\) of definition will be added in next major release.
{% endhint %}

Unlimited instance types can be defined using this way. Each instance is defined by `id` \(this id can be passed into `@Autowired` and/or `@Inject` decorators for proper instance type injection\).

### Details

Typing for `Foo` class in `define` function:

```typescript
import { define } from "odi";
import { Baz } from "./baz";

class Foo {
    foo: number;
    lorem: boolean; 
    
    constructor(bar: string, baz: Baz, far: boolean) {
        ...
    }
    
}
```

And define signature with typings for this class:

```typescript
define(Foo)
    .set(id: string, {
        type?: 'singleton' | 'scoped',
        constructorArgs?: [
            (bar| undefined), 
            (Baz | undefined), 
            (far| undefined)
        ],
        props?: {
            foo?: number,
            lorem?: boolean 
        }
    })
    .set(...)
    ...
```

Properties or constructor arguments can be predefined. If you want to predefine only one constructor argument and automatically inject others, just set the value to undefined.

For example, `baz`  must be injected automatically, but `bar` and `far` got predefined values:

```typescript
define(Foo)
    .set(id: 'default', {        
        constructorArgs: ["Hello, world !", undefined, false]
    })
```

Args that got value `undefined` will be automatically injected. 

Same thing with props. If property needs to be injected automatically, just omit it

```typescript
define(Foo)
    .set(id: 'default', {        
        props: {
            foo: 2
        }
    })
```

### Typization

`props` accepts only properties, not methods, so it's fully save. Same thing with `constructorArgs`. It's strict tuple. 

Example in _VS Code_

![](../.gitbook/assets/image%20%282%29.png)

![](../.gitbook/assets/image.png)



