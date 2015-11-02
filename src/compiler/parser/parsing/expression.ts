import AST from "../AST";

import Parser, {lazy} from "../Parser";
import {parseTypeAlias} from "./typeAlias";

export
const parseExpression: Parser<AST> =
  lazy(() => parseTypeAlias);
