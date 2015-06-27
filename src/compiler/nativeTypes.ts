import {
  Type,
  AnyType,
  PrimitiveType
} from "./Type";

export
const anyType = new AnyType();

export
const voidType = anyType;

export
const numberType = new PrimitiveType("number");

export
const stringType = new PrimitiveType("string");
