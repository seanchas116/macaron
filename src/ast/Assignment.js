
class AssignmentAST {
  constructor(declaration, left, op, right) {
    this.declaration = declaration;
    this.left = left;
    this.op = op;
    this.right = right;
  }
}

module.exports = AssignmentAST;
