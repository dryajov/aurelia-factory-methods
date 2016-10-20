import 'reflect-metadata';

import chai = require('chai');
import chaiAsPromissed = require('chai-as-promised');

chai.use(chaiAsPromissed);

import {assert}         from 'chai';
import {SinonSpy, spy}  from 'sinon';

import {Container, autoinject, inject}  from 'aurelia-dependency-injection';
import {singleton, transient}   from '../lib/registration';

import {Hello} from './config-class';

describe('Singleton Registration', () => {
  let container: Container;
  let app: App;

  class Logger {
    public static counter: number = 0;
    public name: string = 'Logger';

    constructor() {
      Logger.counter++;
    }
  }

  class Connection {
    public static counter: number = 0;
    public name: string = 'Connection';

    constructor() {
      Connection.counter++;
    }
  }

  @autoinject()
  class App {
    constructor(public connection: Connection, public logger: Logger) {
    }
  }

  @autoinject()
  class Config {
    @singleton()
    public getLogger(): Logger {
      return new Logger();
    }

    @singleton()
    public getConnection(): Connection {
      return new Connection();
    }
  }

  before(() => {
    Logger.counter = 0;
    Connection.counter = 0;
  });

  container = new Container();
  beforeEach(() => {
    app = container.get(App);
  });

  it('should inject singleton factory methods', () => {
    assert.instanceOf(app.logger, Logger, 'app.logger should be an instance of Logger');
    assert.instanceOf(app.connection, Connection, 'app.connection should be an instance of Connection');
  });

  it('should inject only once', () => {
    assert.equal(Logger.counter, 1, 'Logger counter should equal no-factory-methods');
    assert.equal(Connection.counter, 1, 'Connection counter should equal no-factory-methods');
  });
});

describe('Transient Registration', () => {
  let container: Container;
  let app: App;

  class Logger {
    public static counter: number = 0;
    public name: string = 'Logger';

    constructor() {
      Logger.counter++;
    }
  }

  class Connection {
    public static counter: number = 0;
    public name: string = 'Connection';

    constructor() {
      Connection.counter++;
    }
  }

  @autoinject()
  class App {
    constructor(public connection: Connection, public logger: Logger) {
    }
  }

  @autoinject()
  class Config {
    @transient()
    public getLogger(): Logger {
      return new Logger();
    }

    @transient()
    public getConnection(): Connection {
      return new Connection();
    }
  }

  container = new Container();
  container.registerTransient(App);

  before(() => {
    Logger.counter = 0;
    Connection.counter = 0;
  });

  beforeEach(() => {
    app = container.get(App);
  });

  it('should inject transient factory methods', () => {
    assert.instanceOf(app.logger, Logger, 'app.logger should be an instance of Logger');
    assert.instanceOf(app.connection, Connection, 'app.connection should be an instance of Connection');
  });

  it('counter should be 2', () => {
    assert.equal(Logger.counter, 2, 'Logger counter should equal 2');
    assert.equal(Connection.counter, 2, 'Connection counter should equal 2');
  });

  it('counter should be 3', () => {
    assert.equal(Logger.counter, 3, 'Logger counter should equal 3');
    assert.equal(Connection.counter, 3, 'Connection counter should equal 3');
  });
});

describe('Dependencies in factory methods', () => {
  let container: Container;
  let app: App2;
  let loggerSpy: SinonSpy = spy();

  class Logger {
    public static counter: number = 0;
    public name: string = 'Logger';

    constructor() {
      Logger.counter++;
    }
  }

  class Connection {
    public static counter: number = 0;
    public name: string = 'Connection';

    constructor() {
      Connection.counter++;
    }
  }

  @autoinject()
  class App2 {
    constructor(public connection: Connection) {
    }
  }

  @autoinject()
  class Config {
    @singleton()
    public getLogger(): Logger {
      return loggerSpy.call(undefined);
    }

    @singleton()
    public getConnection(logger: Logger): Connection {
      return new Connection();
    }
  }

  container = new Container();
  beforeEach(() => {
    app = container.get(App2);
  });

  it('should inject Logger into getConnection', () => {
    assert.isOk(loggerSpy.called, 'Logger should have been created');
  });
});

