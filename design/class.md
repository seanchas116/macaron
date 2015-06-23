# Class

```
// `extends` is too hard to type
class Foo : Bar {
  // prototype properties (same as ES7 class properties)
  foo = 123

  // prototype properties as methods
  // Foo.method is a (this Foo)(x number, y number) => number
  method(x number, y number) {
    x + y
  }

  // you can assign new instance properties only in constructor
  constructor(@x number) {
    // properties are immutable by default
    @y = @x + 1
    // mutable property
    var @z = @x + 2
  }

  // directly assign properties like in CoffeeScript
  setZ(@z number) {
  }

  // specify newly added method as operator
  operator +
  add(other Foo) {
    ...
  }

  // or use existing method
  operator + add

  // getter / setter is like in JavaScript
  get sum() {
    @x + @y + @z
  }
}
```
