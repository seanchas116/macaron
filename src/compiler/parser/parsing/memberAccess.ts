import AST, {
  MemberAccessAST,
} from "../AST";

import Parser, {choose, sequence, lazy} from "../Parser";
import {keyword} from "./common";
import {parseIdentifier} from "./identifier";

export
var parseMemberAccess: Parser<(value: AST) => AST> = lazy(() =>
  keyword(".").thenTake(parseIdentifier).map(identifier =>
    (value: AST) => new MemberAccessAST(value.range, value, identifier)
  )
);
