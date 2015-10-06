import Type from "./Type";
import {voidType} from "./nativeTypes";
import Member, {Constness} from "./Member";
import CompilationError from "../common/CompilationError";

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
}

export
class BlockEnvironment extends Environment {
  variables = new Map<string, Member>();

  addVariable(name: string, variable: Member) {
    this.variables.set(name, variable);
  }
  getOwnVariable(name: string) {
    const member = this.variables.get(name);
    if (member) {
      return {member, needsThis: false};
    }
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
}
