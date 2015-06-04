import {IdentifierAST} from "./AST";
import {Expression, AssignmentExpression, IdentifierExpression} from "./Expression";
import DeclarationType from "./DeclarationType";
import TypeCheckError from "./TypeCheckError";
import Type from "./Type";

class Variable {
  constructor(public type: Type, public isConstant: boolean) {
  }
}

export default
class Environment {
  variables = new Map<string, Variable>();
  parent: Environment;

  constructor(parent: Environment) {
    this.parent = parent;
  }

  addVariable(type: DeclarationType, name: IdentifierAST, value: Expression) {
    if (type == DeclarationType.Assignment) {
      const variable = this.get(name);
      if (variable.isConstant) {
        throw new TypeCheckError(`Cannot assign to constant`, name.location);
      }
      if (variable.type !== value.type) {
        throw new TypeCheckError(`Cannot assign "${value.type.name}" to "${variable.type.name}"`, name.location);
      }

      return new AssignmentExpression(
        type,
        new IdentifierExpression(name.name, name.location, variable.type),
        value
      );
    } else {
      if (this.variables.has(name.name)) {
        throw new TypeCheckError(`Variable "${name.name}" is already defined`, name.location);
      }
      this.variables.set(name.name, new Variable(value.type, type == DeclarationType.Constant));

      return new AssignmentExpression(
        type,
        new IdentifierExpression(name.name, name.location, value.type),
        value
      );
    }
  }

  getVariable(name: IdentifierAST) {
    const variable = this.get(name);
    return new IdentifierExpression(name.name, name.location, variable.type);
  }

  get(name: IdentifierAST) {
    const variable = this.getOrNull(name.name);
    if (!variable) {
      throw new TypeCheckError(`No variable ${name.name}`, name.location);
    }
    return variable;
  }

  getOrNull(name: string) {
    if (this.parent) {
      return this.parent.getOrNull(name) || this.variables.get(name);
    } else {
      return this.variables.get(name);
    }
  }
}
