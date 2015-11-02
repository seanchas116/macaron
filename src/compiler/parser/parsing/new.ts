import AST, {
  FunctionCallAST
} from "../AST";

import Parser, {choose, sequence, lazy} from "../Parser";
import {keyword, separated} from "./common";
import {parseArgumentList} from "./functionCall";
import {parseValue} from "./value";
import {parsePostfixWithoutFunctionCall} from "./postfix";

export
var parseNew: Parser<AST> = lazy(() =>
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
