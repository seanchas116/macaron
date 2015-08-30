import {
  ExpressionAST,
  NewVariableAST
} from "../AST";

import Parser, {choose, sequence, lazy} from "../Parser";
import {keyword} from "./common";

const parseDeclarationKeyword = choose(keyword("let"), keyword("var"));
