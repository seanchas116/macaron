# Generics

```
interface Monad<T> {
  static unit(value T) Monad<T>
  bind<U>(f (value T) => Monad<U>) Monad<U>
}  
```
