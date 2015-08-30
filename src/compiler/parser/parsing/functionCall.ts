import {
  ExpressionAST,
  FunctionCallAST
} from "../AST";

import Parser, {choose, sequence, lazy} from "../Parser";
import {keyword} from "./common";
import {parseLines} from "./block";
import {parseMemberAccess} from "./memberAccess";

var parseArgumentList = lazy(() =>
  keyword("(").thenTake(parseLines).thenSkip(keyword(")"))
);

export
var parseFunctionCall = lazy(() =>
  sequence(
    keyword("new").repeat(),
    parseMemberAccess,
    parseArgumentList.repeat()
  )
    .withRange()
    .map(([[news, func, argLists], range]) => {
      // Parse expressions like `new new new foo()()` or `new foo()()()`
      const count = Math.max(news.length, argLists.length);
      let ast: ExpressionAST = func;
      for (let i = 0; i < count; ++i) {
        let args: ExpressionAST[];
        if (i < argLists.length) {
          args = argLists[i];
        } else {
          args = [];
        }

        const isNewCall = i < news.length;
        ast = new FunctionCallAST(range.begin, ast, args, isNewCall);
      }
      return ast;
    })
);
