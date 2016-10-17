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
              private targetClass: Function,
              private transient: boolean = false) {
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
          this.targetClass, this.factoryMethod.name) as Array<any> || _emptyParameters;
    }

    let resolvedDependencies: any[] | undefined = dependencies.length > 0 ?
      dependencies.map(dependency => container.get(dependency)) : undefined;

    if (this.transient || !this.instance) {
      this.instance = this.factoryMethod.apply(undefined, resolvedDependencies);
    }

    return this.instance;
  }
}
