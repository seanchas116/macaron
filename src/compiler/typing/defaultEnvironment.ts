import Environment from "./Environment";
import Member, {Constness} from "./Member";
import InterfaceType from "./type/InterfaceType";
import MetaType from "./type/MetaType";
import ConstValueType from "./type/ConstValueType";
import CallSignature from "./CallSignature";
import {NativeOperator} from "./Operator";
import SourceRange from "../common/SourceRange";

const emptyRange = SourceRange.empty();

export const defaultEnvironment = new Environment();

export const invalidType = new InterfaceType("invalid", [], defaultEnvironment, emptyRange);
export const voidType = new InterfaceType("void", [], defaultEnvironment, emptyRange);
export const numberType = new InterfaceType("number", [voidType], defaultEnvironment, emptyRange);
export const booleanType = new InterfaceType("boolean", [voidType], defaultEnvironment, emptyRange);
export const stringType = new InterfaceType("string", [voidType], defaultEnvironment, emptyRange);

const addNativeBinaryOp = (type: InterfaceType, name: string, ret: InterfaceType = type, nativeName = name) => {
  const opType = new InterfaceType(`${type} operator ${name}`, [], defaultEnvironment, emptyRange);
  opType.callSignatures = [new CallSignature(type, [type], ret)];
  type.selfBinaryOperators.set(name, new NativeOperator(nativeName, opType));
}

const addNativeUnaryOp = (type: InterfaceType, name: string, ret: InterfaceType = type) => {
  const opType = new InterfaceType(`${type} operator ${name}`, [], defaultEnvironment, emptyRange);
  opType.callSignatures = [new CallSignature(type, [], ret)];
  type.selfUnaryOperators.set(name, new NativeOperator(name, opType));
}

addNativeBinaryOp(voidType, "==", booleanType, "===");
addNativeBinaryOp(voidType, "!=", booleanType, "!==");

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

defaultEnvironment.addVariable("number", new Member(Constness.Constant, MetaType.typeOnly(numberType)));
defaultEnvironment.addVariable("boolean", new Member(Constness.Constant, MetaType.typeOnly(booleanType)));
defaultEnvironment.addVariable("string", new Member(Constness.Constant, MetaType.typeOnly(stringType)));
defaultEnvironment.addVariable("void", new Member(Constness.Constant, MetaType.typeOnly(voidType)));
defaultEnvironment.addVariable("any", new Member(Constness.Constant, MetaType.typeOnly(voidType)));

defaultEnvironment.addVariable("true", new Member(Constness.Builtin, new ConstValueType(booleanType, true, defaultEnvironment, emptyRange)));
defaultEnvironment.addVariable("false", new Member(Constness.Builtin, new ConstValueType(booleanType, false, defaultEnvironment, emptyRange)));
defaultEnvironment.addVariable("null", new Member(Constness.Builtin, voidType));
defaultEnvironment.addVariable("undefined", new Member(Constness.Builtin, voidType));
