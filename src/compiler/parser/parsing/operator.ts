import {
  ExpressionAST,
  OperatorAST,
  UnaryAST,
  BinaryAST,
} from "../AST";

import {Parser, choose, sequence, lazy} from "tparse";
import {keyword} from "./common";
import {binaryOperators, unaryOperators} from "../operators";
import {parseControlExpression} from "./control";

function flattenSort(operators: string[][]) {
  return operators.reduce((a, b) => a.concat(b), []).sort((a, b) => b.length - a.length);
}

export
function parseOperator(operatorList: string[]) {
  return choose(...operatorList.map(op => keyword(op)))
    .withRange()
    .map(([op, range]) => new OperatorAST(range, op));
}

function buildBinaryExpression(binaryOperators: string[][], first: ExpressionAST, rest: [OperatorAST, ExpressionAST][]): ExpressionAST {
  let operands = [first, ...rest.map(t => t[1])];
  let operators = rest.map(t => t[0]);

  for (const reducingOperators of binaryOperators) {
    for (let i = 0; i < operators.length; ++i) {
      if (reducingOperators.indexOf(operators[i].name) >= 0) {
        operands[i] = new BinaryAST(operators[i].range, operands[i], operators[i], operands[i + 1]);
        operands.splice(i + 1, 1);
        operators.splice(i, 1);
        --i;
      }
    }
  }
  return operands[0];
}

export
function parseUnaryExpressionWith(subParser: Parser<ExpressionAST>, operators: string[][]) {
  return choose(
    subParser,
    sequence(
      parseOperator(flattenSort(operators)),
      subParser
    )
      .withRange()
      .map(([[operator, operand], range]) => new UnaryAST(range, operator, operand))
  );
}

export
function parseBinaryExpressionWith(subParser: Parser<ExpressionAST>, operators: string[][]) {
  return sequence(
    subParser,
    sequence(parseOperator(flattenSort(operators)), subParser).repeat()
  )
    .map(([first, rest]) => buildBinaryExpression(operators, first, rest));
}

export
var parseUnaryExpression = lazy(() => parseUnaryExpressionWith(parseControlExpression, unaryOperators));

export
var parseBinaryExpression = lazy(() => parseBinaryExpressionWith(parseUnaryExpression, binaryOperators));
