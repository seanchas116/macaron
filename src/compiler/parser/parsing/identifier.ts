import {
  ExpressionAST,
  IdentifierAST,
} from "../AST";

import Parser, {
  choose,
  sequence,
  string,
  regExp,
  testChar,
  lazy
} from "../Parser";

import {
  _, __, ___,
  keyword
} from "./common";

// TODO: allow more characters
const parseIdentifierHead = regExp(/[a-zA-Z$_]/);
const parseIdentifierTail = regExp(/[a-zA-Z$_0-9]/);

export
var parseIdentifier = lazy(() =>
  sequence(parseIdentifierHead, parseIdentifierTail.repeat()).thenSkip(_)
    .text()
    .withRange()
    .map(([text, range]) => new IdentifierAST(range.begin, text))
);
