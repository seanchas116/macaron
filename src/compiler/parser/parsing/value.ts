import {ExpressionAST} from "../AST";
import {choose, lazy} from "../Parser";
import {keyword} from "./common";
import {parseExpression} from "./expression";
import {parseIdentifier} from "./identifier";
import {parseNumberLiteral} from "./number";
import {parseStringLiteral} from "./string";
import {parseFunction} from "./function";

var parseLiteral = lazy(() =>
  choose<ExpressionAST>(
    parseNumberLiteral,
    parseStringLiteral,
    parseFunction
  )
);

var parseParen = lazy(() =>
  keyword("(").thenTake(parseExpression).thenSkip(keyword(")"))
)

export
var parseValue = lazy(() =>
  choose(
    parseParen,
    parseLiteral,
    parseIdentifier
  )
);
