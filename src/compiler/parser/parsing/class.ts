import {
  ExpressionAST,
  IdentifierAST,
  FunctionAST,
  ClassAST,
  InterfaceAST
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
      new FunctionAST(range.begin, name, [], parameters, returnType, expressions)
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

var parseMethodDeclaration = lazy(() =>
  sequence(
    parseIdentifier,
    parseParameterList,
    parseExpression
  )
    .withRange()
    .map(([[name, params, returnType], range]) =>
      new FunctionAST(range.begin, name, [], params, returnType, null)
    )
);

var parseMemberDeclaration = parseMethodDeclaration;

var parseSuperTypes = lazy(() =>
  keyword(":").thenTake(separated(parseExpression))
);

export
var parseInterface = lazy(() =>
  sequence(
    keyword("interface").thenTake(parseIdentifier),
    parseSuperTypes.mayBe(),
    keyword("{")
      .thenTake(separated(parseMemberDeclaration))
      .thenSkip(keyword("}"))
  )
    .withRange()
    .map(([[name, superTypes, members], range]) =>
      new InterfaceAST(range.begin, name, superTypes, members)
    )
);
