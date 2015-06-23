# Interface

```
interface Point {
  // required properties
  x number
  y number

  // required method
  length() number

  // additional implementation
  dot(other Point) {
    @x * other.x + @y * other.y
  }
}
```

Compiles into like this:

```js
const Point = {
  dot(self, other) {
    return self.x * other.x + self.y * other.y;
  }
};

```

## Use interface as extension

```
// number-times.macaron

export
interface NumberTimes : number {
  times(block (i number) => number) {
    for var i = 0, i < this, i += 1 {
      block(i)
    }
  }
}
```

```
import "number-times" // that's it

10.times { i =>
  console.log(i)
}
```
