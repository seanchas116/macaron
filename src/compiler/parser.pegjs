{
  const AST = require("./AST");
  const SourceLocation = require("./SourceLocation");

  const binaryOperators = [
    ["*", "/"],
    ["+", "-"]
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
  = op:[+\-*/]
{
  return new AST.OperatorAST(currentLocation(), op);
}

UnaryOperator
  = op:[+\-]
{
  return new AST.OperatorAST(currentLocation(), op);
}

DeclarationKeyword
  = "let"
  / "var"

AssignmentOperator
  = op:"="
{
  return new AST.OperatorAST(currentLocation(), op);
}

// TODO: support non-ascii identifier

IdentifierHead
  = [a-zA-Z$_]

IdentifierTail
  = [a-zA-Z$_0-9]

_ = Whitespace*

// whitespaces and >=0 separator
__ = (Whitespace / Separator)*

// whitespaces and >0 separator
___ = _ Separator (_ Separator)* _

ClassKeyword = "class"

Expression
  = expr:AssignmentExpression _
{
  return expr;
}

AssignmentExpression
  = declaration:DeclarationKeyword? _ left:Assignable _ operator:AssignmentOperator _ right:AssignmentExpression
{
  return new AST.AssignmentAST(currentLocation(), declaration, left, operator, right);
}
  / BinaryExpression

BinaryExpression
  = first:UnaryExpression _ rest:(BinaryOperator _ UnaryExpression _)*
{
  return buildBinaryExpression(first, rest);
}

UnaryExpression
  = FunctionCall
  / operator:UnaryOperator _ argument:FunctionCall
{
  return new AST.UnaryAST(currentLocation(), operator, argument);
}

FunctionCall
  = func:Value _ argLists:ArgumentList*
{
  return argLists.reduce((func, args) => new AST.FunctionCallAST(currentLocation(), func, args), func);
}

Assignable
  = Identifier

Value
  = ast:(Parentheses / Literal / Identifier) _
{
  return ast;
}

Parentheses
  = "(" _  expr:Expression _ ")"
{
  return expr;
}

Literal
  = NumberLiteral / StringLiteral / Function / Class

// TODO: parse other than integer
NumberLiteral
  = str:[0-9]+
{
  return new AST.NumberAST(currentLocation(), Number.parseFloat(str));
}

// TODO: parse escapes correctly
StringLiteral
  = str:String
{
  return new AST.StringAST(currentLocation(), str);
}

Identifier
  = head:IdentifierHead tail:IdentifierTail* _
{
  return new AST.IdentifierAST(currentLocation(), head + tail.reduce((a, b) => a + b, ""));
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
  = parameters:ParameterList "=>" _ expressions:Block _
{
  return new AST.FunctionAST(currentLocation(), parameters, expressions);
}

ArgumentList
  = "(" args:Lines ")" _
{
  return args;
}

Class
  = ClassKeyword _ name:Identifier __ "{" __ members:ClassMembers "}" _
{
  return new AST.ClassAST(currentLocation(), name, members);
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
  = name:Identifier _ params:ParameterList _ exps:Block _
{
  return new AST.ClassMethodAST(currentLocation(), name, params, exps);
}
