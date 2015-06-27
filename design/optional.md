# Optional

```
let foo Foo? = getFooOrNull()

// optional chain
foo?.bar

// call method if exists
foo?.bar?(1, 2)

// force unwrapping (may break type safety)
foo!.bar

let something any = getSomething()

// optional cast
something as? string //=> an string?

// force cast
something as! string //=> an string (may break type safety)
```
