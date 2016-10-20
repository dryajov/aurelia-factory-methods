import {
  Container,
  Resolver,
  resolver,
  _emptyParameters,
} from 'aurelia-dependency-injection';
import {metadata} from 'aurelia-metadata';

@resolver
export class FactoryMethod implements Resolver {
  private instance: any;

  /**
   *
   * @param key
   * @param factoryMethod
   * @param transient
   */
  constructor(private key: any,
              private factoryMethod: Function & {inject?: Array<any> | Function},
              private transient: boolean = false,
              private configClass?: Function) {
  }

  /**
   *
   * @param container
   * @param key
   * @returns {any}
   */
  public get(container: Container, key: any): any {
    let dependencies: any[] = [];
    if (this.factoryMethod.inject !== undefined) {
      dependencies = typeof this.factoryMethod.inject === 'function' ?
        this.factoryMethod.inject.call(undefined) : this.factoryMethod.inject;
    } else {
      dependencies = metadata.getOwn(metadata.paramTypes,
          key.configClass, key.factoryFn.name) as Array<any> || _emptyParameters;
    }

    let resolvedDependencies: any[] | undefined = dependencies.length > 0 ?
      dependencies.map(dependency => container.get(dependency)) : undefined;

    if (this.transient || !this.instance) {
      let configInstace: any = container.get(key.configClass);
      this.instance = key.factoryFn.apply(configInstace, resolvedDependencies);
    }

    return this.instance;
  }
}
