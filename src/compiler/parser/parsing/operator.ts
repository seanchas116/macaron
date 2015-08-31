import {
  ExpressionAST,
  OperatorAST,
  UnaryAST,
  BinaryAST,
} from "../AST";

import {choose, sequence, lazy} from "../Parser";
import {keyword} from "./common";
import {binaryOperators, unaryOperators} from "../operators";
import {parseControlExpression} from "./control";

const binaryOperatorList = binaryOperators.reduce((a, b) => a.concat(b), []).sort((a, b) => b.length - a.length);
const unaryOperatorList = unaryOperators.reduce((a, b) => a.concat(b), []).sort((a, b) => b.length - a.length);

export
function parseOperator(operatorList: string[]) {
  return choose(...operatorList.map(op => keyword(op)))
    .withRange()
    .map(([op, range]) => new OperatorAST(range.begin, op));
}

const parseBinaryOperator = parseOperator(binaryOperatorList);
const parseUnaryOperator = parseOperator(unaryOperatorList);

function buildBinaryExpression(first: ExpressionAST, rest: [OperatorAST, ExpressionAST][]): ExpressionAST {
  let operands = [first, ...rest.map(t => t[1])];
  let operators = rest.map(t => t[0]);

  for (const reducingOperators of binaryOperators) {
    for (let i = 0; i < operators.length; ++i) {
      if (reducingOperators.indexOf(operators[i].name) >= 0) {
        operands[i] = new BinaryAST(operators[i].location, operands[i], operators[i], operands[i + 1]);
        operands.splice(i + 1, 1);
        operators.splice(i, 1);
        --i;
      }
    }
  }
  return operands[0];
}

export
var parseUnaryExpression = lazy(() =>
  choose(
    parseControlExpression,
    sequence(
      parseUnaryOperator,
      parseControlExpression
    )
      .withRange()
      .map(([[operator, operand], range]) => new UnaryAST(range.begin, operator, operand))
  )
);

export
var parseBinaryExpression = lazy(() =>
  sequence(
    parseUnaryExpression,
    sequence(parseBinaryOperator, parseUnaryExpression).repeat()
  )
    .map(([first, rest]) => buildBinaryExpression(first, rest))
);
