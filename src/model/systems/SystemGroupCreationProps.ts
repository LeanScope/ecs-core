import { Interpreter } from "xstate";
import { FunctionInputProps } from "../FunctionInputProps";
import { SystemContext, SystemEvent } from ".";

export interface SystemGroupCreationProps extends FunctionInputProps {
  systemsService: Interpreter<SystemContext, any, SystemEvent>;
}
