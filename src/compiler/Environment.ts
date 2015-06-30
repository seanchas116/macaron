import {IdentifierAST} from "./AST";
import {Expression, AssignmentExpression, IdentifierExpression} from "./Expression";
import DeclarationType from "./DeclarationType";
import CompilerError from "./CompilerError";
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

  addVariable(declarationType: DeclarationType, name: IdentifierAST, type: Type) {
    if (this.variables.has(name.name)) {
      throw CompilerError.typeError(`Variable "${name.name}" is already defined`, name.location);
    }
    this.variables.set(name.name, new Variable(type, declarationType == DeclarationType.Constant));
  }

  addVariableExpression(type: DeclarationType, name: IdentifierAST, value: Expression) {
    if (type == DeclarationType.Assignment) {
      const variable = this.get(name);
      if (variable.isConstant) {
        throw CompilerError.typeError(`Cannot assign to constant`, name.location);
      }
      if (variable.type !== value.type) {
        throw CompilerError.typeError(`Cannot assign "${value.type.name}" to "${variable.type.name}"`, name.location);
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

  getVariableExpression(name: IdentifierAST) {
    const variable = this.get(name);
    return new IdentifierExpression(name.name, name.location, variable.type);
  }

  get(name: IdentifierAST) {
    const variable = this.getOrNull(name.name);
    if (!variable) {
      throw CompilerError.typeError(`No variable "${name.name}"`, name.location);
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
