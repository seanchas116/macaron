# Pattern matching

## Patterns

* Values
* Enums
* Classes
* Optionals
* Regular expressions

## TODO

* How to use types as values
* Interfaces are allowed as patterns?

```
// conditions
case {
  when isFoo() {
  }
  when isBar() {
  }
}

// values
case x {
  when 1 {
  }
  when 2 {
  }
}

// enums
case list {
  when let .Cons(first, rest) {
  }
  when .Nil {
  }
}

// classes
case elem {
  when let canvas HTMLCanvasElement {
  }
  when let input HTMLInputElement {
  }
}

// optionals
case getFooOrNull() {
  when let foo! {
  }
  when null {
  }
}

// regular expressions
case str {
  when let /(?<digits>\d+)/ {
  }
}
```

## Destructuring

Destructuring is a form of pattern matchings that always succeed

```
// enums
let .Cons(first, rest) = List<string>.Cons("foo", .Nil)

// tuples
let [foo, bar] = [1, 2]

// objects
let {foo, bar} = {foo: 1, bar: 2}
```
