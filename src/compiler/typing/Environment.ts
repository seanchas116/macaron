import Type from "./Type";
import GenericsParameterType from "./type/GenericsParameterType";
import {voidType} from "./defaultEnvironment";
import Member, {Constness} from "./Member";
import TypeThunk from "./thunk/TypeThunk";
import Identifier from "./Identifier";
import CompilationError from "../common/CompilationError";
import {union} from "../util/set";

export
interface Variable {
  member: Member;
  needsThis: boolean;
}

export default
class Environment {
  private variables = new Map<string, Member>();
  private genericsPlaceholders = new Set<GenericsParameterType>();

  constructor(public parent: Environment = null, public thisType: Type = null) {
  }

  newChild(thisType: Type = null) {
    return new Environment(this, thisType);
  }

  addTempVariable(baseName: string) {
    const name = this.nonDuplicateVariableName(baseName);
    this.addVariable(name, new Member(Constness.Constant, voidType));
    return name;
  }

  nonDuplicateVariableName(baseName: string) {
    for (let i = 0; true; ++i) {
      const name = baseName + i;
      if (!this.getVariable(name)) {
        return name;
      }
    }
  }

  addVariable(name: string, variable: Member): void {
    this.variables.set(name, variable);
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
  getOwnVariable(name: string): Variable {
    const member = this.variables.get(name);
    if (member) {
      return {member, needsThis: false};
    }
    if (this.thisType) {
      const member = this.thisType.getMember(name);
      if (member) {
        return {member, needsThis: true};
      }
    }
  }

  getGenericsPlaceholders(): Set<GenericsParameterType> {
    if (this.parent) {
      return union(this.getOwnGenericsPlaceholders(), this.parent.getGenericsPlaceholders());
    } else {
      return this.getOwnGenericsPlaceholders();
    }
  }
  getOwnGenericsPlaceholders() {
    return this.genericsPlaceholders;
  }
  addGenericsPlaceholder(placeholder: GenericsParameterType) {
    this.genericsPlaceholders.add(placeholder);
  }

  checkGetVariable(name: Identifier) {
    const variable = this.getVariable(name.name);
    if (!variable) {
      throw CompilationError.typeError(
        name.range,
        `Variable '${name.name}' not found`
      );
    }
    return variable;
  }

  checkAssignVariable(name: Identifier, typeOrOrThunk: Type|TypeThunk, firstAssign = false) {
    const type = TypeThunk.resolve(typeOrOrThunk);
    const {member} = this.checkGetVariable(name);

    if (member.constness === Constness.Constant && !firstAssign) {
      throw CompilationError.typeError(
        name.range,
        `Variable '${name.name}' is constant and cannot be reassigned`
      );
    }
    if (member.constness === Constness.Builtin) {
      throw CompilationError.typeError(
        name.range,
        `Variable '${name.name}' is builtin and cannot be reassigned`
      );
    }
    const reasons: string[] = [];
    const assignable = member.settingType.get().isAssignable(type.get(), reasons);
    if (!assignable) {
      throw CompilationError.typeError(
        name.range,
        `Cannot assign '${type.get()}' to type '${member.type.get()}'`,
        ...reasons
      );
    }
  }

  checkAddVariable(constness: Constness, name: Identifier, type: Type|TypeThunk) {
    const variable = this.getVariable(name.name);
    if (variable && variable.member.constness === Constness.Builtin) {
      throw CompilationError.typeError(
        name.range,
        `Variable '${name.name}' is builtin and cannot be redefined`
      );
    }
    if (this.getOwnVariable(name.name)) {
      throw CompilationError.typeError(
        name.range,
        `Variable '${name.name}' already defined`
      );
    }
    this.addVariable(name.name, new Member(constness, type));
  }
}
