import Parser, {choose, sequence, lazy} from "../Parser";
import {_, __, ___, keyword, separated} from "./common";
import {parseExpression} from "./expression";

export
var parseLines = separated(parseExpression);

export
var parseBlock =
  keyword("{").thenTake(parseLines).thenSkip(keyword("}"));
