import {
  ExpressionAST,
  IfAST
} from "../AST";

import Parser, {choose, sequence, lazy} from "../Parser";
import {keyword} from "./common";
import {parseExpression} from "./expression";
import {parseBlock} from "./block";
import {parseFunctionCall} from "./functionCall";

var parseIfExpression: Parser<ExpressionAST> = lazy(() =>
  keyword("if").thenTake(
    sequence(
      parseExpression,
      parseBlock,
      parseElse
    )
      .withRange()
      .map(([[cond, ifTrue, ifFalse], range]) => new IfAST(range.begin, cond, ifTrue, ifFalse || []))
  )
);

var parseElse = lazy(() =>
  keyword("else").thenTake(
    choose(
      parseIfExpression.map(e => [e]),
      parseBlock
    )
  )
);

export
var parseControlExpression = lazy(() =>
  choose(
    parseIfExpression,
    parseFunctionCall
  )
);
