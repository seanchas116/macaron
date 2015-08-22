import Environment from "./Environment";
import Type from "./Type";
import TypeThunk from "./thunk/TypeThunk";
import Identifier from "./Identifier";
import CompilationError from "../common/CompilationError";
import Member, {Constness} from "./Member";
import MetaValue from "./MetaValue";
import {typeOnlyType} from "./nativeTypes";

export default
class EvaluationContext {

  constructor(public environment: Environment) {
  }

  newChild() {
    return new EvaluationContext(this.environment.newChild());
  }

  getVariable(name: Identifier) {
    const variable = this.environment.getVariable(name.name);
    if (!variable) {
      throw CompilationError.typeError(
        `Variable '${name.name}' not in scope`,
        name.location
      );
    }
    return variable;
  }

  assignVariable(name: Identifier, metaValue: MetaValue) {
    const variable = this.environment.getVariable(name.name);
    if (!variable) {
      throw CompilationError.typeError(
        `Variable '${name.name}' not in scope`,
        name.location
      );
    }
    if (variable.constness === Constness.Constant) {
      throw CompilationError.typeError(
        `Variable '${name.name}' is constant and cannot be reassigned`,
        name.location
      );
    }
    if (variable.constness === Constness.Builtin) {
      throw CompilationError.typeError(
        `Variable '${name.name}' is builtin and cannot be reassigned`,
        name.location
      );
    }
    const type = metaValue.type.get();
    const variableType = variable.metaValue.type.get();
    if (!type.isCastableTo(variableType)) {
      throw CompilationError.typeError(
        `Cannot assign '${type}' to type '${variableType}'`,
        name.location
      );
    }
  }

  addVariable(constness: Constness, name: Identifier, metaValue: MetaValue) {
    const variable = this.environment.getVariable(name.name);
    if (variable && variable.constness === Constness.Builtin) {
      throw CompilationError.typeError(
        `Variable '${name.name}' is builtin and cannot be redefined`,
        name.location
      );
    }
    if (this.environment.getOwnVariable(name.name)) {
      throw CompilationError.typeError(
        `Variable '${name.name}' already defined`,
        name.location
      );
    }
    this.environment.variables.set(name.name, new Member(constness, metaValue));
  }

  addType(name: Identifier, type: TypeThunk|Type) {
    this.addVariable(Constness.Constant, name, new MetaValue(typeOnlyType, null, type));
  }

  getType(name: Identifier) {
    const variable = this.getVariable(name);
    const type = variable.metaValue.metaType;
    if (!type) {
      throw CompilationError.typeError(
        `'${name.name}' is not a type`,
        name.location
      );
    }
    return type;
  }

}
