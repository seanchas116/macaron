## Extension

```
func wrapGenerator(x: () => Iterator<T>) {
  {[Symbol.Iterator]: x}
}

// Extensions are just normal objects
export
const IterableExtension = {
  // the first parameter is treated as `this`
  map<T, U>(xs Iterable<T>, f (T) => Iterable<U>) {
    wrapGenerator {
      for x : this {
        yield f(x)
      }
    }
  }
  concat<T, U>(xs Iterable<T>, ...yss Iterable<Iterable<U>>) {
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
// Use `use` keyword to use object as extension
use IterableExtension

xs = new Set([1,2,3,1])
xs.map(x => String(x)) concat ["foo", "bar"]
//=> ["1", "2", "3", "foo", "bar"]
```
