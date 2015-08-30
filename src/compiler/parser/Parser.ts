import BaseError from "../common/BaseError";

export
class Position {
  constructor(public index: number, public line: number, public column: number) {
  }
  toString() {
    return `${this.line}:${this.column} [${this.index}]`;
  }
}

export
class Range {
  constructor(public begin: Position, public end: Position) {
  }
}

export
class State {
  constructor(public text: string, public position: Position, public trace: boolean) {
  }

  substring(length: number) {
    return this.text.slice(this.position.index, this.position.index + length);
  }

  currentChar() {
    return this.text.charAt(this.position.index);
  }

  proceed(offset: number) {
    offset = Math.min(this.text.length - this.position.index, offset);
    const proceedStr = this.substring(offset);
    const proceedLines = proceedStr.split(/\r\n|\n|\r/);

    const newPos = new Position(
      this.position.index + offset,
      this.position.line + proceedLines.length - 1,
      proceedLines[proceedLines.length - 1].length + 1
    );
    return new State(this.text, newPos, this.trace);
  }
}

export
class Success<T> {
  constructor(public state: State, public value: T) {
  }
  toString() {
    return `[Success position=${this.state.position} value=${this.value}]`;
  }
}

export
class Failure {
  constructor(public state: State, public expected: string[]) {
  }
  toString() {
    return `[Failure position=${this.state.position} expected=[${this.expected}]`;
  }
}

export
class SyntaxError extends BaseError {
  constructor(public position: Position, public expected: string[], public found: string) {
    super();
    this.name = "SyntaxError";
    this.message = `${position.line}:${position.column}: Expected ${
      expected.map(e => `'${e}'`).join(", ")
    }; found ${found}`;
  }
}

export
type Result<T> = Success<T> | Failure;

interface ParserOpts {

}

export default
class Parser<T> {
  constructor(private _parse: (state: State) => Result<T>) {
  }

  parseFrom(state: State) {
    const result = this._parse(state);
    if (state.trace) {
      console.log(result.toString());
    }
    return result;
  }

  parse(text: string, trace = false) {
    const state = new State(text, new Position(0, 1, 1), trace);
    const result = this.parseFrom(state);
    if (result instanceof Success) {
      if (result.state.position.index == text.length) {
        return result.value;
      } else {
        throw new SyntaxError(result.state.position, ["EOF"], result.state.currentChar());
      }
    } else if (result instanceof Failure) {
      throw new SyntaxError(result.state.position, result.expected, result.state.currentChar());
    }
  }

  then<U>(getNext: (value: T) => Parser<U>): Parser<U> {
    return new Parser(state => {
      const result = this.parseFrom(state);
      if (result instanceof Failure) {
        return result;
      }
      else if (result instanceof Success) {
        return getNext(result.value).parseFrom(result.state);
      }
    });
  }

  map<U>(transform: (value: T) => U): Parser<U> {
    return new Parser(state => {
      const result = this.parseFrom(state);
      if (result instanceof Failure) {
        return result;
      }
      else if (result instanceof Success) {
        return new Success(result.state, transform(result.value));
      }
    });
  }

  forEach(action: (value: T) => void) {
    return this.map(x => {
      action(x);
      return x;
    });
  }

  repeat(min = 0, max = Infinity) {
    return new Parser(state => {
      const values: T[] = [];
      for (let count = 0; true; ++count) {
        if (max <= count) {
          return new Success(state, values);
        }

        const result = this.parseFrom(state);
        if (result instanceof Success) {
          state = result.state;
          values.push(result.value);
        } else if (result instanceof Failure) {
          if (count < min) {
            return result;
          } else {
            return new Success(result.state, values);
          }
        }
      }
    });
  }

  mayBe() {
    return this.repeat(0, 1);
  }

  withRange(): Parser<[T, Range]> {
    return new Parser(state => {
      const begin = state.position;
      const result = this.parseFrom(state);
      if (result instanceof Success) {
        const end = result.state.position;
        const valueWithRange: [T, Range] = [result.value, new Range(begin, end)];
        return new Success(result.state, valueWithRange);
      } else if (result instanceof Failure) {
        return result;
      }
    });
  }

