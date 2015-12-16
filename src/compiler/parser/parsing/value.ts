import {ExpressionAST} from "../AST";
import {choose, lazy} from "tparse";
import {keyword} from "./common";
import {parseExpression} from "./expression";
import {parseIdentifier} from "./identifier";
import {parseNumberLiteral} from "./number";
import {parseStringLiteral} from "./string";
import {parseFunction} from "./function";
import {parseClass, parseInterface} from "./class";

var parseLiteral = lazy(() =>
  choose<ExpressionAST>(
    parseNumberLiteral,
    parseStringLiteral,
    parseFunction,
    parseClass,
    parseInterface
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
