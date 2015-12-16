import {ExpressionAST} from "../AST";

import {Parser, lazy} from "tparse";
import {parseTypeAlias} from "./newVariable";

export
const parseExpression: Parser<ExpressionAST> =
  lazy(() => parseTypeAlias);
