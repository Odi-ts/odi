# DTO

## Data Validation

**DTO**\(_Data Transfer Object_\) __is used for parsing and validating data from request body. DTOs always used with **Controllers**.

### Overview

Let's imagine that we need to implement this API.

{% tabs %}
{% tab title="Request" %}
Accepts `application/json` in following format:

```typescript
{
  title: string,
  description: string
}
```

With following limitations:

* `title` - required, max length - 80 chars. 
* `description` - optional, max length - 255 chars.
{% endtab %}

{% tab title="Response" %}
Return id in response

```typescript
10125
```
{% endtab %}
{% endtabs %}

Let's start from **DTO** class

```typescript
import { Data, IsOptional, MaxLength } from "odi/dto";

@Data()
export class TodoDTO {

    @MaxLength(80)
    title: string;

    @IsOptional()
    @MaxLength(255)
    desctiption: string;
    
}
```

And controller with some predefined service

```typescript
import { Controller, IController, Post, Autowired } from "odi";
import TodoService from "./todo.service";

@Controller('/todo')
export class TodoController extends IController {
    
    @Autowired()
    todoService: TodoService;   
         
    @Post async index(payload: TodoDTO) {
        const { id } = await this.todoService.create(payload);
                
        return id;
    }

}
```

Data from request body will be automatically injected and validated. If validation failed - errors will be automatically sent to client.

### Decorators

There are set of decorators for convenient data validation. If you have special needs on validation, you can always implement your own decorator \(read more in advanced\).

Decorators can be grouped by data type

#### General

This decorators can be applied to any type of data.

* `@IsOptional()` - set field optional \(_by default, all fields are required_\) 
* `@Const(value: any)` -  field is valid if it is deeply equal to the passed value 
* `@Deafault(value: any)` -  default value for field, if it not exists 
* `@Enum(enumrable: any[])` -  data is valid if it is deeply equal to one of items in the array 
* `@Nested()` - validate nested DTO class in field, otherwise it will be ignored

Decorator `@Nested` should be applied on field, which type is DTO class.

## Flow

Every controller method, that contains **DTO** class as argument will be automatically provided with validated and mapped data. Validation will be performed before controller method call.

