# Control Flow

## do (block)

```
let sum = do {
  let x = 1
  let y = 1
  let z = 1
  x + y + z
}
```

## catch / finally

```
do {
  let a = 0
  if (!hoge) {
    throw new Error("hoge is not true")
  }
} catch error {
  if error is Error {
    console.log(error.message);
  }
} finally {
  console.log("finished")
}
```

## if

```
if foo {

} else {

}
```

## while

```
while true {
  if some {
    break
  }
}
```

## C-style for

```
for var i = 0, i < count, i += 1 {

}
```

## for-in (for Iterables)

```
for let i : [1,2,3] {

}
```
