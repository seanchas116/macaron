import AST, {
  FunctionCallAST,
} from "../AST";

import Parser, {choose, sequence, lazy} from "../Parser";
import {keyword} from "./common";
import {parseLines} from "./block";

export
var parseArgumentList = lazy(() =>
  keyword("(").thenTake(parseLines).thenSkip(keyword(")"))
);

export
var parseFunctionCall: Parser<(value: AST) => AST> = lazy(() =>
  parseArgumentList.map(args =>
    (value: AST) => new FunctionCallAST(value.range, value, args, false)
  )
);
