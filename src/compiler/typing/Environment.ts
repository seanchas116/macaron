import Type from "./Type";
import {voidType} from "./nativeTypes";
import Member, {Constness} from "./Member";
import MetaValue from "./MetaValue";
import CompilationError from "../common/CompilationError";

export default
class Environment {
  constructor(public parent: Environment = null) {
  }

  newChild() {
    return new BlockEnvironment(this);
  }

  addTempVariable(baseName: string) {
    const name = this.nonDuplicateVariableName(baseName);
    this.addVariable(name, new Member(Constness.Constant, new MetaValue(voidType)));
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

  getVariable(name: string): Member {
    if (this.parent) {
      const parentVariable = this.parent.getVariable(name);
      if (parentVariable) {
        return parentVariable;
      }
    }
    return this.getOwnVariable(name);
  }
  getOwnVariable(name: string): Member {
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
    return this.variables.get(name);
  }
}

export
class ThisEnvironment extends Environment {
  constructor(parent: Environment, public thisType: Type, public isConstructor = false) {
    super(parent);
  }

  getOwnVariable(name: string) {
    return this.thisType.getMember(name);
  }
}
