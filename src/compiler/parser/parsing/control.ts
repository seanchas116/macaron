import {
  ExpressionAST,
  IfAST
} from "../AST";

import Parser, {choose, sequence, lazy} from "../Parser";
import {keyword} from "./common";
import {parseExpression} from "./expression";
import {parseBlock} from "./block";
import {parsePostfix} from "./postfix";

var parseIfExpression: Parser<ExpressionAST> = lazy(() =>
  keyword("if").thenTake(
    sequence(
      parseExpression,
      parseBlock,
      parseElse.mayBe()
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
    parsePostfix
  )
);
