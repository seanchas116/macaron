import {
  ExpressionAST,
  IdentifierAST,
  FunctionAST,
  ClassAST
} from "../AST";

import Parser, {choose, sequence, lazy} from "../Parser";
import {keyword, separated} from "./common";
import {parseExpression} from "./expression";
import {parseIdentifier} from "./identifier";
import {parseBlock} from "./block";
import {parseParameterList} from "./function";

var parseMethod = lazy(() =>
  sequence(
    parseIdentifier,
    parseParameterList,
    parseExpression.mayBe(),
    parseBlock
  )
    .withRange()
    .map(([[name, parameters, returnType, expressions], range]) =>
      new FunctionAST(range.begin, name, parameters, returnType, expressions)
    )
);

// TODO: parse property
var parseMember = parseMethod;

var parseSuperType = lazy(() =>
  keyword(":").thenTake(parseExpression)
);

export
var parseClass = lazy(() =>
  sequence(
    keyword("class").thenTake(parseIdentifier),
    parseSuperType.mayBe(),
    keyword("{")
      .thenTake(separated(parseMember))
      .thenSkip(keyword("}"))
  )
    .withRange()
    .map(([[name, superType, members], range]) =>
      new ClassAST(range.begin, name, superType, members)
    )
);
