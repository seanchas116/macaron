export
enum BinaryOperatorKind {
  Equal,
  LessThan,
  LessThanEqual,
  GreaterThan,
  GreaterThanEqual,

  Add,
  Subtract,
  Multiply,
  Divide,
  Remainder,
  Exponential,

  BitwiseAnd,
  BitwiseXor,
  BitwiseOr,
  LeftShift,
  RightShift,
  UnsignedRightShift,
}

export
enum UnaryOperatorKind {
  Negate,
  BitwiseNot,
}

export
const binaryOperatorKinds = new Map<string, BinaryOperatorKind>([
  ["==", BinaryOperatorKind.Equal],
  ["<", BinaryOperatorKind.LessThan],
  ["<=", BinaryOperatorKind.LessThanEqual],
  [">", BinaryOperatorKind.GreaterThan],
  ["=>", BinaryOperatorKind.GreaterThanEqual],

  ["+", BinaryOperatorKind.Add],
  ["-", BinaryOperatorKind.Subtract],
  ["*", BinaryOperatorKind.Multiply],
  ["/", BinaryOperatorKind.Divide],
  ["%", BinaryOperatorKind.Remainder],
  ["**", BinaryOperatorKind.Exponential],

  ["&", BinaryOperatorKind.BitwiseAnd],
  ["^", BinaryOperatorKind.BitwiseXor],
  ["|", BinaryOperatorKind.BitwiseOr],
  ["<<", BinaryOperatorKind.LeftShift],
  [">>", BinaryOperatorKind.RightShift],
  [">>>", BinaryOperatorKind.UnsignedRightShift],
]);

export
const unaryOperatorKinds = new Map<string, UnaryOperatorKind>([
  ["-", UnaryOperatorKind.Negate],
  ["^", UnaryOperatorKind.BitwiseNot],
]);
