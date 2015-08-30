import {
  ExpressionAST,
} from "../AST";

import Parser, {choose, sequence, lazy} from "../Parser";
import {_, __, ___, keyword} from "./common";
import {parseExpression} from "./expression";

export
var parseLines =
  sequence(
    __.thenTake(parseExpression.mayBe()),
    ___.thenTake(parseExpression).repeat().thenSkip(__)
  )
  .map(([first, rest]) => first.concat(rest));

export
var parseBlock =
  keyword("{").thenTake(parseLines).thenSkip(keyword("}"));
