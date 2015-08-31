import Parser, {
  choose,
  sequence,
  string,
  regExp,
  anyChar
} from "../Parser";

export
const whitespace = regExp(/[\t\v\f ]/);

export
const separator = regExp(/[\n,]/);

export
const _ = whitespace.repeat();

export
const __ = choose(whitespace, separator).repeat();

export
const ___ = sequence(_, separator, sequence(_, separator).repeat(), _);

export
function keyword(text: string) {
  return string(text).thenSkip(_);
}

export
function separated<T>(parser: Parser<T>) {
  return sequence(
      __.thenTake(parser.mayBe()),
      ___.thenTake(parser).repeat().thenSkip(__)
    )
    .map(([first, rest]) => first ? [first].concat(rest) : []);
}
