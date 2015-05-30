{
  const AST = require("./AST");

  const binaryOperators = [
    ["*", "/"],
    ["+", "-"]
  ];

  function buildBinaryExpression(first, rest) {
    let operands = [first, ...rest.map(t => t[2])];
    let operators = rest.map(t => t[0]);

    for (const reducingOperators of binaryOperators) {
      for (let i = 0; i < operators.length; ++i) {
        if (reducingOperators.indexOf(operators[i]) >= 0) {
          operands[i] = new AST.BinaryAST(operands[i], operators[i], operands[i + 1]);
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

BinaryOperator
  = op:[+\-*/]
{
  return new AST.OperatorAST(op);
}

UnaryOperator
  = op:[+\-]
{
  return new AST.OperatorAST(op);
}

DeclarationKeyword
  = "let"
  / "var"

AssignmentOperator
  = op:"="
{
  return new AST.OperatorAST(op);
}

IdentifierHead
  = [a-zA-Z$_]

IdentifierTail
  = [a-zA-Z$_0-9]

_ = Whitespace*

// whitespaces and >=0 separator
__ = (Whitespace / Separator)*

// whitespaces and >0 separator
___ = _ Separator (_ Separator)* _

Expression
  = expr:AssignmentExpression _
{
  return expr;
}

AssignmentExpression
  = declaration:DeclarationKeyword? _ left:Assignable _ operator:AssignmentOperator _ right:AssignmentExpression
{
  return new AST.AssignmentAST(declaration, left, operator, right);
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
  return new AST.UnaryAST(operator, argument);
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
  = Number / Function

Number
  = str:[0-9]+
{
  return new AST.NumberAST(Number.parseFloat(str));
}

Identifier
  = head:IdentifierHead tail:IdentifierTail* _
{
  return new AST.IdentifierAST(head + tail.reduce((a, b) => a + b, ""));
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
  return new AST.ParameterAST(name, type);
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
  return new AST.FunctionAST(parameters, expressions);
}

ArgumentList
  = "(" args:Lines ")" _
{
  return args;
}

FunctionCall
  = func:Value _ argLists:ArgumentList*
{
  return argLists.reduce((func, args) => new AST.FunctionCallAST(func, args), func);
}
