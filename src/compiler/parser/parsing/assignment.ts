import {
  ExpressionAST,
  AssignmentAST
} from "../AST";

import Parser, {choose, sequence, lazy} from "../Parser";
import {parseOperator, parseBinaryExpression} from "./operator";
import {parseIdentifier} from "./identifier";

const parseAssignmentOperator = parseOperator(["="]);

export
var parseAssisgnable = lazy(() =>
  parseIdentifier
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
