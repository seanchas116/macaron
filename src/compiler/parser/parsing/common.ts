import {choose, sequence, string, regExp, anyChar} from "../Parser";

const whitespace = choose(string("\t"), string("\v"), string("\f"), string(" "));

export
const whitespaces = whitespace.repeat();
