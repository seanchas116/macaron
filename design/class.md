# Class

## Constructor

```
class Person(.name string) {
  birthDate = new Date()

  init {
    console.log("creating person: #{name}")
  }
}

class Greeter(name string, .message string) : Person(name) {
  // name - will not be a property
  // .message - will be a property
  greet() {
    console.log("#{name}: #{message}")
  }
}

let greeter = new Greeter("Alice", "Hello!")
greeter.name //=> "Alice"
greeter.message // => "Hello!"
greeter.greet() // Alice: Hello!
```

## Property

```
class Foo(.x number) {
  // constant
  y = x + 1

  // variable
  var z = x + 2

  // private
  private w = x + 3

  // getter / setter is like in JavaScript
  get sum() {
    x + y + z + w
  }

  // static property
  static poyo = "poyo"

  // prototype property
  shared poyopoyo = "poyopoyo"
}
```

## Method

```
class Foo {
  // prototype methods
  // Foo.method is a (this Foo)(x number, y number) => number
  method(x number, y number) {
    x + y
  }

  // private method (using Symbols)
  private hoge() {

  }

  // static method
  static hoge() {
    // calling superclass's hoge
    super.hoge()
  }
}
```
