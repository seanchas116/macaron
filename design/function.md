# Function

```
// unnamed function
foo = (x number, y number) {
  // implicit return
  x + y
}

// named function
func foo(x number, y number) {
  x + y
}

// explicit return type
func foo(x number, y number) number {
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

// shorter form
xs.map(x => x + 1)
xs.reduce((x, y) => x + y)
```

## Trailing closure (block)

```
xs.map { (x number) number =>

}
```
