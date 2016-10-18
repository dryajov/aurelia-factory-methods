import 'reflect-metadata';

import {autoinject, Container} from 'aurelia-dependency-injection';
import {Logger, Config} from './config-class';

@autoinject
export class App {
  constructor(public logger: Logger) {
  }
}

let container = new Container();
let app = container.get(App);

console.log(`Type of Logger is: ${app.logger.toString()}`);
