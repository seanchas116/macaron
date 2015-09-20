import {
  ExpressionAST,
  FunctionCallAST,
} from "../AST";

import Parser, {choose, sequence, lazy} from "../Parser";
import {keyword} from "./common";
import {parseLines} from "./block";

export
var parseGenericsArgumentList = lazy(() =>
  keyword("<").thenTake(parseLines).thenSkip(keyword(">"))
);

export
var parseGenericsCall: Parser<(value: ExpressionAST) => ExpressionAST> = lazy(() =>
  parseGenericsArgumentList.map(args =>
    (value: ExpressionAST) => new FunctionCallAST(value.location, value, args, false)
  )
);
