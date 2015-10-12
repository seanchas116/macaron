# Operator

## Native operator

```
interface Number {
  ...

  + (other number) number
  * (other number) number
  - () number
}

interface NumberConstrutor {
  ...

  new (value? any) Number
  (value? any) number
}
```

## Custom operator

```
class Point {
  ...

  // specify newly added method as operator
  + add(other Point) {
    new Point(x + other.x, y + other.y)
  }

  // or use existing method
  + add
}
```

## Infix method call

```
// equal
xs.concat(ys)
xs concat ys
```
