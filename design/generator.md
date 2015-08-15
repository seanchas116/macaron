# Generator

## yield (generator function)

```
// yielding function will be a generator function automatically
// like in CoffeeScript
func yielding() {
  yield 1
  yield 2, 3
  yield ...[1,2,3]
}
yielding() //=> An Iterator<number>

// empty generator function
func empty() {
  yield
}
```

## await (async function)

```
func getData() {
  new Promise {resolve =>
    resolve(new Data())
  }
}

func asyncOp() {
  await getData()
}
asyncOp() //=> A Promise<Data>

// empty async function
func empty() {
  await null
}
```

TODO: `Promise.all` syntax sugar
