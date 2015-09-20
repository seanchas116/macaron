import {
  ExpressionAST,
  ParameterAST,
  IdentifierAST,
  FunctionAST
} from "../AST";

import Parser, {choose, sequence, lazy} from "../Parser";
import {keyword, separated} from "./common";
import {parseExpression} from "./expression";
import {parseIdentifier} from "./identifier";
import {parseBlock} from "./block";

var parseParameter = lazy(() =>
  sequence(parseIdentifier, parseExpression)
    .withRange()
    .map(([[name, type], range]) => new ParameterAST(range.begin, name, type))
);

export
var parseParameterList = lazy(() =>
  keyword("(")
    .thenTake(separated(parseParameter))
    .thenSkip(keyword(")"))
);

var parseGenericsParameter = lazy(() =>
  parseIdentifier
    .withRange()
    .map(([name, range]) => new ParameterAST(range.begin, name, new IdentifierAST(range.begin, "void")))
);

export
var parseGenericsParameterList = lazy(() =>
  keyword("<")
    .thenTake(separated(parseGenericsParameter))
    .thenSkip(keyword(">"))
);

var parseUnnamedFunction = lazy(() =>
  sequence(
    parseParameterList,
    keyword("=>").thenTake(parseBlock)
  )
    .withRange()
    .map(([[parameters, expressions], range]) =>
      new FunctionAST(range.begin, new IdentifierAST(range.begin, ""), [], parameters, null, expressions)
    )
);

var parseNamedFunction = lazy(() =>
  sequence(
    keyword("func").thenTake(parseIdentifier),
    parseGenericsParameterList.mayBe(),
    parseParameterList,
    parseExpression.mayBe(),
    parseBlock
  )
    .withRange()
    .map(([[name, genericsParams, parameters, returnType, expressions], range]) =>
      new FunctionAST(range.begin, name, genericsParams || [], parameters, returnType, expressions, true)
    )
);

export
var parseFunction = choose(parseUnnamedFunction, parseNamedFunction);
