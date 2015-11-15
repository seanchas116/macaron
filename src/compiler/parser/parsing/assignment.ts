import {
  ExpressionAST,
  AssignmentAST,
  NewVariableAST
} from "../AST";

import Parser, {choose, sequence, lazy} from "../Parser";
import {parseOperator, parseBinaryExpression} from "./operator";
import {parseAssignable} from "./assignable";
import {keyword} from "./common";

const parseAssignmentOperator = parseOperator(["="]);

export
var parseNewVariable: Parser<ExpressionAST> = lazy(() =>
  choose(
    sequence(
      choose(keyword("let"), keyword("var")),
      parseAssignable,
      parseBinaryExpression.mayBe(),
      keyword("=").thenTake(parseNewVariable)
    )
      .withRange()
      .map(([[declaration, left, type, right], range]) => new NewVariableAST(range, declaration, type, left, right)),
    parseAssignment
  )
);

export
var parseAssignment: Parser<ExpressionAST> = lazy(() =>
  choose(
    sequence(
      parseAssignable,
      parseAssignmentOperator,
      parseAssignment
    )
      .withRange()
      .map(([[left, op, right], range]) => new AssignmentAST(range, left, op, right)),
    parseBinaryExpression
  )
);
