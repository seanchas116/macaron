import {
  ExpressionAST,
} from "../AST";

import Parser, {choose, sequence, lazy} from "../Parser";
import {keyword, separated} from "./common";
import {parseNew} from "./new";
import {parseFunctionCall} from "./functionCall";
import {parseGenericsCall} from "./genericsCall";
import {parseMemberAccess} from "./memberAccess";

export
var parsePostfix = lazy(() =>
  sequence(
    parseNew,
    choose(
      parseFunctionCall,
      parseGenericsCall,
      parseMemberAccess
    ).repeat()
  )
    .map(([value, postfixes]) =>
      postfixes.reduce((current, postfix) => postfix(current), value)
    )
);

export
var parsePostfixWithoutFunctionCall = lazy(() =>
  sequence(
    parseNew,
    choose(
      parseGenericsCall,
      parseMemberAccess
    ).repeat()
  )
    .map(([value, postfixes]) =>
      postfixes.reduce((current, postfix) => postfix(current), value)
    )
);
