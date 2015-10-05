# Class

```
// constructor parameters here
class Foo(let x number) : Bar {
  let y = x + 1
  var z = x + 2

  // private property
  private let w = 1

  // run on initialization
  init {
    console.log("Foo initialized")
  }

  // prototype methods
  // Foo.method is a (this Foo)(x number, y number) => number
  method(x number, y number) {
    x + y
  }

  // getter / setter is like in JavaScript
  get sum() {
    x + y + z
  }

  // private method (using Symbols)
  private hoge() {

  }

  // static method
  static hoge() {
    // calling superclass's hoge
    super.hoge()
  }

  // static property
  static poyo = "poyo"

  // prototype property
  shared poyopoyo = "poyopoyo"
}
```
