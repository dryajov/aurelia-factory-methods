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
