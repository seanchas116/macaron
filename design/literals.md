# Literals

## null / undefined

* Same as JavaScript

## true / false

* Same as JavaScript

## Number

* Same as JavaScript

## String

### Single/double quote string

* TODO: integrate it with template strings?

### Template string

## RegExp

* Same as JavaScript

## Array

```
let arr = [1, 2, 3]

// "," == "\n"
let arr2 = [
  1
  2
  3
]

let arr3 = [1, 2, 3, ...arr]
```

## Object

```
let obj = {
  foo: 1
  bar: 2
}

let foo = 1
let bar = 2
let obj2 = {foo, bar} // {foo: foo, bar: bar}
```

## Map

```
let map = {
  1 => "one"
  2 => "two"
  3 => "three"
}

let pairs = [
  [2, "two"]
  [3, "three"]
]

let map = {
  1 => "one"
  ...pairs
}
```

## Set

```
let set = {{
  "foo"
  "bar"
}}

let arr = ["foo", "bar"]
let set = {{ ...arr, "baz" }}
```

## Tuple

Same as TypeScript

```
["foo", 123, /hoge/]
```
