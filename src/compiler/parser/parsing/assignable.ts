import AST, {
  AssignableAST,
  IdentifierAssignableAST
} from "../AST";

import Parser, {sequence, lazy} from "../Parser";
import {parseIdentifier} from "./identifier";
import {parseTypeExpression} from "./typeExpression";

var parseIdentifierAssignable: Parser<AssignableAST> = lazy(() =>
  sequence(
    parseIdentifier,
    parseTypeExpression.mayBe()
  )
    .withRange()
    .map(([[name, type], range]) => new IdentifierAssignableAST(range, name, type))
);

export
var parseAssignable = parseIdentifierAssignable;
