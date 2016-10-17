import 'reflect-metadata';

import {assert}         from 'chai';
import {SinonSpy, spy}  from 'sinon';

import {Container, autoinject}  from 'aurelia-dependency-injection';
import {singleton, transient}   from '../lib';

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
    assert.equal(Logger.counter, 1, 'Logger counter should equal 1');
    assert.equal(Connection.counter, 1, 'Connection counter should equal 1');
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
