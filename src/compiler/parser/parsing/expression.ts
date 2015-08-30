import {
  ExpressionAST,
} from "../AST";

import Parser, {lazy} from "../Parser";
import {parseAssignment} from "./assignment";

export
const parseExpression: Parser<ExpressionAST> =
  lazy(() => parseAssignment);
