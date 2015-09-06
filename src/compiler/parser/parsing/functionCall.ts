import {
  ExpressionAST,
  FunctionCallAST,
  MemberAccessAST
} from "../AST";

import Parser, {choose, sequence, lazy} from "../Parser";
import {keyword} from "./common";
import {parseLines} from "./block";
import {parseMemberAccess} from "./memberAccess";
import {parseValue} from "./value";
import {parseIdentifier} from "./identifier";

var parseArgumentList = lazy(() =>
  keyword("(").thenTake(parseLines).thenSkip(keyword(")"))
);

export
var parseFunctionCall = lazy(() =>
  sequence(
    keyword("new").repeat(),
    parseValue,
    parseArgumentList.repeat(),
    keyword(".").thenTake(
      sequence(
        parseIdentifier,
        parseArgumentList.repeat()
      )
    ).repeat()
  )
    .withRange()
    .map(([[news, first, firstArgLists, rest], range]) => {
      let newCount = news.length;
      let ast: ExpressionAST = first;

      function consumeNew() {
        if (newCount > 0) {
          --newCount;
          return true;
        }
        return false;
      }

      function applyCalls(argLists: ExpressionAST[][]) {
        for (const args of argLists) {
          ast = new FunctionCallAST(range.begin, ast, args, consumeNew());
        }
      }

      applyCalls(firstArgLists);

      for (const [ident, argLists] of rest) {
        ast = new MemberAccessAST(ident.location, ast, ident);
        applyCalls(argLists);
      }

      return ast;
    })
);
