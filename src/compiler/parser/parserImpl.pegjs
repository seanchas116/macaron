{
  const AST = require("./AST");
  const SourceLocation = require("../common/SourceLocation");

  const binaryOperators = [
    ["**"],
    ["*", "/", "%"],
    ["+", "-"],
    ["<<", ">>", ">>>"],
    ["<", "<=", ">", ">="],
    ["=="], ["!="],
    ["&"],
    ["^"],
    ["|"],
    ["&&"],
    ["||"],
  ];

  function currentLocation() {
    return new SourceLocation(line(), column(), offset());
  }

  function buildBinaryExpression(first, rest) {
    let operands = [first, ...rest.map(t => t[2])];
    let operators = rest.map(t => t[0]);

    for (const reducingOperators of binaryOperators) {
      for (let i = 0; i < operators.length; ++i) {
        if (reducingOperators.indexOf(operators[i].name) >= 0) {
          operands[i] = new AST.BinaryAST(operators[i].location, operands[i], operators[i], operands[i + 1]);
          operands.splice(i + 1, 1);
          operators.splice(i, 1);
          --i;
        }
      }
    }
    return operands[0];
  }
}

Start
  = _ lines:Lines
{
  return lines;
}

Whitespace
  = "\t"
  / "\v"
  / "\f"
  / " "

Separator
  = "\n"
  / ","

Escaped
  = "\\" char:.
{
  return char;
}

FloatFrac
  = "." [0-9]+

FloatExp
  = [eE] "-"? [0-9]+

DecimalInt
  = [0-9]+

Float
  = DecimalInt FloatFrac? FloatExp?
{
  return Number.parseFloat(text());
}

HexInt
  = "0x" [0-9a-fA-F]+
{
  return Number.parseInt(text().slice(2), 16);
}

BinaryInt
  = "0b" [01]+
{
  return Number.parseInt(text().slice(2), 2);
}

Number = BinaryInt / HexInt / Float

