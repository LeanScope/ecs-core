import { Machine, send } from "xstate";
import { ArchitectureActorType } from "../../model/architecture";
import { World, WorldCreationProps } from "../../model/entities";
import { EventType } from "../../model/EventType";
import { StateName } from "../../model/StateName";
import { SystemContext, SystemEvent, SystemGroup } from "../../model/systems";
import { createStateMachineService } from "../stateMachine";
import {
  createComponentSystemGroup,
  createInteractionSystemGroup,
} from "../systems";
import { createEntityManager } from "./entityManager";
import {
  addSystemToUpdateList,
  createInteractionSystem,
  createComponentSystem,
  createWelcomeParticipantsStorySystem,
  createInputSystem,
} from "../systems";

let defaultWorld: World | undefined = undefined;
export function getOrCreateDefaultWorld(props: WorldCreationProps): World {
  if (defaultWorld && !props.forceNew) {
    return defaultWorld;
  }
  const type = ArchitectureActorType.World;

  const callerId = props.name;
  let systemGroups: SystemGroup[] = [];

  const machine = Machine<SystemContext, any, SystemEvent>({
    key: type,
    initial: StateName.idle,
    states: {
      idle: {
        on: {
          [EventType.START_RUN_SYSTEM]: {
            target: StateName.initializing,
            actions: [
              (_context, event) => {
                systemGroups.forEach((systemGroup) => {
                  systemGroup.systems.forEach((system) => {
                    system.service.send({
                      type: EventType.START_RUN_SYSTEM,
                      callerId: type,
                    });
                  });
                });
              },
            ],
          },
        },
      },
      initializing: {
        on: {
          [EventType.START_UPDATE_SYSTEM]: {
            target: StateName.updating,
            actions: [],
          },
        },
      },
      running: {
        on: {
          [EventType.START_UPDATE_SYSTEM]: {
            target: StateName.updating,
            actions: [],
          },
        },
      },
      updating: {
        entry: [
          (_context, event) => {
            systemGroups.forEach((systemGroup) => {
              systemGroup.systems.forEach((system) => {
                system.service.send({
                  type: EventType.START_UPDATE_SYSTEM,
                  callerId: type,
                });
              });
            });
          },
          send({ type: EventType.FINISH_UPDATE_SYSTEM, callerId: type }),
        ],
        on: {
          [EventType.FINISH_UPDATE_SYSTEM]: {
            target: StateName.running,
            actions: [
              (_context, event) => {
                systemGroups.forEach((systemGroup) => {
                  systemGroup.systems.forEach((system) => {
                    system.service.send({
                      type: EventType.FINISH_UPDATE_SYSTEM,
                      callerId: type,
                    });
                  });
                });
              },
            ],
          },
        },
      },
    },
  });
  const systemsService = createStateMachineService(machine);

  let componentSystemGroup = createComponentSystemGroup({
    callerId: callerId,
    systemsService: systemsService,
  });
  let interactionSystemGroup = createInteractionSystemGroup({
    callerId: callerId,
    systemsService: systemsService,
  });

  const entityManager = createEntityManager({
    callerId: callerId,
    world: props,
    systemsService: systemsService,
  });

  componentSystemGroup = addSystemToUpdateList({
    group: componentSystemGroup,
    system: createComponentSystem({
      callerId: callerId,
      entityManager: entityManager,
    }),
  });

  interactionSystemGroup = addSystemToUpdateList({
    group: interactionSystemGroup,
    system: createInteractionSystem({
      callerId: callerId,
      entityManager: entityManager,
    }),
  });

  interactionSystemGroup = addSystemToUpdateList({
    group: interactionSystemGroup,
    system: createWelcomeParticipantsStorySystem({
      callerId: callerId,
      entityManager: entityManager,
    }),
  });

  interactionSystemGroup = addSystemToUpdateList({
    group: interactionSystemGroup,
    system: createInputSystem({
      callerId: callerId,
      entityManager: entityManager,
    }),
  });

  systemGroups.push(componentSystemGroup);
  systemGroups.push(interactionSystemGroup);

  defaultWorld = {
    callerId: callerId,
    name: props.name,
    systemsService: systemsService,
    sessionGuid: props.sessionGuid,
    problemSpace: props.problemSpace,
    solutionSpace: props.solutionSpace,
    entityManager: entityManager,
    systemGroups: systemGroups,
  };

  return defaultWorld;
}
