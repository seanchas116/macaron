import {
  Parser,
  choose,
  sequence,
  string,
  regExp
} from "tparse";

export
const whitespace = regExp(/[\t\v\f ]/);

export
const separator = regExp(/[\n,]/);

export
const nonSeparator = regExp(/[^\n,]/);

export
const comment = sequence(string("//"), nonSeparator.repeat());

export
const empty = choose<any>(whitespace, comment);

export
const _ = empty.repeat();

export
const __ = choose(empty, separator).repeat();

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
