import {
  ExpressionAST,
  MemberAccessAST,
  IdentifierAST
} from "../AST";

import Parser, {choose, sequence, lazy} from "../Parser";
import {keyword} from "./common";
import {parseValue} from "./value";
import {parseIdentifier} from "./identifier";

export
var parseMemberAccess = lazy(() =>
  choose(
    sequence(
      parseValue,
      keyword(".").thenTake(parseIdentifier)
    )
      .withRange()
      .map(([[obj, member], range]) => new MemberAccessAST(range.begin, obj, member)),
    keyword("@").thenTake(parseIdentifier)
      .withRange()
      .map(([member, range]) => new MemberAccessAST(range.begin, new IdentifierAST(range.begin, "this"), member)),
    parseValue
  )
);
