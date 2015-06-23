# Generator

## yield (generator function)

```
// yielding function will be a generator function automatically
// like in CoffeeScript
func yielding() {
  yield 1
  yield 2
  yield 3
  yield ...[1,2,3]
}
yielding() //=> An Iterator

// empty generator function
func empty() {
  yield ...[]
}
```

## await (async function)

```
func asyncOp() {
  await getData()
  await ...getDataList() // Promise.all
}
asyncOp() //=> A Promise

// empty async function
func empty() {
  await null
}
```
