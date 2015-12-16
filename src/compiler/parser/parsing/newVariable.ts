import {
  ExpressionAST,
  NewVariableAST,
  TypeAliasAST
} from "../AST";

import {Parser, choose, sequence, lazy} from "tparse";
import {parseOperator, parseBinaryExpression} from "./operator";
import {parseAssignment} from "./assignment";
import {parseAssignable} from "./assignable";
import {parseTypeExpression} from "./typeExpression";
import {parseIdentifier} from "./identifier";
import {keyword} from "./common";

export
var parseNewVariable: Parser<ExpressionAST> = lazy(() =>
  choose(
    sequence(
      choose(keyword("let"), keyword("var")),
      parseAssignable,
      parseTypeExpression.mayBe(),
      keyword("=").thenTake(parseNewVariable)
    )
      .withRange()
      .map(([[declaration, left, type, right], range]) => new NewVariableAST(range, declaration, type, left, right)),
    parseAssignment
  )
);

export
const parseTypeAlias: Parser<ExpressionAST> =
  choose(
    sequence(
      keyword("type"),
      parseIdentifier,
      keyword("=").thenTake(parseTypeExpression)
    )
      .withRange()
      .map(([[declaration, left, right], range]) => new TypeAliasAST(range, left, right)),
    parseNewVariable
  );
