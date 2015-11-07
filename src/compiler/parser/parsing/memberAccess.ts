import AST, {
  ExpressionAST,
  MemberAccessAST,
} from "../AST";

import Parser, {choose, sequence, lazy} from "../Parser";
import {keyword} from "./common";
import {parseIdentifier} from "./identifier";

export
var parseMemberAccess: Parser<(value: ExpressionAST) => ExpressionAST> = lazy(() =>
  keyword(".").thenTake(parseIdentifier).map(identifier =>
    (value: ExpressionAST) => new MemberAccessAST(value.range, value, identifier)
  )
);
