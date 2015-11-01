import {BlockEnvironment} from "./Environment";
import Member, {Constness} from "./Member";
import Type from "./Type";
import MetaType from "./type/MetaType";
import ConstValueType from "./type/ConstValueType";
import CallSignature from "./CallSignature";
import {NativeOperator} from "./Operator";

let defaultEnvironment: DefaultEnvironment;

export default
class DefaultEnvironment extends BlockEnvironment {
  invalidType = new Type("invalid", [], this);
  voidType = new Type("void", [], this);
  numberType = new Type("number", [this.voidType], this);
  booleanType = new Type("boolean", [this.voidType], this);
  stringType = new Type("string", [this.voidType], this);

  constructor() {
    super();

    defaultEnvironment = this;

    const {voidType, numberType, booleanType, stringType} = this;

    const addNativeBinaryOp = (type: Type, name: string, ret: Type = type, nativeName = name) => {
      const opType = new Type(`${type} operator ${name}`, [], this);
      opType.callSignatures = [new CallSignature(type, [type], ret)];
      type.selfBinaryOperators.set(name, new NativeOperator(nativeName, opType));
    }

    const addNativeUnaryOp = (type: Type, name: string, ret: Type = type) => {
      const opType = new Type(`${type} operator ${name}`, [], this);
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

    this.addVariable("true", new Member(Constness.Builtin, new ConstValueType(booleanType, true, this)));
    this.addVariable("false", new Member(Constness.Builtin, new ConstValueType(booleanType, false, this)));
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
