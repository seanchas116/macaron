import AST, {
  NewVariableAST,
  FunctionAST,
  ClassAST,
  InterfaceAST
} from "../AST";

import {sequence, lazy, choose} from "tparse";
import {keyword, separated} from "./common";
import {parseExpression} from "./expression";
import {parseTypeExpression} from "./typeExpression";
import {parseIdentifier} from "./identifier";
import {parseBlock} from "./block";
import {parseParameterList} from "./function";

var parseMethod = lazy(() =>
  sequence(
    parseIdentifier,
    parseParameterList,
    parseTypeExpression.mayBe(),
    parseBlock
  )
    .withRange()
    .map(([[name, parameters, returnType, expressions], range]) =>
      new FunctionAST(range, name, [], parameters, returnType, expressions)
    )
);

var parseProperty = lazy(() =>
  sequence(
    keyword("var").mayBe(),
    parseIdentifier,
    parseTypeExpression.mayBe(),
    keyword("=").thenTake(parseExpression)
  )
    .withRange()
    .map(([[isVar, name, type, expr], range]) =>
      new NewVariableAST(range, isVar ? "var" : "let", name, type, expr)
    )
);

//var parseMember = choose<AST>(parseMethod, parseProperty);
var parseMember = parseMethod;

var parseSuperType = lazy(() =>
  keyword(":").thenTake(parseTypeExpression)
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
      new ClassAST(range, name, superType, members)
    )
);

var parseMethodDeclaration = lazy(() =>
  sequence(
    parseIdentifier,
    parseParameterList,
    parseTypeExpression
  )
    .withRange()
    .map(([[name, params, returnType], range]) =>
      new FunctionAST(range, name, [], params, returnType, null)
    )
);

var parseMemberDeclaration = parseMethodDeclaration;

var parseSuperTypes = lazy(() =>
  keyword(":").thenTake(separated(parseTypeExpression))
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
      new InterfaceAST(range, name, superTypes || [], members)
    )
);
