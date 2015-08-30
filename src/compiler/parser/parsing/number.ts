import {LiteralAST} from "../AST";
import {choose, sequence, string, regExp} from "../Parser";

const parseFloatFrac =
  sequence(
    string("."),
    regExp(/[0-9]/).repeat(1)
  );

const parseFloatExp =
  sequence(
    regExp(/[eE]/),
    string("-").mayBe(),
    regExp(/[0-9]/).repeat(1)
  );

const parseDecimalInt = regExp(/[0-9]/).repeat(1);

const parseFloat =
  sequence(
    parseDecimalInt,
    parseFloatFrac.mayBe(),
    parseFloatExp.mayBe()
  )
    .text()
    .map(Number.parseFloat);

const parseHexInt =
  sequence(
    string("0x"),
    regExp(/[0-9a-fA-F]/).repeat(1)
  )
    .text()
    .map(text => Number.parseInt(text.slice(2), 16));

const parseBinaryInt =
  sequence(
    string("0b"),
    regExp(/[01]/).repeat(1)
  )
    .text()
    .map(text => Number.parseInt(text.slice(2), 2));

export
const parseNumberAST =
  choose(parseBinaryInt, parseHexInt, parseFloat)
    .withRange()
    .map(([num, range]) => new LiteralAST(range.begin, num));