  text(): Parser<string> {
    return new Parser(state => {
      const begin = state.position.index;
      const result = this.parseFrom(state);
      const end = result.state.position.index;
      const text = state.text.slice(begin, end);
      if (result instanceof Success) {
        return new Success(result.state, text);
      } else if (result instanceof Failure) {
        return result;
      }
    });
  }

  thenSkip<U>(parser: Parser<U>) {
    return sequence(this, parser).map(([a, b]) => a);
  }
  thenTake<U>(parser: Parser<U>) {
    return sequence(this, parser).map(([a, b]) => b);
  }
}

export function sequence<T0>(p0: Parser<T0>): Parser<[T0]>
export function sequence<T0, T1>(p0: Parser<T0>, p1: Parser<T1>): Parser<[T0, T1]>
export function sequence<T0, T1, T2>(p0: Parser<T0>, p1: Parser<T1>, p2: Parser<T2>): Parser<[T0, T1, T2]>
export function sequence<T0, T1, T2, T3>(p0: Parser<T0>, p1: Parser<T1>, p2: Parser<T2>, p3: Parser<T3>): Parser<[T0, T1, T2, T3]>
export function sequence<T0, T1, T2, T3, T4>(p0: Parser<T0>, p1: Parser<T1>, p2: Parser<T2>, p3: Parser<T3>, p4: Parser<T4>): Parser<[T0, T1, T2, T3, T4]>
export function sequence<T0, T1, T2, T3, T4, T5>(p0: Parser<T0>, p1: Parser<T1>, p2: Parser<T2>, p3: Parser<T3>, p4: Parser<T4>, p5: Parser<T5>): Parser<[T0, T1, T2, T3, T4, T5]>
export function sequence<T0, T1, T2, T3, T4, T5, T6>(p0: Parser<T0>, p1: Parser<T1>, p2: Parser<T2>, p3: Parser<T3>, p4: Parser<T4>, p5: Parser<T5>, p6: Parser<T6>): Parser<[T0, T1, T2, T3, T4, T5, T6]>
export function sequence<T0, T1, T2, T3, T4, T5, T6, T7>(p0: Parser<T0>, p1: Parser<T1>, p2: Parser<T2>, p3: Parser<T3>, p4: Parser<T4>, p5: Parser<T5>, p6: Parser<T6>, p7: Parser<T7>): Parser<[T0, T1, T2, T3, T4, T5, T6, T7]>

export
function sequence(...parsers: any[]): Parser<any> {
  return new Parser(state => {
    const values: any[] = [];

    for (const parser of parsers) {
      const result = parser.parseFrom(state);
      if (result instanceof Success) {
        state = result.state;
        values.push(result.value);
      } else if (result instanceof Failure) {
        return result;
      }
    }
    return new Success(state, values);
  });
}

// parser1 / parser2 / ...
export
function choose<T>(...parsers: Parser<T>[]): Parser<T> {
  return new Parser(state => {
    const expected: string[] = [];

    for (const parser of parsers) {
      const result = parser.parseFrom(state);
      if (result instanceof Success) {
        return result;
      } else if (result instanceof Failure) {
        expected.push(...result.expected);
      }
    }

    return new Failure(state, expected);
  });
}

// "string"
export
function string(text: string): Parser<string> {
  return new Parser(state => {
    const substr = state.substring(text.length);
    if (substr == text) {
      return new Success(state.proceed(text.length), text);
    }
    else {
      return new Failure(state, [text]);
    }
  });
}

export
function testChar(test: (char: string) => boolean, expected: string[]): Parser<string> {
  return new Parser(state => {
    const substr = state.substring(1);
    if (test(substr)) {
      return new Success(state.proceed(1), substr);
    }
    else {
      return new Failure(state, expected);
    }
  });
}

// /[0-9a-zA-Z]/
export
function regExp(re: RegExp): Parser<string> {
  return testChar(c => !!c.match(re), [re.toString()]);
}

export
const anyChar = testChar((c) => c.length == 1, ["[any character]"]);

export
function lazy<T>(get: () => Parser<T>) {
  let parser: Parser<T>;
  return new Parser(state => {
    if (!parser) {
      parser = get();
    }
    return parser.parseFrom(state);
  });
}
