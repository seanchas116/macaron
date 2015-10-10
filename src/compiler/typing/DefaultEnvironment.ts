import {BlockEnvironment} from "./Environment";
import Member, {Constness} from "./Member";
import Type from "./Type";
import MetaType from "./type/MetaType";
import ConstValueType from "./type/ConstValueType";
import CallSignature from "./CallSignature";
import {NativeOperator} from "./Operator";

function addNativeBinaryOp(type: Type, name: string, ret: Type = type, nativeName = name) {
  const opType = new Type(`${type} operator ${name}`, []);
  opType.callSignatures = [new CallSignature(type, [type], ret)];
  type.selfBinaryOperators.set(name, new NativeOperator(nativeName, opType));
}

function addNativeUnaryOp(type: Type, name: string, ret: Type = type) {
  const opType = new Type(`${type} operator ${name}`, []);
  opType.callSignatures = [new CallSignature(type, [], ret)];
  type.selfUnaryOperators.set(name, new NativeOperator(name, opType));
}

let defaultEnvironment: DefaultEnvironment;

export default
class DefaultEnvironment extends BlockEnvironment {
  voidType = new Type("void", []);
  numberType = new Type("number", [this.voidType]);
  booleanType = new Type("boolean", [this.voidType]);
  stringType = new Type("string", [this.voidType]);

  constructor() {
    super();

    defaultEnvironment = this;

    const {voidType, numberType, booleanType, stringType} = this;

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

    this.addVariable("true", new Member(Constness.Builtin, new ConstValueType(booleanType, true)));
    this.addVariable("false", new Member(Constness.Builtin, new ConstValueType(booleanType, false)));
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
