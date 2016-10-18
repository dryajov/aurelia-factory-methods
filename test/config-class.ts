/**
 * Created by dryajov on 10/17/16.
 */

import {
  autoinject,
  Container,
} from 'aurelia-dependency-injection';

import {singleton} from '../lib/registration';

export class Hello {
  public msg: string = 'Hello!';
}

@autoinject
export class Config {
  constructor(container: Container) {
    container.registerInstance('hello', 'Hello world!!!');
  }

  @singleton()
  public registerHello(): Hello {
    return new Hello();
  }
}
