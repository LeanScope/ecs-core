import { Interpreter } from "xstate";
import { SystemBase, SystemContext, SystemEvent } from ".";

export interface System<T = any> extends SystemBase<T> {
  service: Interpreter<SystemContext, any, SystemEvent>;
}
