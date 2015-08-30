import {
  ExpressionAST,
  MemberAccessAST,
} from "../AST";

import Parser, {choose, sequence, lazy} from "../Parser";
import {keyword} from "./common";
import {parseValue} from "./value";
import {parseIdentifier} from "./identifier";

export
var parseMemberAccess = lazy(() =>
  sequence(
    parseValue,
    keyword(".").thenTake(parseIdentifier)
  )
    .withRange()
    .map(([[obj, member], range]) => new MemberAccessAST(range.begin, obj, member))
);
