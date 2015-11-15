import {
  ExpressionAST,
  FunctionCallAST,
} from "../AST";

import Parser, {lazy} from "../Parser";
import {keyword} from "./common";
import {parseLines} from "./block";

export
var parseArgumentList = lazy(() =>
  keyword("(").thenTake(parseLines).thenSkip(keyword(")"))
);

export
var parseFunctionCall: Parser<(value: ExpressionAST) => ExpressionAST> = lazy(() =>
  parseArgumentList.map(args =>
    (value: ExpressionAST) => new FunctionCallAST(value.range, value, args, false)
  )
);
