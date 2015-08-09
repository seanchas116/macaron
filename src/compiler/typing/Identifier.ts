import SourceLocation from "../common/SourceLocation";

export default
class Identifier {
  constructor(public location: SourceLocation, public name: string) {
  }
}
