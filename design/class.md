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

  // you can introduce new instance properties only in constructor
  constructor(this.x number) {
    // this.x is immutable by default

    // you can omit `this.`
    let this.y = x + 1
    var this.z = x + 2

    // private property
    private let this.w = 1
  }

  // directly assign properties like in CoffeeScript
  setZ(this.z number) {
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
    x + y + z
  }

  // private method (using Symbols)
  private hoge() {

  }
}
```
