import { interpret, StateMachine } from "xstate";

export function createStateMachineService<
  T extends StateMachine<any, any, any>
>(props: { machine: T }) {
  const service = interpret(props.machine).start();
  return service;
}
