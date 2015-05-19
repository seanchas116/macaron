
class AssignmentAST {
  constructor(left, op, right) {
    this.left = left;
    this.op = op;
    this.right = right;
  }
}

module.exports = AssignmentAST;
