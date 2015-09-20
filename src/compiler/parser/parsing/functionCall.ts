import {
  ExpressionAST,
  GenericsCallAST,
} from "../AST";

import Parser, {choose, sequence, lazy} from "../Parser";
import {keyword} from "./common";
import {parseLines} from "./block";

export
var parseArgumentList = lazy(() =>
  keyword("(").thenTake(parseLines).thenSkip(keyword(")"))
);

export
var parseFunctionCall: Parser<(value: ExpressionAST) => ExpressionAST> = lazy(() =>
  parseArgumentList.map(args =>
    (value: ExpressionAST) => new GenericsCallAST(value.location, value, args)
  )
);
