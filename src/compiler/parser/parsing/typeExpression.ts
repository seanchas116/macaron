import {
  ExpressionAST,
} from "../AST";

import Parser, {choose, sequence, lazy} from "../Parser";
import {keyword} from "./common";
import {typeBinaryOperators} from "../operators";
import {parseIdentifier} from "./identifier";
import {parsePostfixWith} from "./postfix";
import {parseBinaryExpressionWith} from "./operator";
import {parseGenericsCall} from "./genericsCall";
import {parseMemberAccess} from "./memberAccess";

const parseTypePostfix = lazy(() =>
  parsePostfixWith(parseIdentifier, [
    parseGenericsCall,
    parseMemberAccess
  ])
);

const parseTypeBinaryExpression = parseBinaryExpressionWith(parseTypePostfix, typeBinaryOperators);

export
const parseTypeExpression = parseTypeBinaryExpression;
