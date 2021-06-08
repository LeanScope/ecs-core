import { Machine } from "xstate";
import { ArchitectureActorType } from "../../model/architecture";
import {
  System,
  SystemContext,
  SystemCreationProps,
  SystemEvent,
} from "../../model/systems";
import { TransitionActionName } from "../../model/TransitionActionName";
import ecs from "../../index";

export function createCreateEntitiesSystem(props: SystemCreationProps): System {
  const type = ArchitectureActorType.GenericSystem;

  const machine = Machine<SystemContext, any, SystemEvent>(
    ecs.createSystemMachineConfig({
      callerId: props.callerId,
      key: type,
      entityQuery: props.entityManager.universalEntityQuery,
    }),
    {
      actions: {
        [TransitionActionName.onStartRunning]: (_context, _event) => {
          console.log("onStartRunning()");
          ecs.createEntity({
            entityManager: props.entityManager,
            components: [{ type: "InitEntityComponent" }],
          });
        },

        [TransitionActionName.onUpdate]: (_context, _event) => {
          console.log("UPDATING");
          ecs.createEntity({
            entityManager: props.entityManager,
            components: [{ type: "UpdateEntityComponent" }],
          });
        },
      },
    }
  );

  const service = ecs.createStateMachineService(machine);

  return {
    callerId: props.callerId,
    type: type,
    entityManager: props.entityManager,
    service: service,
  };
}
