import Type from "./Type";

import {
  NativeOperator
} from "./Operator";

import {
  UnaryOperatorKind,
  BinaryOperatorKind,
  unaryOperatorKinds,
  binaryOperatorKinds,
} from "./OperatorKind";

export
const anyType = new Type("any");

export
const voidType = anyType;

export
const numberType = new Type("number");

// all operators supported
for (const [name, kind] of unaryOperatorKinds) {
  numberType.unaryOperators.set(kind, new NativeOperator(name));
}
for (const [name, kind] of binaryOperatorKinds) {
  numberType.binaryOperators.set(kind, new NativeOperator(name));
}

export
const stringType = new PrimitiveType("string");

// supports +
stringType.binaryOperators.set(BinaryOperatorKind.Add, new NativeOperator("+"));
