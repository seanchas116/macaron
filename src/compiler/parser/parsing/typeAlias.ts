import {
  ExpressionAST,
  TypeAliasAST,
} from "../AST";

import Parser, {choose, sequence, lazy} from "../Parser";
import {keyword} from "./common";
import {parseNewVariable} from "./assignment";
import {parseTypeExpression} from "./typeExpression";
import {parseIdentifier} from "./identifier";

export
const parseTypeAlias: Parser<ExpressionAST> =
  choose(
    sequence(
      keyword("type"),
      parseIdentifier,
      keyword("=").thenTake(parseTypeExpression)
    )
      .withRange()
      .map(([[declaration, left, right], range]) => new TypeAliasAST(range.begin, left, right)),
    parseNewVariable
  );
