import {
  ExpressionAST,
  AssignmentAST,
  NewVariableAST
} from "../AST";

import Parser, {choose, sequence, lazy} from "../Parser";
import {parseExpression} from "./expression";
import {parseOperator, parseBinaryExpression} from "./operator";
import {parseIdentifier} from "./identifier";
import {keyword} from "./common";

const parseAssignmentOperator = parseOperator(["="]);

export
var parseAssisgnable = lazy(() =>
  parseIdentifier
);

export
var parseNewVariable: Parser<ExpressionAST> = lazy(() =>
  choose(
    sequence(
      choose(keyword("let"), keyword("var")),
      parseAssisgnable,
      parseBinaryExpression.mayBe(),
      keyword("=").thenTake(parseNewVariable)
    )
      .withRange()
      .map(([[declaration, left, type, right], range]) => new NewVariableAST(range.begin, declaration, type, left, right)),
    parseAssignment
  )
);

export
var parseAssignment: Parser<ExpressionAST> = lazy(() =>
  choose(
    sequence(
      parseAssisgnable,
      parseAssignmentOperator,
      parseAssignment
    )
      .withRange()
      .map(([[left, op, right], range]) => new AssignmentAST(range.begin, left, op, right)),
    parseBinaryExpression
  )
);
