import {choose, sequence, string, regExp, anyChar} from "../Parser";

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
