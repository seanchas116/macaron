{
  const {BinaryExpression, UnaryExpression, NumberLiteral} = require("./ast");
}

Start
  = Expression

Whitespace
  = "\t"
  / "\v"
  / "\f"
  / " "

BinaryOperator
  = "+"
  / "-"
  / "*"
  / "/"

UnaryOperator
  = "+"
  / "-"

_ = Whitespace*

Expression
  = _ expr:BinaryExpression _
{
  return expr;
}

BinaryExpression
  = first:UnaryExpression _ rest:(BinaryOperator _ BinaryExpression)?
{
  if (rest) {
    return new BinaryExpression(first, rest[0], rest[2]);
  } else {
    return first;
  }
}

UnaryExpression
  = Value / operator:UnaryOperator _ argument:UnaryExpression
{
  return new UnaryExpression(operator, argument);
}

Value
  = Parentheses / Literal

Parentheses
  = "(" _  expr:Expression _ ")"
{
  return expr;
}

Literal
  = str:[0-9]+
{
  return new NumberLiteral(Number.parseFloat(str));
}
