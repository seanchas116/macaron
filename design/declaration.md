# Declaration

```
declare interface Array<T> {
  map<U>(f (x T) => U) Array<U>
}

// multiple declaration will be merged
declare interface Array<T> {
  [] (index number) T
}

interface ArrayConstructor {
  static from(xs Iterable<T>) Array<T>
}

declare let Array ArrayConstructor
```
