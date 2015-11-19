import Type from "./Type";
import GenericsParameterType from "./type/GenericsParameterType";
import {voidType} from "./defaultEnvironment";
import Thunk from "./Thunk";
import Member, {Constness} from "./Member";
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
  variables = new Map<string, Member>();
  types = new Map<string, Thunk<Type>>();

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

  addVariable(name: string, variable: Member) {
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

  addType(name: string, type: Type|Thunk<Type>) {
    this.types.set(name, Thunk.resolve(type));
  }
  getType(name: string): Thunk<Type> {
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

  getGenericsPlaceholders(): Set<GenericsParameterType> {
    if (this.parent) {
      return union(this.getOwnGenericsPlaceholders(), this.parent.getGenericsPlaceholders());
    } else {
      return this.getOwnGenericsPlaceholders();
    }
  }
  getOwnGenericsPlaceholders() {
    const placeholders = new Set<GenericsParameterType>();
    for (const typeThunk of this.types.values()) {
      const type = typeThunk.get();
      if (type instanceof GenericsParameterType) {
        placeholders.add(type);
      }
    }
    return placeholders;
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

  checkAssignVariable(name: Identifier, type: Type, firstAssign = false) {
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
    const assignable = member.settingType.get().isAssignable(type, reasons);
    if (!assignable) {
      throw CompilationError.typeError(
        name.range,
        `Cannot assign '${type}' to type '${member.type.get()}'`,
        ...reasons
      );
    }
  }

  checkAddVariable(constness: Constness, name: Identifier, type: Type|Thunk<Type>) {
    const typeThunk = Thunk.resolve(type);
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
    this.addVariable(name.name, new Member(constness, typeThunk));
  }

  checkGetType(name: Identifier) {
    const type = this.getType(name.name);
    if (!type) {
      throw CompilationError.typeError(
        name.range,
        `Type '${name.name}' not found`
      );
    }
    return type;
  }

  checkAddType(name: Identifier, type: Type|Thunk<Type>) {
    if (this.getOwnType(name.name)) {
      throw CompilationError.typeError(
        name.range,
        `Type '${name.name}' already defined`
      );
    }
    this.addType(name.name, type);
  }
}
