# Compile-time execution

## Use modules in compile-time

```
import meta "./metaLib" {camelize}

class Foo {
  [camelize("some_method")](x number) {
  }
}
```
