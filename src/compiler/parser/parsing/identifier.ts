import {
  IdentifierAST,
} from "../AST";

import {
  sequence,
  regExp,
  lazy
} from "../Parser";

import {
  _,
} from "./common";

// TODO: allow more characters
const parseIdentifierHead = regExp(/[a-zA-Z$_]/);
const parseIdentifierTail = regExp(/[a-zA-Z$_0-9]/);

export
var parseIdentifier = lazy(() =>
  sequence(parseIdentifierHead, parseIdentifierTail.repeat())
    .text()
    .withRange()
    .thenSkip(_)
    .map(([text, range]) => new IdentifierAST(range, text))
);
