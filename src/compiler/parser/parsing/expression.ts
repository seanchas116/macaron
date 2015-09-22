import {
  ExpressionAST,
} from "../AST";

import Parser, {lazy} from "../Parser";
import {parseTypeAlias} from "./typeAlias";

export
const parseExpression: Parser<ExpressionAST> =
  lazy(() => parseTypeAlias);
