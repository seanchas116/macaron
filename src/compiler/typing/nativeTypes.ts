import Type from "./Type";

import {
  NativeOperator
} from "./Operator";

import CallSignature from "./CallSignature";

export
const anyType = new Type("any");

export
const voidType = anyType;

export
const numberType = new Type("number");

export
const booleanType = new Type("boolean");

export
const stringType = new Type("string");

function addNativeBinaryOp(type: Type, name: string, ret: Type = type) {
  const opType = new Type(`${type} operator ${name}`);
  opType.callSignatures.push(new CallSignature(type, [type], ret));
  type.binaryOperators.set(name, new NativeOperator(name, opType));
}

function addNativeUnaryOp(type: Type, name: string, ret: Type = type) {
  const opType = new Type(`${type} operator ${name}`);
  opType.callSignatures.push(new CallSignature(type, [], ret));
  type.unaryOperators.set(name, new NativeOperator(name, opType));
}

addNativeBinaryOp(numberType, "==", booleanType);
addNativeBinaryOp(numberType, "<", booleanType);
addNativeBinaryOp(numberType, "<=", booleanType);
addNativeBinaryOp(numberType, ">", booleanType);
addNativeBinaryOp(numberType, ">=", booleanType);

addNativeBinaryOp(numberType, "+");
addNativeBinaryOp(numberType, "-");
addNativeBinaryOp(numberType, "*");
addNativeBinaryOp(numberType, "/");
addNativeBinaryOp(numberType, "%");
addNativeBinaryOp(numberType, "**");

addNativeBinaryOp(numberType, "&");
addNativeBinaryOp(numberType, "^");
addNativeBinaryOp(numberType, "|");
addNativeBinaryOp(numberType, "<<");
addNativeBinaryOp(numberType, ">>");
addNativeBinaryOp(numberType, ">>>");

addNativeUnaryOp(numberType, "-");
addNativeUnaryOp(numberType, "~");

addNativeBinaryOp(stringType, "+");
