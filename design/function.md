# Function

```
// unnamed function
let foo = (x number, y number) => {
  // implicit return
  x + y
}

// explicit return type
let foo = (x number, y number) => number {
  x + y
}

// infer types from lvalue type
type Func = (x number, y number) => number
let foo Func = (x, y) => {
  x + y
}

// shorter form
xs.map(x => x + 1)
xs.reduce((x, y) => x + y)

// named function
func foo(x number, y number) {
  x + y
}

// explicit return type
func foo(x number, y number) number {
  x + y
}

// receive arguments as Array
func foo(...xs number[]) {
  x + y
}

// receive arguments as tuple
func foo(...xy [number, number]) {
  x + y
}

// specify this type
// TODO: allow using this notation for extension methods?
func (this number) fooMethod(y number) {
  this + y
}

fooMethod = (this number)(y number) {
  this + y
}

fooMethod.call(1, 1) //=> 2
```

## Trailing closure (block)

FIXME: hard to parse

```
xs.map { x =>
}
xs.map { (x number) number =>
}

describe("Foo") {
  it("do foo") {
  }
}
```
