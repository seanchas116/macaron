import {BlockEnvironment} from "./Environment";
import Member, {Constness} from "./Member";
import Type from "./Type";
import InterfaceType from "./type/InterfaceType";
import MetaType from "./type/MetaType";
import ConstValueType from "./type/ConstValueType";
import CallSignature from "./CallSignature";
import {NativeOperator} from "./Operator";
import SourceRange from "../common/SourceRange";

let defaultEnvironment: DefaultEnvironment;
const emptyRange = SourceRange.empty();

export default
class DefaultEnvironment extends BlockEnvironment {
  invalidType = new InterfaceType("invalid", [], this, emptyRange);
  voidType = new InterfaceType("void", [], this, emptyRange);
  numberType = new InterfaceType("number", [this.voidType], this, emptyRange);
  booleanType = new InterfaceType("boolean", [this.voidType], this, emptyRange);
  stringType = new InterfaceType("string", [this.voidType], this, emptyRange);

  constructor() {
    super();

    defaultEnvironment = this;

    const {voidType, numberType, booleanType, stringType} = this;

    const addNativeBinaryOp = (type: InterfaceType, name: string, ret: InterfaceType = type, nativeName = name) => {
      const opType = new InterfaceType(`${type} operator ${name}`, [], this, emptyRange);
      opType.callSignatures = [new CallSignature(type, [type], ret)];
      type.selfBinaryOperators.set(name, new NativeOperator(nativeName, opType));
    }

    const addNativeUnaryOp = (type: InterfaceType, name: string, ret: InterfaceType = type) => {
      const opType = new InterfaceType(`${type} operator ${name}`, [], this, emptyRange);
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

    this.addVariable("number", new Member(Constness.Constant, MetaType.typeOnly(numberType)));
    this.addVariable("boolean", new Member(Constness.Constant, MetaType.typeOnly(booleanType)));
    this.addVariable("string", new Member(Constness.Constant, MetaType.typeOnly(stringType)));
    this.addVariable("void", new Member(Constness.Constant, MetaType.typeOnly(voidType)));
    this.addVariable("any", new Member(Constness.Constant, MetaType.typeOnly(voidType)));

    this.addVariable("true", new Member(Constness.Builtin, new ConstValueType(booleanType, true, this, emptyRange)));
    this.addVariable("false", new Member(Constness.Builtin, new ConstValueType(booleanType, false, this, emptyRange)));
    this.addVariable("null", new Member(Constness.Builtin, voidType));
    this.addVariable("undefined", new Member(Constness.Builtin, voidType));
  }

  static get instance() {
    if (!defaultEnvironment) {
      new DefaultEnvironment();
    }
    return defaultEnvironment;
  }
}
