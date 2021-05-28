import { Machine, send } from "xstate";
import { ArchitectureActorType } from "../../model/architecture";
import { World, WorldCreationProps } from "../../model/entities";
import { EventType } from "../../model/EventType";
import { StateName } from "../../model/StateName";
import { SystemContext, SystemEvent, SystemGroup } from "../../model/systems";
import { createStateMachineService } from "../StateMachine";
import {
  createComponentSystemGroup,
  createInteractionSystemGroup,
} from "../systems";
import { createEntityManager } from "./EntityManager";
import {
  addSystemToUpdateList,
  createInteractionSystem,
  createComponentSystem,
  createWelcomeParticipantsStorySystem,
  createInputSystem,
} from "../systems";
import { v4 as uuid } from "uuid";

export function createDefaultWorld(props: WorldCreationProps): World {
  const type = ArchitectureActorType.World;
  const sessionGuid = uuid();

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
                for (let systemGroup of systemGroups) {
                  for (let system of systemGroup.systems) {
                    system.service.send({
                      type: EventType.START_RUN_SYSTEM,
                      callerId: type,
                    });
                  }
                }
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
            for (let systemGroup of systemGroups) {
              for (let system of systemGroup.systems) {
                system.service.send({
                  type: EventType.START_UPDATE_SYSTEM,
                  callerId: type,
                });
              }
            }
          },
          send({ type: EventType.FINISH_UPDATE_SYSTEM, callerId: type }),
        ],
        on: {
          [EventType.FINISH_UPDATE_SYSTEM]: {
            target: StateName.running,
            actions: [
              (_context, event) => {
                for (let systemGroup of systemGroups) {
                  for (let system of systemGroup.systems) {
                    system.service.send({
                      type: EventType.FINISH_UPDATE_SYSTEM,
                      callerId: type,
                    });
                  }
                }
              },
            ],
          },
        },
      },
    },
  });
  const systemsService = createStateMachineService(machine);

  /*   let componentSystemGroup = createComponentSystemGroup({
    callerId: callerId,
    systemsService: systemsService,
  });
    let interactionSystemGroup = createInteractionSystemGroup({
    callerId: callerId,
    systemsService: systemsService,
  }); */

  const entityManager = createEntityManager({
    callerId: callerId,
    world: props,
    systemsService: systemsService,
  });

  /*   componentSystemGroup = addSystemToUpdateList({
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
    systemGroups.push(interactionSystemGroup); */

  return {
    callerId: callerId,
    name: props.name,
    systemsService: systemsService,
    sessionGuid: sessionGuid,
    problemSpace: props.problemSpace,
    solutionSpace: props.solutionSpace,
    entityManager: entityManager,
    systemGroups: systemGroups,
  } as World;
}

let defaultWorld: World | undefined = undefined;
export function getOrCreateDefaultWorld(props: WorldCreationProps): World {
  if (!defaultWorld) {
    defaultWorld = createDefaultWorld(props);
  }
  return defaultWorld;
}
