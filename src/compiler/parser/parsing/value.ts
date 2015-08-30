import {choose, lazy} from "../Parser";
import {keyword} from "./common";
import {parseExpression} from "./expression";
import {parseIdentifier} from "./identifier";
import {parseNumberLiteral} from "./number";
import {parseStringLiteral} from "./string";

var parseLiteral = lazy(() =>
  choose(
    parseNumberLiteral,
    parseStringLiteral
    // TODO
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
