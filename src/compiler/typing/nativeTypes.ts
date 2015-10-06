import Type from "./Type";
import SourceLocation from "../common/SourceLocation";
const once = require("once");

import {
  NativeOperator
} from "./Operator";

import CallSignature from "./CallSignature";

export
const typeOnlyType = new Type("[type]");

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

let initialized = false;

export
const initNativeTypes: () => void = once(() => {
  function addNativeBinaryOp(type: Type, name: string, ret: Type = type, nativeName = name) {
    const opType = new Type(`${type} operator ${name}`);
    opType.callSignatures = [new CallSignature(type, [type], ret)];
    type.binaryOperators.set(name, new NativeOperator(nativeName, opType));
  }

  function addNativeUnaryOp(type: Type, name: string, ret: Type = type) {
    const opType = new Type(`${type} operator ${name}`);
    opType.callSignatures = [new CallSignature(type, [], ret)];
    type.unaryOperators.set(name, new NativeOperator(name, opType));
  }

  addNativeBinaryOp(anyType, "==", booleanType, "===");
  addNativeBinaryOp(anyType, "!=", booleanType, "!==");

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

  addNativeUnaryOp(numberType, "+");
  addNativeUnaryOp(numberType, "-");
  addNativeUnaryOp(numberType, "~");

  addNativeBinaryOp(booleanType, "&&");
  addNativeBinaryOp(booleanType, "||");
  addNativeUnaryOp(booleanType, "!");

  addNativeBinaryOp(stringType, "+");

  // TODO: add equality operator without inheriting anyType
  numberType.inherit(anyType);
  booleanType.inherit(anyType);
  stringType.inherit(anyType);
});