describe('Override key', () => {
  let container: Container;
  let app: App;

  class Logger {
    public static counter: number = 0;
    public name: string = 'Logger';

    constructor() {
      Logger.counter++;
    }
  }

  class AnotherLogger extends Logger {
    constructor() {
      super();
      this.name = 'AnotherLogger';
    }
  }

  class Connection {
    public static counter: number = 0;
    public name: string = 'Connection';

    constructor() {
      Connection.counter++;
    }
  }

  class AnotherConnection extends Connection {
    constructor() {
      super();
      super.name = 'AnotherConnection';
    }
  }

  @autoinject()
  class App {
    constructor(public connection: AnotherConnection, public logger: AnotherLogger) {
    }
  }

  @autoinject()
  class Config {
    @singleton(AnotherLogger)
    public getLogger(): Logger {
      return new AnotherLogger();
    }

    @singleton(AnotherConnection)
    public getConnection(): Connection {
      return new AnotherConnection();
    }
  }

  before(() => {
    Logger.counter = 0;
    Connection.counter = 0;
  });

  container = new Container();
  beforeEach(() => {
    app = container.get(App);
  });

  it('Key should override return value type', () => {
    assert.instanceOf(app.logger, AnotherLogger, 'app.logger should be an instance of Logger');
    assert.instanceOf(app.connection, AnotherConnection, 'app.connection should be an instance of Connection');
  });
});

describe('Promise inject', () => {
  let container: Container;
  let app: App;

  class Logger {
    public static counter: number = 0;
    public name: string = 'Logger';

    constructor() {
      Logger.counter++;
    }
  }

  class Connection {
    public static counter: number = 0;
    public name: string = 'Connection';

    constructor() {
      Connection.counter++;
    }
  }

  @inject(Connection, Logger)
  class App {
    constructor(public connection: Promise<Connection>, public logger: Promise<Logger>) {
    }
  }

  @autoinject()
  class Config {
    @singleton(Logger)
    public getLogger(): Promise<Logger> {
      return Promise.resolve(new Logger());
    }

    @singleton(Connection)
    public getConnection(): Promise<Connection> {
      return Promise.resolve(new Connection());
    }
  }

  before(() => {
    Logger.counter = 0;
    Connection.counter = 0;
  });

  container = new Container();
  beforeEach(() => {
    app = container.get(App);
  });

  it('should resolve asynchronously', () => {
    assert.eventually.instanceOf(app.logger, Logger, 'app.logger should be an instance of Logger');
    assert.eventually.instanceOf(app.connection, Connection, 'app.connection should be an instance of Connection');
  });
});

describe('Config class inject', () => {
  let container: Container;
  let app: App;

  @autoinject()
  class App {
    constructor(public hello: Hello) {
    }
  }

  container = new Container();
  beforeEach(() => {
    app = container.get(App);
  });

  it('Should resolve from config class', () => {
    assert.isOk(app.hello.msg === 'Hello!', `should be 'Hello!'`);
  });
});

describe('Symbol Registration', () => {
  let container: Container;
  let app: App;
  const connectionSymbol: symbol = Symbol('connection');
  const loggerSymbol: symbol = Symbol('logger');

  class Logger {
    public static counter: number = 0;
    public name: string = 'Logger';

    constructor() {
      Logger.counter++;
    }
  }

  class MyLogger extends Logger {
    constructor() {
      super();
      this.name = 'my-logger';
    }
  }

  class Connection {
    public static counter: number = 0;
    public name: string = 'Connection';

    constructor() {
      Connection.counter++;
    }
  }

  class MyConnection extends Connection {
    constructor() {
      super();
      this.name = 'my-connection';
    }
  }

  @inject(connectionSymbol, loggerSymbol)
  class App {
    constructor(public connection: Connection,
                public logger: Logger) {
    }
  }

  @autoinject()
  class Config {
    @singleton(loggerSymbol)
    public getLogger(): Logger {
      return new MyLogger();
    }

    @singleton(connectionSymbol)
    public getConnection(): Connection {
      return new MyConnection();
    }
  }

  before(() => {
    Logger.counter = 0;
    Connection.counter = 0;
  });

  container = new Container();
  beforeEach(() => {
    app = container.get(App);
  });

  it('should inject singleton factory methods', () => {
    assert.instanceOf(app.logger, Logger, 'app.logger should be an instance of Logger');
    assert.instanceOf(app.connection, Connection, 'app.connection should be an instance of Connection');
  });
});
