import Environment from "./Environment";
import Type from "./Type";
import {TypeThunk} from "./Thunk";
import Identifier from "./Identifier";
import CompilationError from "../common/CompilationError";
import AssignType from "./AssignType";

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

  assignToExistingVariable(name: Identifier, type: Type|TypeThunk) {
    const variable = this.environment.getVariable(name.name);
    if (!variable) {
      throw CompilationError.typeError(
        `Variable '${name.name}' not in scope`,
        name.location
      );
    }
    if (variable.assignType === AssignType.Constant) {
      throw CompilationError.typeError(
        `Variable '${name.name}' is constant and cannot be reassigned`,
        name.location
      );
    }
    if (variable.assignType === AssignType.Builtin) {
      throw CompilationError.typeError(
        `Variable '${name.name}' is builtin and cannot be reassigned`,
        name.location
      );
    }
    const typeThunk = TypeThunk.resolve(type);
    if (!typeThunk.get().isCastableTo(variable.type.get())) {
      throw CompilationError.typeError(
        `Cannot assign '${type}' to type '${variable.type}'`,
        name.location
      );
    }
  }

  assignVariable(assignType: AssignType, name: Identifier, type: Type|TypeThunk) {
    if (assignType === AssignType.Assign) {
      this.assignToExistingVariable(name, type);
    }
    else {
      const variable = this.environment.getVariable(name.name);
      if (variable && variable.assignType === AssignType.Builtin) {
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
      this.environment.variables.set(name.name, {
        type: TypeThunk.resolve(type),
        assignType
      });
    }
  }

  addType(name: Identifier, type: TypeThunk|Type) {
    if (this.environment.getOwnType(name.name)) {
      throw CompilationError.typeError(
        `Type '${name.name}' already defined`,
        name.location
      );
    }

    this.environment.types.set(name.name, TypeThunk.resolve(type));
  }

  getType(name: Identifier) {
    const type = this.environment.getType(name.name);
    if (!type) {
      throw CompilationError.typeError(
        `Type '${name.name}' already defined`,
        name.location
      );
    }
    return type;
  }

}
