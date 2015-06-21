# Type

## Hierarchy

Type hierarchy is a DAG (directed acyclic graph)

* void
  * any
    * Object
      * number
      * string
      * Array
      * ...
    * Object?
      * number?
      * string?
      * Array?
      * ...

Casting to void, any or Object must be explicit

TODO: how to handle primitive boxing

## Subtyping

* Everything is structural
* `(a Array) => Object` is a subtype of `(a Object) => Array`
  * Function argument types are contravariant
  * Function return types are covariant
* Read-only properties are covariant
* Write-only properties are contravariant
* Read-write properties are nonvariant
