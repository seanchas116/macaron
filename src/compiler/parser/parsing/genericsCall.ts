import {
  ExpressionAST,
  GenericsCallAST,
} from "../AST";

import {Parser, lazy} from "tparse";
import {keyword, separated} from "./common";
import {parsePostfix} from "./postfix";

export
var parseGenericsArgumentList = lazy(() =>
  keyword("<").thenTake(separated(parsePostfix)).thenSkip(keyword(">"))
);

export
var parseGenericsCall: Parser<(value: ExpressionAST) => ExpressionAST> = lazy(() =>
  parseGenericsArgumentList.map(args =>
    (value: ExpressionAST) => new GenericsCallAST(value.range, value, args)
  )
);
