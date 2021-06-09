import { Machine, send } from "xstate";
import { ArchitectureActorType } from "../../model/architecture";
import { World, WorldContext, WorldCreationProps } from "../../model/entities";
import { EventType } from "../../model/EventType";
import { StateName } from "../../model/StateName";
import { System, SystemEvent, SystemGroup } from "../../model/systems";
import { createStateMachineService } from "../systems/StateMachine";
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
import { assign } from "xstate";

export function createDefaultWorld(props: WorldCreationProps): World {
  const type = ArchitectureActorType.World;
  const sessionGuid = uuid();

  const callerId = props.callerId ? props.callerId : ArchitectureActorType.App;
  let systemGroups: SystemGroup[] = [];

  const machine = Machine<WorldContext, any, SystemEvent>({
    key: type,
    context: {
      updateSystems: [],
    },
    initial: StateName.idle,
    states: {
      idle: {
        on: {
          [EventType.START_RUN_SYSTEM]: {
            target: StateName.initializing,
            actions: [],
          },
        },
      },
      initializing: {
        entry: [
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
          send({ type: EventType.FINISH_INITIALIZING, callerId: type }),
        ],
        on: {
          [EventType.FINISH_INITIALIZING]: {
            target: StateName.running,
          },
        },
      },
      running: {
        on: {
          [EventType.START_UPDATE_SYSTEM]: {
            target: StateName.updating,
          },
          [EventType.START_RUN_SYSTEM]: {
            target: StateName.initializing,
          },
        },
      },
      updating: {
        entry: [
          assign({
            updateSystems: (_context, event) => {
              const updateSystems: System[] = [];
              for (let systemGroup of systemGroups) {
                for (let system of systemGroup.systems) {
                  if (system.service.state.value === StateName.running) {
                    updateSystems.push(system);
                  }
                }
              }
              return updateSystems;
            },
          }),
          (_context, event) => {
            for (let system of _context.updateSystems) {
              system.service.send({
                type: EventType.START_UPDATE_SYSTEM,
                callerId: type,
              });
            }
          },
          send({ type: EventType.FINISH_UPDATE_SYSTEM, callerId: type }),
        ],
        on: {
          [EventType.FINISH_UPDATE_SYSTEM]: {
            target: StateName.running,
            actions: [
              (_context, event) => {
                const updateSystems = _context.updateSystems;
                for (let system of updateSystems) {
                  if (updateSystems.includes(system)) {
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

  /*   systemGroups.push(componentSystemGroup);
  systemGroups.push(interactionSystemGroup); */

  return {
    callerId: callerId,
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
