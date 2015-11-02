import AST, {
  TypeAliasAST,
} from "../AST";

import Parser, {choose, sequence, lazy} from "../Parser";
import {keyword} from "./common";
import {parseNewVariable} from "./assignment";
import {parseTypeExpression} from "./typeExpression";
import {parseIdentifier} from "./identifier";

export
const parseTypeAlias: Parser<AST> =
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
