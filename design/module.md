# Module

Supports ES6 module

## import

```
// import React from "react";
import "react" React

// import * as fs from "fs"; (modules with no default export)
import "fs" * as fs

// import {FunctionAST, IdentifierAST} from "./ast";
import "./ast" {
  FunctionAST
  IdentifierAST
}

// import _, {map, assign} from "lodash";
import "lodash" _ {map, assign}

// import Foo, * as Bar from "./lib"; (weird but supported)
import "./lib" Foo, * as Bar

// imports can be used as expressions
// (circular reference may not work as values are copied)
let Foo = import "Foo"
```

## export

`export`, `export default` is prepended to variable declarations (`let`, `class`, ...)

```
export
let foo = 1

export default
class Hoge {

}
```
