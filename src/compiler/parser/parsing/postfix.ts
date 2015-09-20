import {
  ExpressionAST,
} from "../AST";

import Parser, {choose, sequence, lazy} from "../Parser";
import {keyword, separated} from "./common";
import {parseNew} from "./new";
import {parseFunctionCall} from "./functionCall";
import {parseMemberAccess} from "./memberAccess";

export
var parsePostfix = lazy(() =>
  sequence(
    parseNew,
    choose(
      parseFunctionCall,
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
      parseMemberAccess
    ).repeat()
  )
    .map(([value, postfixes]) =>
      postfixes.reduce((current, postfix) => postfix(current), value)
    )
);