String1Char
  = Escaped / [^']

String1
  = "'" chars:String1Char* "'"
{
  return chars.join("");
}

String2Char
  = Escaped / [^"]

String2
  = '"' chars:String2Char* '"'
{
  return chars.join("");
}

String
  = String1 / String2

BinaryOperator
  = op:(
    "**" / "*" / "/" / "%" / "+" / "-" / "<<" / ">>>" / ">>" /
    "<" / "<=" / ">" / ">=" / "==" / "!=" / "^" / "||" / "&&" / "|" / "&"
    ) _
{
  return new AST.OperatorAST(currentLocation(), op);
}

UnaryOperator
  = op:("+" / "-" / "~" / "!") _
{
  return new AST.OperatorAST(currentLocation(), op);
}

AssignmentOperator
  = op:"=" _
{
  return new AST.OperatorAST(currentLocation(), op);
}

// TODO: support non-ascii identifier

IdentifierHead
  = [a-zA-Z$_]

IdentifierTail
  = [a-zA-Z$_0-9]

IdentifierString
  = IdentifierHead IdentifierTail*
{
  return text();
}

_ = Whitespace*

// whitespaces and >=0 separator
__ = (Whitespace / Separator)*

// whitespaces and >0 separator
___ = _ Separator (_ Separator)* _

ClassKeyword = "class" _
NewKeyword = "new" _
FuncKeyword = "func" _

Expression
  = expr:NewVariableExpression _
{
  return expr;
}

NewVariableExpression
  = declaration:("let" / "var") _ left:Assignable "=" _ right:NewVariableExpression
{
  return new AST.NewVariableAST(currentLocation(), declaration, left, right);
}
  / AssignmentExpression

AssignmentExpression
  = left:Assignable operator:AssignmentOperator right:AssignmentExpression
{
  return new AST.AssignmentAST(currentLocation(), left, operator, right);
}
  / BinaryExpression

BinaryExpression
  = first:UnaryExpression _ rest:(BinaryOperator _ UnaryExpression _)*
{
  return buildBinaryExpression(first, rest);
}

UnaryExpression
  = ControlExpression
  / operator:UnaryOperator _ argument:ControlExpression
{
  return new AST.UnaryAST(currentLocation(), operator, argument);
}

ControlExpression
  = IfExpression / FunctionCall

IfExpression
  = "if" _ cond:Expression ifTrue:Block ifFalse:ElseExpression?
{
  return new AST.IfAST(currentLocation(), cond, ifTrue, ifFalse || []);
}

ElseExpression
  = "else" _ expr:(e:IfExpression { return [e]; } / Block)
{
  return expr;
}

FunctionCall
  = news:NewKeyword* func:MemberAccess _ argLists:ArgumentList*
{
  // Parse expressions like `new new new foo()()` or `new foo()()()`
  const count = Math.max(news.length, argLists.length);
  let ast = func;
  for (let i = 0; i < count; ++i) {
    let args;
    if (i < argLists.length) {
      args = argLists[i];
    } else {
      args = [];
    }

    const isNewCall = i < news.length;
    ast = new AST.FunctionCallAST(currentLocation(), ast, args, isNewCall);
  }
  return ast;
}

MemberAccess
  = obj:Value "." _ member:Identifier
{
  return new AST.MemberAccessAST(currentLocation(), obj, member);
}
  / "@" _ member:Identifier
{
  return new AST.MemberAccessAST(
    currentLocation(),
    new AST.IdentifierAST(currentLocation(), "this"),
    member
  );
}
  / Value

Assignable
  = Identifier

Value
  = ast:(Parentheses / Literal / Identifier) _
{
  return ast;
}

Parentheses
  = "(" _  expr:Expression _ ")" _
{
  return expr;
}

Literal
  = NumberLiteral / StringLiteral / Function / NamedFunction / Class / Interface

// TODO: parse other than integer
NumberLiteral
  = num:Number _
{
  return new AST.LiteralAST(currentLocation(), num);
}

// TODO: parse escapes correctly
StringLiteral
  = str:String _
{
  return new AST.LiteralAST(currentLocation(), str);
}

Identifier
  = str:IdentifierString _
{
  return new AST.IdentifierAST(currentLocation(), str);
}

Lines
  = __ first:Expression? rest:(___ Expression)* __
{
  if (first) {
    return [first, ...rest.map(l => l[1])];
  } else {
    return [];
  }
}

Block
  = "{" _ expressions:Lines "}" _
{
  return expressions;
}

Parameter
  = name:Identifier type:Expression
{
  return new AST.ParameterAST(currentLocation(), name, type);
}

Parameters
  = __ first:Parameter? rest:(___ Parameter)* __
{
  if (first) {
    return [first, ...rest.map(l => l[1])];
  } else {
    return [];
  }
}

ParameterList
  = "(" params:Parameters ")" _
{
  return params;
}

Function
  = parameters:ParameterList "=>" _ expressions:Block
{
  return new AST.FunctionAST(currentLocation(), new AST.IdentifierAST("", currentLocation()), parameters, null, expressions);
}

NamedFunction
  = FuncKeyword name:Identifier parameters:ParameterList returnType:Expression? expressions:Block
{
  return new AST.FunctionAST(currentLocation(), name, parameters, returnType, expressions, true);
}

ArgumentList
  = "(" args:Lines ")" _
{
  return args;
}

Superclass
  = ":" _ superclass:Expression
{
  return superclass;
}

Class
  = ClassKeyword name:Identifier superclass: Superclass? __ "{" __ members:ClassMembers "}" _
{
  return new AST.ClassAST(currentLocation(), name, superclass, members);
}

ClassMembers
  = first:ClassMember rest:(___ ClassMember)* __
{
  if (first) {
    return [first, ...rest.map(l => l[1])];
  } else {
    return [];
  }
}

ClassMember
  = ClassMethod

ClassMethod
  = name:Identifier _ params:ParameterList returnType:Expression? exps:Block
{
  return new AST.FunctionAST(currentLocation(), name, params, returnType, exps);
}

SuperTypes
  = ":" _ types:Lines
{
  return types;
}

Interface
  = "interface" _ name:Identifier superTypes: SuperTypes? __ "{" __ members:MemberDeclarations "}" _
{
  return new AST.InterfaceAST(currentLocation(), name, superTypes, members);
}

MemberDeclarations
  = first:MemberDeclaration rest:(___ MemberDeclaration)* __
{
  if (first) {
    return [first, ...rest.map(l => l[1])];
  } else {
    return [];
  }
}

MemberDeclaration =
  MethodDeclaration

MethodDeclaration
  = name:Identifier _ params:ParameterList returnType:Expression
{
  return new AST.FunctionAST(currentLocation(), name, params, returnType, null);
}
