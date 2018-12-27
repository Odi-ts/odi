# Core Concepts

## **Overview**

Imagine that you have a common CRUD server application. Or you have a huge server with non trivial logic. You want to have clear code, that can be supported and updated with less effort and more fun. These concepts can help with that: **Single Resposibility, Loosely Coupled Code, Segregation Principle** and **Substitution Principle.**

## Paradigm

**Odi** uses Object Oriented and Declarative paradigm. TypeScript provides syntactic structures for it. _Classes_, _Interfaces_, _Abstract Classes_, _Generics_ and etc. for **OOP**. And _Decorators_ for **Declarative.**

But functional programming also takes part in development.

## **Architecture**

Lets take a look on common **Odi** architecture, including database \([TypeORM](http://typeorm.io/#/) integration\):

![](../.gitbook/assets/untitled-diagram%20%281%29.png)

For responsibility, it can be divided into next layers:

- **Controller** - network layer
- **Service** - application \(logic\) layer
- **Repository** - database actions layer
- **Model** - data representation layer

There can be other components on every layer, but we are looking only on a basic example.

### Controller

The main purpose of a controller, is to act as a communication gateway for the client. There should be actions, that only connect with the network or deal with the http responsibility. For example: sending different HTTP statuses, handling websocket events, preprocessing requests, body validation, user verification, cookies and etc.

What it shouldn't do is interact with a database.

### Service

The Business logic center. It is the place where you should forget about HTTP statuses, cookies etc. Only your application logic should live here. Still no direct interaction with the database. Different repositories can be combined for implementing required processes \(like transactions, calculations and etc.\).

### Repository

Definitely about the database. Interact \(search, create, update and anything else\) with data in the database. Custom or standard repositories can be used. One repository must reference to only one model. Associate it with database interaction only.

### Model

It's only about storing and linking data. Basic class for representation in the database. Describe fields \(type, nullability, relation and etc\) for storing in database.

Opposite example: implementing business logic methods or validations.

## Environment

There are no special requirements for running applications based on Odi. It is just Node.js. But there are a few things we need to change with the TypeScript configuration.

Enable the following settings in `tsconfig.json`

```javascript
 "emitDecoratorMetadata":  true,
 "experimentalDecorators":  true
```

These settings allow us to properly handle **Dependency Injection** and many other things that are connected with runtime types. Without these options enabled, most of the core features will be disabled.

In future versions there may be changes as the CLI tool will be released.
