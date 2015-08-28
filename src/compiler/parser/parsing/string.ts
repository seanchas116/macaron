import {LiteralAST} from "../AST";
import {choose, sequence, string, regExp, anyChar} from "../Parser";
import {whitespaces} from "./common";

const parseEscaped =
  string("\\").then(() => anyChar);

const parseString1Char =
  choose(parseEscaped, regExp("^'"));

const parseString2Char =
  choose(parseEscaped, regExp('^"'));

const parseString1 =
  sequence<any>(string("'"), parseString1Char.repeat(), string("'")).text();

const parseString2 =
  sequence<any>(string('"'), parseString2Char.repeat(), string('"')).text();

export
const parseStringAST =
  choose(parseString1, parseString2).then(str =>
    whitespaces.map(() => str)
  )
    .withRange()
    .map(([str, range]) => new LiteralAST(range.begin, str));
