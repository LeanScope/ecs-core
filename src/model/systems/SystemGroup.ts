import { Interpreter } from "xstate";
import { FunctionInputProps } from "../FunctionInputProps";
import { System, SystemContext, SystemEvent } from "../systems";

export interface SystemGroup<T = any> extends FunctionInputProps {
  type: T;
  systemsService: Interpreter<SystemContext, any, SystemEvent>;
  systems: System<T>[];
}
