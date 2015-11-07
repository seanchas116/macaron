import AST, {
  ExpressionAST,
  GenericsParameterAST,
  IdentifierAST,
  FunctionAST
} from "../AST";

import Parser, {choose, sequence, lazy} from "../Parser";
import {keyword, separated} from "./common";
import {parseTypeExpression} from "./typeExpression";
import {parseIdentifier} from "./identifier";
import {parseAssignable} from "./assignable";
import {parseBlock} from "./block";

export
var parseParameterList = lazy(() =>
  keyword("(")
    .thenTake(separated(parseAssignable))
    .thenSkip(keyword(")"))
);

var parseGenericsParameter = lazy(() =>
  sequence(parseIdentifier, keyword(":").thenTake(parseTypeExpression).mayBe())
    .withRange()
    .map(([[name, type], range]) => new GenericsParameterAST(range, name, type || new IdentifierAST(range, "void")))
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
      new FunctionAST(range, new IdentifierAST(range, ""), [], parameters, null, expressions)
    )
);

var parseNamedFunction = lazy(() =>
  sequence(
    keyword("func").thenTake(parseIdentifier),
    parseGenericsParameterList.mayBe(),
    parseParameterList,
    parseTypeExpression.mayBe(),
    parseBlock
  )
    .withRange()
    .map(([[name, genericsParams, parameters, returnType, expressions], range]) =>
      new FunctionAST(range, name, genericsParams || [], parameters, returnType, expressions, true)
    )
);

export
var parseFunction = choose(parseUnnamedFunction, parseNamedFunction);
