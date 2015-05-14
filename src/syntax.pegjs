{
  const BinaryExpression = require("./ast/BinaryExpression");
  const NumberLiteral = require("./ast/NumberLiteral");
  const UnaryExpression = require("./ast/UnaryExpression");

  const binaryOperators = [
    ["*", "/"],
    ["+", "-"]
  ];

  function buildBinaryExpression(first, rest) {
    let operands = [first, ...rest.map(t => t[2])];
    let operators = rest.map(t => t[0]);
    console.log(operands);
    console.log(operators);

    for (const reducingOperators of binaryOperators) {
      for (let i = 0; i < operators.length; ++i) {
        if (reducingOperators.indexOf(operators[i]) >= 0) {
          operands[i] = new BinaryExpression(operands[i], operators[i], operands[i + 1]);
          operands.splice(i + 1, 1);
          operators.splice(i, 1);
        }
      }
    }
    return operands[0];
  }
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
  = first:UnaryExpression _ rest:(BinaryOperator _ UnaryExpression _)*
{
  return buildBinaryExpression(first, rest);
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
