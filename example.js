import parser from "./src/parser";

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

const json = JSON.stringify(parsed, null, 2);
console.log(json);
