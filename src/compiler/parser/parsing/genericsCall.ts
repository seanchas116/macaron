import AST, {
  GenericsCallAST,
} from "../AST";

import Parser, {choose, sequence, lazy} from "../Parser";
import {keyword, separated} from "./common";
import {parsePostfix} from "./postfix";

export
var parseGenericsArgumentList = lazy(() =>
  keyword("<").thenTake(separated(parsePostfix)).thenSkip(keyword(">"))
);

export
var parseGenericsCall: Parser<(value: AST) => AST> = lazy(() =>
  parseGenericsArgumentList.map(args =>
    (value: AST) => new GenericsCallAST(value.range, value, args)
  )
);
