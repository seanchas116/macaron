import {
  ExpressionAST,
  FunctionCallAST
} from "../AST";

import {Parser, choose, sequence, lazy} from "tparse";
import {keyword} from "./common";
import {parseArgumentList} from "./functionCall";
import {parseValue} from "./value";
import {parsePostfixWithoutFunctionCall} from "./postfix";

export
var parseNew: Parser<ExpressionAST> = lazy(() =>
  choose(
    keyword("new").thenTake(
      sequence(
        parsePostfixWithoutFunctionCall,
        parseArgumentList
      )
    )
      .withRange()
      .map(([[klass, args], range]) =>
        new FunctionCallAST(range, klass, args, true)
      )
    ,
    parseValue
  )
);
