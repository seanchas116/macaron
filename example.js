import parser from "./src/parser";
import Environment from "./src/Environment";
import TypeEvaluator from "./src/TypeEvaluator";

const source = `
let f = (a Number, b Number) => {
  a + b
}
1 + 2 * 1 * f(1, 2)
`;

let parsed;

try {
  parsed = parser.parse(source)
} catch (e) {
  console.log(`At ${e.line}:${e.column}`);
  console.log(e.message);
}

console.log(JSON.stringify(parsed, null, 2));

const env = new Environment();
const evaluator = new TypeEvaluator();

const expr = evaluator.evaluate(parsed, env);

console.log(JSON.stringify(expr, null, 2));
