import {LiteralAST} from "../AST";
import {choose, sequence, string, regExp, anyChar} from "../Parser";
import {_} from "./common";

const parseEscaped =
  string("\\").thenTake(anyChar);

const parseString1Char =
  choose(parseEscaped, regExp(/[^']/));

const parseString2Char =
  choose(parseEscaped, regExp(/[^"]/));

const parseString1 =
  string("'")
    .thenTake(parseString1Char.repeat().text())
    .thenSkip(string("'"));

const parseString2 =
  string('"')
    .thenTake(parseString2Char.repeat().text())
    .thenSkip(string('"'));

export
const parseStringLiteral =
  choose(parseString1, parseString2)
    .thenSkip(_)
    .withRange()
    .map(([str, range]) => new LiteralAST(range, str));
