## Extension

```
func wrapGenerator(x: () => Iterator<T>) {
  {[Symbol.Iterator]: x}
}

export
extension IterableExtension<T> : Iterable<T> {
  map<U>(f (T) => Iterable<U>) {
    wrapGenerator {
      for x : this {
        yield f(x)
      }
    }
  }
  concat<U>(...yss Iterable<Iterable<U>>) {
    wrapGenerator {
      yield ...this
      for ys : yss {
        yield ...ys
      }
    }
  }
}
```

```
import "./extensions" {IterableExtension}

xs = new Set([1,2,3,1])
xs.map(x => String(x)) concat ["foo", "bar"]
//=> ["1", "2", "3", "foo", "bar"]
```
