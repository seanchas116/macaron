import Type from "./Type";
import {TypeThunk} from "./Thunk";
import AssignType from "./AssignType";
import Identifier from "./Identifier";
import CompilationError from "../common/CompilationError";
import {voidType} from "./nativeTypes";

interface Variable {
  type: TypeThunk;
  assignType: AssignType;
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
      const variable = this.getVariable(name.name);
      if (variable && variable.assignType === AssignType.Builtin) {
        throw CompilationError.typeError(
          `Variable '${name.name}' is builtin and cannot be redefined`,
          name.location
        );
      }
      if (this.getOwnVariable(name.name)) {
        throw CompilationError.typeError(
          `Variable '${name.name}' already defined`,
          name.location
        );
      }
      this.variables.set(name.name, {
        type: TypeThunk.resolve(type),
        assignType
      });
    }
  }

  addTempVariable(baseName: string) {
    const newName = this.nonDuplicateVariableName(baseName);
    this.assignVariable(AssignType.Builtin, new Identifier(newName, null), voidType);
    return newName;
  }

  nonDuplicateVariableName(baseName: string) {
    for (let i = 0; true; ++i) {
      const name = baseName + i;
      if (!this.getVariable(name)) {
        return name;
      }
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

  getTypeOrError(name: Identifier) {
    const type = this.getType(name.name);
    if (!type) {
      throw CompilationError.typeError(
        `Type '${name.name}' already defined`,
        name.location
      );
    }
    return type;
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
