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
function parsePostfixWith(subParser: Parser<ExpressionAST>, postfixParsers: Parser<(value: ExpressionAST) => ExpressionAST>[]) {
  return sequence(
    subParser,
    choose(...postfixParsers).repeat()
  )
    .map(([value, postfixes]) =>
      postfixes.reduce((current, postfix) => postfix(current), value)
    );
}

export
var parsePostfix = lazy(() =>
  parsePostfixWith(parseNew, [
    parseFunctionCall,
    parseGenericsCall,
    parseMemberAccess
  ])
);

export
var parsePostfixWithoutFunctionCall = lazy(() =>
  parsePostfixWith(parseNew, [
    parseGenericsCall,
    parseMemberAccess
  ])
);
