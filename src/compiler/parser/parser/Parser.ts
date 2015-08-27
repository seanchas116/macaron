
class Position {
  constructor(public index: number, public line: number, public column: number) {
  }
}

class State {
  constructor(public text: string, public position: Position) {
  }

  substring(length: number) {
    return this.text.slice(this.position.index, length);
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
    return new State(this.text, newPos);
  }
}

class Success<T> {
  constructor(public state: State, public value: T) {
  }
}

class Failure {
  constructor(public state: State, public expected: string[]) {
  }
}

type Result<T> = Success<T> | Failure;

export default
class Parser<T> {
  constructor(private _parse: (state: State) => Result<T>) {
  }

  parseFrom(state: State) {
    return this._parse(state);
  }

  parse(text: string) {
    const state = new State(text, new Position(0, 1, 1));
    return this.parseFrom(state);
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
}

// parser1 / parser2 / ...
export
function choose<T>(parsers: Parser<T>[]): Parser<T> {
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

// parser*
export
function repeat<T>(parser: Parser<T>): Parser<T[]> {
  return new Parser(state => {
    const values: T[] = [];
    while (true) {
      const result = parser.parseFrom(state);
      if (result instanceof Success) {
        state = result.state;
        values.push(result.value);
      } else {
        return new Success(state, values);
      }
    }
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

// /[0-9a-zA-Z]/
export
function regExp(regExp: RegExp): Parser<string> {
  return new Parser(state => {
    const substr = state.substring(1);
    if (substr.match(regExp)) {
      return new Success(state.proceed(1), substr);
    }
    else {
      return new Failure(state, [regExp.toString()]);
    }
  });
}
