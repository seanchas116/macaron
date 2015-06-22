# Module

Supports ES6 module

TODO: Support CommonJS module natively?

## import


```
// import React from "react";
import "react" React

// import * as fs from "fs"; (modules with no default export)
import "fs" fs

// import {FunctionAST, IdentifierAST} from "./ast";
import "./ast" {FunctionAST, IdentifierAST}

// import _, {map} from "lodash";
import "lodash" _ {map}

// import Foo, * as Bar from "./lib"; (weird but supported)
import "./lib" Foo Bar

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
