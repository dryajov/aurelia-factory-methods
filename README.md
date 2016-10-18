# Enable @singleton and @transient decorators on class methods

[![CircleCI](https://circleci.com/gh/dryajov/aurelia-factory-methods/tree/master.svg?style=svg)](https://circleci.com/gh/dryajov/aurelia-factory-methods/tree/master)

This module allows using the `@transient` and `@singleton` decorators on class methods, which in turn allows using factories to create dependencies that decouple registration.

## What's the use case?

The main use case is creating configuration classes that allow registering dependencies implicitly through factory methods, rather than explicitly using the constructor.

Consider the following example:

```javascript
// app.ts

import 'reflect-metadata';

import {autoinject, Container} from 'aurelia-dependency-injection';
import {Logger, Config} from './config-class1';

@autoinject
export class App {
  constructor(private config: Config, public logger: Logger) {
  }
}

let container = new Container();
let app = container.get(App);

console.log(`Type of Logger is: ${app.logger.toString()}`);

// config.ts
import {autoinject, Container} from 'aurelia-dependency-injection';

export class Logger {
  public toString(): string {
   return 'Logger';
  }
}

@autoinject()
export class Config {
  constructor(container: Container) {
    container.registerSingleton(Logger);
  }
}
```

In the above snippet, we have a config class that registers a `Logger` in the constructor and an `App` that consumes the logger, however note the fact that we have to explicitly request the config class. This creates tight coupling between the consuming app and the configuration class. This isn't a big issue when your configuration is contained within an app, but it is, when you're trying to consume third party modules that provide their own configuration. The fact that you have to _know_ which class to request as opposed to the class running implicitly as part of the import process of a module creates this tight coupling and makes distributing modules that provide configuration through DI that much harder.

A better approach is having the configuration class provide dependencies through factory methods, this removes the need to _explicitly_ request the configuration class, and instead, running one of the decorators `@singleton` or `@transient` as part of the import process of the third party module, should be enough to register the required dependencies. E.g:

```javascript
// app.ts
import 'reflect-metadata';

import {autoinject, Container} from 'aurelia-dependency-injection';
import {Logger} from './config-class';

@autoinject
export class App {
  constructor(public logger: Logger) {
  }
}

let container = new Container();
let app = container.get(App);

console.log(`Type of Logger is: ${app.logger.toString()}`);

// config.ts
import {autoinject} from 'aurelia-dependency-injection';
import {singleton} from '../../lib/registration';

export class Logger {
  public toString(): string {
    return 'Logger';
  }
}

@autoinject()
export class Config {
  @singleton()
  public getLogger(): Logger {
    return new Logger();
  }
}

````

Note the absense of an explicit `Config` class, instead _the dependency_ (`Logger`) is requested, which triggers its registration with the container in an implicit manner.

## API

`@singleton(keyOrRegisterInChild?: any, registerInChild: boolean = false)`: This will mark a `method` as a factory that will provide a _singleton_ dependency that is registered either as the return type of the method or as the type of the key passed as the first argument to the decorator. E.g:

```javascript
  @singleton()
  public getLogger(): Logger {
    return new Logger();
  }

```

The above method, will be triggered when a `Logger` is requested from the `container`. The method return type is the key that is used by default to register the dependency, it can be overridden by an explicit key provided as the first parameter of the decorator. The second parameter of the decorator will signal if the dependency should be registered with the _parent_ container or the _current_ container.

_Note: This should be fully backwards compatible with aurelia-dependency-injection and should work as expected when used on classes_.

`transient(key?: any)`: This will mark a `method` as a factory that will provide a _transient_ dependency that is registered either as the return type of the method or as the type of the key passed as the first argument to the decorator. E.g:

```javascript
  @transient(Logger)
  public getLogger(): MyOtherLogger {
    return new MyOtherLogger();
  }
```

The above method, will be triggered any time a `Logger` is requested from the `container`. The decorator is passed an explicit key of type `Logger` that is used to register the dependency, overriding the return type (`MyOtherLogger`) of the factory.

_Note: This should be fully backwards compatible with aurelia-dependency-injection and should work as expected when used on classes_.
