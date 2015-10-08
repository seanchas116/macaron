import Type from "./Type";
import GenericsParameterType from "./type/GenericsParameterType";
import {voidType} from "./nativeTypes";
import Member, {Constness} from "./Member";
import CompilationError from "../common/CompilationError";
import {union} from "../util/set";

export
interface Variable {
  member: Member;
  needsThis: boolean;
}

export default
class Environment {
  constructor(public parent: Environment = null) {
  }

  newChild() {
    return new BlockEnvironment(this);
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
    throw new Error("not implemented");
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
    throw new Error("not implemented");
  }

  getGenericsPlaceholders() {
    if (this.parent) {
      return union(this.getOwnGenericsPlaceholders(), this.parent.getOwnGenericsPlaceholders());
    } else {
      return this.getOwnGenericsPlaceholders();
    }
  }
  getOwnGenericsPlaceholders(): Set<GenericsParameterType> {
    throw new Error("not implemented");
  }
}

export
class BlockEnvironment extends Environment {
  private variables = new Map<string, Member>();
  private genericsPlaceholders = new Set<GenericsParameterType>();

  addVariable(name: string, variable: Member) {
    this.variables.set(name, variable);
  }
  getOwnVariable(name: string) {
    const member = this.variables.get(name);
    if (member) {
      return {member, needsThis: false};
    }
  }
  getOwnGenericsPlaceholders() {
    return this.genericsPlaceholders;
  }
  addGenericsPlaceholder(placeholder: GenericsParameterType) {
    this.genericsPlaceholders.add(placeholder);
  }
}

export
class ThisEnvironment extends Environment {
  constructor(parent: Environment, public thisType: Type, public isConstructor = false) {
    super(parent);
  }

  getOwnVariable(name: string) {
    const member = this.thisType.members.get(name);
    if (member) {
      return {member, needsThis: true};
    }
  }
  getOwnGenericsPlaceholders() {
    return new Set();
  }
}
