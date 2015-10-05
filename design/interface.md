# Interface

```
interface Point {
  // required properties
  x number
  y number

  // required method
  length() number
}
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
