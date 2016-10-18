import {
  Container,
  Resolver,
  Registration as AureliaRegistration,
  registration as aureliaRegistration,
} from 'aurelia-dependency-injection';
import {metadata} from 'aurelia-metadata';

import {FactoryMethod} from './resolvers';

/**
 * Decorator: Specifies a custom registration strategy for the decorated class/function.
 */
export function registration(value: Registration & {key: any}): any {
  return function (target: any, key: any, descriptor: PropertyDescriptor) {
    if ((key && key.length > 0) && descriptor) {
      value.factoryFn = descriptor.value;
      value.targetClass = target;
      // TODO: move key to metadata
      target = value.key || metadata.get('design:returntype', target, key);
    }

    return aureliaRegistration(value as AureliaRegistration)(target);
  };
}

/**
 * Decorator: Specifies to register the decorated item with a "transient" lifetime.
 */
export function transient(key?: any): any {
  return registration(new TransientRegistration(key));
}

/**
 * Decorator: Specifies to register the decorated item with a "singleton" lieftime.
 */
export function singleton(keyOrRegisterInChild?: any, registerInChild: boolean = false): any {
  return registration(new SingletonRegistration(keyOrRegisterInChild, registerInChild));
}

/**
 * Customizes how a particular function is resolved by the Container.
 */
export abstract class Registration {
  /**
   * Factory function invoked instead of the target
   */
  public factoryFn: Function;

  /**
   *
   */
  public targetClass: Function;

  /**
   * Called by the container to register the resolver.
   * @param container The container the resolver is being registered with.
   * @param key The key the resolver should be registered as.
   * @param fn The function to create the resolver for.
   * @return The resolver that was registered.
   */
  public abstract registerResolver(container: Container, key: any, fn: Function): Resolver;
}

/**
 * Used to allow functions/classes to indicate that they should be registered as transients with the container.
 */
export class TransientRegistration extends Registration {
  /** @internal */
  public key: any;

  /**
   * Creates an instance of TransientRegistration.
   * @param key The key to register as.
   */
  constructor(key?: any) {
    super();
    this.key = key;
  }

  /**
   * Called by the container to register the resolver.
   * @param container The container the resolver is being registered with.
   * @param key The key the resolver should be registered as.
   * @param fn The function to create the resolver for.
   * @return The resolver that was registered.
   */
  public registerResolver(container: Container, key: any, fn: Function): Resolver {
    if (this.factoryFn) {
      return container.registerResolver(this.key || key,
        new FactoryMethod(this.key, this.factoryFn, this.targetClass, true));
    }

    return container.registerTransient(this.key || key, fn);
  }
}

/**
 * Used to allow functions/classes to indicate that they should be registered as singletons with the container.
 */
export class SingletonRegistration extends Registration {
  /** @internal */
  public key: any;

  /** @internal */
  private registerInChild: any;

  /**
   * Creates an instance of SingletonRegistration.
   * @param keyOrRegisterInChild The key to register as.
   * @param registerInChild Should it be registered in the root or child container
   */
  constructor(keyOrRegisterInChild?: any, registerInChild: boolean = false) {
    super();

    if (typeof keyOrRegisterInChild === 'boolean') {
      this.registerInChild = keyOrRegisterInChild;
    } else {
      this.key = keyOrRegisterInChild;
      this.registerInChild = registerInChild;
    }
  }

  /**
   * Called by the container to register the resolver.
   * @param container The container the resolver is being registered with.
   * @param key The key the resolver should be registered as.
   * @param fn The function to create the resolver for.
   * @return The resolver that was registered.
   */
  public registerResolver(container: Container, key: any, fn: Function | Resolver): Resolver {
    if (this.factoryFn) {
      return this.registerInChild
        ? container.registerResolver(this.key || key, new FactoryMethod(key, this.factoryFn, this.targetClass))
        : container.root.registerResolver(this.key || key, new FactoryMethod(key, this.factoryFn, this.targetClass));
    } else {
      return this.registerInChild
        ? container.registerSingleton(this.key || key, fn as Function)
        : container.root.registerSingleton(this.key || key, fn as Function);
    }
  }
}
