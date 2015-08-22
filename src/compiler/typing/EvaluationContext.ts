import Environment from "./Environment";
import Type from "./Type";
import MetaValueThunk from "./thunk/MetaValueThunk";
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

  assignVariable(name: Identifier, metaValueOrThunk: MetaValue|MetaValueThunk) {
    const metaValue = MetaValueThunk.resolve(metaValueOrThunk);
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
    const type = metaValue.get().type;
    const variableType = variable.metaValue.get().type;
    if (!type.isCastableTo(variableType)) {
      throw CompilationError.typeError(
        `Cannot assign '${type}' to type '${variableType}'`,
        name.location
      );
    }
  }

  addVariable(constness: Constness, name: Identifier, metaValue: MetaValue|MetaValueThunk) {
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
}
