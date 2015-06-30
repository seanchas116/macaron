# Type

## Hierarchy

* `dynamic`
  * `any` / `void`
    * `nil` (`null`, `undefined`)
    * `number`
    * `string`
    * `Object`
      * `Array<T>`
      * `Number`
      * `String`
      * ...

`Object?` = `Object|nil`

## Subtyping

* Everything is structural
* `(a Object) => Date` is a subtype of `(a Date) => Object`
  * Function argument types are contravariant
  * Function return types are covariant
* Read-only properties are covariant
* Write-only properties are contravariant
* Read-write properties are nonvariant

## Boxing

* `number` -> `Number`
* `string` -> `String`

```
1.toString() // OK, calling method of box class

let obj = {}
obj = 1 // error, 1 is not an object
obj = new Number(1) // OK
```

## Union type

```
var x Foo|Bar = new Foo()
x = new Bar()
```

## Tuple

```
let x [number, string] = [1, "foo"]
```

## Array shorthand

```
let xs number[] = []
```
