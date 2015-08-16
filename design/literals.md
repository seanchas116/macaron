# Literals

## null / undefined

* Same as JavaScript

## true / false

* Same as JavaScript

## Number

### Decimal float

```
1234
0.1234
1.23e-10
1.23E10
```

### Hexadecimal integer

```
0x01
0xaaa
0xFFCC
```

### Binary integer

```
0b0010
0b11001011
```

## String

* All string literals support interpolation and tagging
  * Compiled to template string literals

### Single-line literal

```
"foo"
'bar'
String.raw"1 + 2 = #{1 + 2}"
```

### Raw string

```
"""
  void main() {
    gl_FragColor = vec4(#{color});
  }
"""
```

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
