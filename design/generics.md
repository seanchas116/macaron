# Generics

```
interface Monad<T> {
  flatMap<U>(f (value T) => Monad<U>) Monad<U>
}

func isEqual<T : Equatable>(a Iterable<T>, b Iterable<T>) {
}
```
