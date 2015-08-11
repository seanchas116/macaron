enum AssignType {
  Builtin, // cannot define new variable with same name
  Constant, // cannot be assigned
  Variable,
  Assign
}

export default AssignType;
