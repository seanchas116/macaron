import {LiteralAST} from "../AST";
import {choose, sequence, string, regExp, anyChar} from "../Parser";

const parseEscaped =
  string("\\").then(() => anyChar);

const parseString1Char =
  choose(parseEscaped, regExp(/[^']/));

const parseString2Char =
  choose(parseEscaped, regExp(/[^"]/));

const parseString1 =
  sequence(string("'"), parseString1Char.repeat(), string("'")).text();

const parseString2 =
  sequence(string('"'), parseString2Char.repeat(), string('"')).text();

export
const parseStringLiteral =
  choose(parseString1, parseString2)
    .text()
    .withRange()
    .map(([str, range]) => new LiteralAST(range.begin, str));
