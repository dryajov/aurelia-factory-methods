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
