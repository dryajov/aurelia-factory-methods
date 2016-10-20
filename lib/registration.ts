import {
  Container,
  Resolver,
  Registration,
  registration as aureliaRegistration,
} from 'aurelia-dependency-injection';
import {metadata} from 'aurelia-metadata';

import {FactoryMethod} from './resolvers';

/**
 * Decorator: Specifies a custom registration strategy for the decorated class/function.
 */
export function registration(value: Registration & {key: any}): any {
  return (target: any, key: any, descriptor: PropertyDescriptor) => {
    if ((key && key.length > 0) && descriptor) {
      // TODO: move key to metadata
      let configClass: any = target;
      target = value.key instanceof Object ? value.key : metadata.get('design:returntype', target, key);
      target.factoryFn = descriptor.value;
      target.configClass = configClass;
    }

    return aureliaRegistration(value)(target);
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
 * Used to allow functions/classes to indicate that they should be registered as transients with the container.
 */
export class TransientRegistration implements Registration {
  /** @internal */
  public key: any;

  /**
   * Creates an instance of TransientRegistration.
   * @param key The key to register as.
   */
  constructor(key?: any) {
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
    key = this.key || key;
    if (key.factoryFn) {
      return container.registerResolver(key,
        new FactoryMethod(key, key.factoryFn, true));
    }

    return container.registerTransient(key, fn);
  }
}

/**
 * Used to allow functions/classes to indicate that they should be registered as singletons with the container.
 */
export class SingletonRegistration implements Registration {
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
    key = this.key || key;
    if (key.factoryFn) {
      return this.registerInChild
        ? container.registerResolver(key, new FactoryMethod(key, key.factoryFn))
        : container.root.registerResolver(this.key || key, new FactoryMethod(key, key.factoryFn));
    } else {
      return this.registerInChild
        ? container.registerSingleton(key, fn as Function)
        : container.root.registerSingleton(key, fn as Function);
    }
  }
}
