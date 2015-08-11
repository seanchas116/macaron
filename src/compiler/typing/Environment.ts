import Type from "./Type";
import {TypeThunk} from "./Thunk";
import AssignType from "./AssignType";
import Identifier from "./Identifier";
import CompilationError from "../common/CompilationError";

interface Variable {
  type: TypeThunk;
  isConstant: boolean;
}

export default
class Environment {
  variables = new Map<string, Variable>();
  types = new Map<string, TypeThunk>();

  constructor(public parent: Environment = null) {
  }

  assignToExistingVariable(name: Identifier, type: Type|TypeThunk) {
    const variable = this.getVariable(name.name);
    if (!variable) {
      throw CompilationError.typeError(
        `Variable '${name.name}' not in scope`,
        name.location
      );
    }
    if (variable.isConstant) {
      throw CompilationError.typeError(
        `Variable '${name.name}' is constant`,
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
      const variable = this.getVariable(name.name);
      if (this.getOwnVariable(name.name)) {
        throw CompilationError.typeError(
          `Variable '${name.name}' already defined`,
          name.location
        );
      }
      this.variables.set(name.name, {
        type: TypeThunk.resolve(type),
        isConstant: assignType === AssignType.Constant
      });
    }
  }

  getVariable(name: string): Variable {
    if (this.parent) {
      const parentVariable = this.parent.getVariable(name);
      if (parentVariable) {
        return parentVariable;
      }
    }
    return this.getOwnVariable(name);
  }
  getOwnVariable(name: string) {
    return this.variables.get(name);
  }

  addType(name: Identifier, type: TypeThunk|Type) {
    if (this.getOwnType(name.name)) {
      throw CompilationError.typeError(
        `Type '${name.name}' already defined`,
        name.location
      );
    }

    this.types.set(name.name, TypeThunk.resolve(type));
  }

  getType(name: string): TypeThunk {
    if (this.parent) {
      const parentType = this.parent.getType(name);
      if (parentType) {
        return parentType;
      }
    }
    return this.getOwnType(name);
  }
  getOwnType(name: string) {
    return this.types.get(name);
  }
}
