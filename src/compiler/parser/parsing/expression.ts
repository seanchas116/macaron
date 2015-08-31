import {
  ExpressionAST,
} from "../AST";

import Parser, {lazy} from "../Parser";
import {parseNewVariable} from "./assignment";

export
const parseExpression: Parser<ExpressionAST> =
  lazy(() => parseNewVariable);
