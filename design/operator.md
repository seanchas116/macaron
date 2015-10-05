# Operator

## Native operator declaration

```
declare operator + (x number, y number) number
declare operator [] <T>(xs Array<T>, index number) T
```

## Custom operator

### With normal functions

```
class Point {
  ...
}
// specify newly added function as operator
operator +
func add(a Point, b Point) {
  new Point(a.x + b.x, a.y + b.y)
}
// or use existing function
operator + add
```

### With methods

```
class Point {
  ...

  // specify newly added method as operator
  operator +
  add(other Point) {
    new Point(x + other.x, y + other.y)
  }

  // or use existing method
  operator + add
}
```

## Infix method call

```
// equal
xs.concat(ys)
xs concat ys
```
