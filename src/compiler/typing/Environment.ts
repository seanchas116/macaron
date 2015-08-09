import Identifier from "./Identifier";
import {Expression, AssignmentExpression, IdentifierExpression} from "./Expression";
import DeclarationType from "./DeclarationType";
import CompilationError from "../common/CompilationError";
import {Type} from "./Type";

class Variable {
  constructor(public type: Type, public isConstant: boolean) {
  }
}

export default
class Environment {
  variables = new Map<string, Variable>();

  constructor(public parent: Environment = null) {
  }

  addVariable(declarationType: DeclarationType, name: Identifier, type: Type) {
    if (this.variables.has(name.name)) {
      throw CompilationError.typeError(`Variable "${name.name}" is already defined`, name.location);
    }
    this.variables.set(name.name, new Variable(type, declarationType == DeclarationType.Constant));
  }

  addVariableExpression(type: DeclarationType, name: Identifier, value: Expression) {
    if (type == DeclarationType.Assignment) {
      const variable = this.get(name);
      if (variable.isConstant) {
        throw CompilationError.typeError(`Cannot assign to constant`, name.location);
      }
      if (variable.type !== value.type) {
        throw CompilationError.typeError(`Cannot assign "${value.type.name}" to "${variable.type.name}"`, name.location);
      }

      return new AssignmentExpression(
        type,
        new IdentifierExpression(name.name, name.location, variable.type),
        value,
        name.location
      );
    } else {
      this.addVariable(type, name, value.type);

      return new AssignmentExpression(
        type,
        new IdentifierExpression(name.name, name.location, value.type),
        value,
        name.location
      );
    }
  }

  getVariableExpression(name: Identifier) {
    const variable = this.get(name);
    return new IdentifierExpression(name.name, name.location, variable.type);
  }

  get(name: Identifier) {
    const variable = this.getOrNull(name.name);
    if (!variable) {
      throw CompilationError.typeError(`No variable "${name.name}"`, name.location);
    }
    return variable;
  }

  getOrNull(name: string): Variable {
    if (this.parent) {
      const parentVariable = this.parent.getOrNull(name);
      if (parentVariable) {
        return parentVariable;
      }
      return this.variables.get(name);
    } else {
      return this.variables.get(name);
    }
  }
}
