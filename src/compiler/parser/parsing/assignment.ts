import {
  ExpressionAST,
  AssignmentAST,
  NewVariableAST
} from "../AST";

import {Parser, choose, sequence, lazy} from "tparse";
import {parseOperator, parseBinaryExpression} from "./operator";
import {parseAssignable} from "./assignable";
import {keyword} from "./common";

const parseAssignmentOperator = parseOperator(["="]);

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
