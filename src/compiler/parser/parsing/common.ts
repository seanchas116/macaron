import {choose, sequence, string, regExp, anyChar} from "../Parser";

const whitespace = regExp(/[\t\v\f ]/);

export
const whitespaces = whitespace.repeat();
