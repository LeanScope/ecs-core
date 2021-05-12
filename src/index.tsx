import { ApolloClient, gql, InMemoryCache } from "@apollo/client";
import {
  assign,
  interpret,
  Interpreter,
  Machine,
  send,
  StateMachine,
} from "xstate";
import {
  ArchitectureActorType,
  ArchitectureMessageType,
} from "./model/architecture";
import {
  AddComponentsInputProps,
  AddComponentsOutputProps,
  ComponentType,
  IComponent,
  InputActionComponent,
  InputActionCreationProps,
  InputActionMapComponent,
  InputActionMapCreationProps,
  InputActionName,
  PointerInputProps,
  PointerOutputProps,
  SetComponentDataInputProps,
  SetComponentDataOutputProps,
  StoryInputProps,
  StoryOutputProps,
  TagInputProps,
  TagOutputProps,
  UserInputProps,
  UserInterfaceInputProps,
  UserInterfaceOutputProps,
  UserOutputProps,
} from "./model/components";
import {
  CreateEntityInputProps,
  CreateEntityManagerInputProps,
  CreateUniversalEntityQueryInputProps,
  Entity,
  EntityDescriptionInputProps,
  EntityDescriptionOutputProps,
  EntityManager,
  EntityManagerContext,
  EntityManagerEvent,
  EntityQuery,
  EntityQueryBase,
  EntityQueryContext,
  EntityQueryCreationProps,
  EntityQueryEvent,
  EntityQueryFromDescProps,
  UniversalEntityQuery,
  World,
  WorldCreationProps,
} from "./model/entities";
import { Equipment } from "./model/Equipment";
import { EventType } from "./model/EventType";
import { StateName } from "./model/StateName";
import {
  CreateSystemMachineConfigInputProps,
  System,
  SystemContext,
  SystemCreationProps,
  SystemEvent,
  SystemGroup,
  SystemGroupCreationProps,
} from "./model/systems";
import {
  ChartBuilder,
  ChartUpdateEvent,
  chartBuilder,
  MessageType,
  ChartUpdateEventType,
} from "./debug/ChartBuilder";
import { authLink, link } from "./api/graph-ql.client";
import { Key } from "ts-keycode-enum";
import { TransitionActionName } from "./model/TransitionActionName";
import * as _ from "lodash";
import { Base64 } from "js-base64";
import { v4 as uuid } from "uuid";
import { EntityGuids, EntityNames } from "./api/entities";
import { useEffect, useState } from "react";
import * as React from "react";
import { ViewProps } from "./model/ViewProps";
import { useService } from "@xstate/react";

export function getEntityQueryFromDesc(
  props: EntityQueryFromDescProps
): EntityQuery {
  return createEntityQuery({
    callerId: props.callerId,
    queryDesc: props.queryDesc,
    universalEntityQuery: props.entityManager.universalEntityQuery,
  });
}

function createUniversalEntityQuery(
  props: CreateUniversalEntityQueryInputProps
): UniversalEntityQuery {
  const key = ArchitectureActorType.UniversalEntityQuery;

  chartBuilder.addMessage({
    type: MessageType.Sync,
    sender: props.callerId,
    receiver: key,
    text: ArchitectureMessageType.Create,
  });

  const fetchProblemSpaceEntities = (
    _context: EntityQueryContext,
    event: EntityQueryEvent
  ) =>
    new Promise((resolve, _reject) => {
      props.apolloClient
        .query({
          query: gql(props.problemSpaceQueryString),
        })
        .then((response) => {
          const data = response.data;
          // todo: beat anne
          const equipments = data.uxmData.equipments;
          let entities: Entity[] = [];
          equipments.forEach((equipment: Equipment) => {
            const entity = {
              _guid: equipment._guid,
              components: [
                EntityDescription({
                  name: equipment.line,
                  description: equipment.description,
                }),
              ],
            };
            entities.push(entity);
          });
          return resolve({
            callerId: event.callerId,
            entities: entities,
          });
        });
    });

  const fetchSolutionSpaceEntities = (
    _context: EntityQueryContext,
    event: EntityQueryEvent
  ) =>
    new Promise((resolve, _reject) => {
      const data = props.apolloClient.readQuery({
        query: gql(props.solutionSpaceQueryString),
      });
      const entities = data ? (data.entities as Entity[]) : [];
      return resolve({
        callerId: event.callerId,
        entites: entities,
      });
    });

  const machine = Machine<EntityQueryContext, any, EntityQueryEvent>({
    key: key,
    initial: StateName.idle,
    context: {
      entities: [],
    },
    states: {
      idle: {
        on: {
          [EventType.READ_QUERY_ASYNC]: {
            target: StateName.fetchingSolutionSpaceEntities,
            actions: [
              (_context, event) =>
                chartBuilder.addMessage({
                  type: MessageType.AsyncRequest,
                  sender: event.callerId,
                  receiver: key,
                  text: event.type,
                }),
            ],
          },
          [EventType.WRITE_QUERY_SYNC]: {
            target: StateName.idle,
            actions: [
              (_context, event) =>
                chartBuilder.addMessage({
                  type: MessageType.Sync,
                  sender: event.callerId,
                  receiver: key,
                  text: event.type,
                }),
              assign({
                entities: (_context, event) => {
                  props.apolloClient.writeQuery({
                    query: gql(props.solutionSpaceQueryString),
                    data: {
                      entities: event.entities,
                    },
                  });
                  console.info(
                    "Writing entities of universal query: " +
                      JSON.stringify(event.entities)
                  );
                  return event.entities;
                },
              }),
              () => {
                props.entityManagerService.send({
                  type: EventType.ENTITIES_WRITTEN,
                  callerId: key,
                });
              },
            ],
          },
        },
      },
      fetchingSolutionSpaceEntities: {
        invoke: {
          id: "fetchingSolutionSpaceEntities",
          src: fetchSolutionSpaceEntities,
          onError: {
            target: StateName.idle,
          },
          onDone: {
            target: StateName.idle,
            actions: [
              (_context, event) => {
                console.info(
                  "Async response from " +
                    ArchitectureActorType.UniversalEntityQuery
                );
                chartBuilder.addMessage({
                  type: MessageType.AsyncResponse,
                  sender: key,
                  receiver: event.data.callerId,
                  text: event.type,
                });
              },
              assign({
                entities: (context, _event) => {
                  console.info("Response from fetching solution entities");
                  return context.entities;
                },
              }),
              () =>
                props.entityManagerService.send({
                  type: EventType.ENTITIES_READ,
                  callerId: key,
                }),
            ],
          },
        },
      },
      fetchingProblemSpaceEntities: {
        invoke: {
          id: "fetchProblemSpaceEntities",
          src: fetchProblemSpaceEntities,
          onError: {
            target: StateName.idle,
          },
          onDone: {
            target: StateName.idle,
            actions: [
              assign({
                entities: (context, event) => {
                  console.info("Response from fetching problem entities");
                  const currentEntities = context.entities;
                  const mergedEntities = [
                    ...event.data.entities,
                    currentEntities,
                  ];
                  return mergedEntities;
                },
              }),
              () =>
                props.entityManagerService.send({
                  type: EventType.ENTITIES_READ,
                  callerId: key,
                }),
            ],
          },
        },
      },
    },
  });

  const queryService = createStateMachineService(machine);
  return {
    callerId: props.callerId,
    apolloClient: props.apolloClient,
    entityManagerService: props.entityManagerService,
    problemSpaceQueryString: props.problemSpaceQueryString,
    solutionSpaceQueryString: props.solutionSpaceQueryString,
    queryService: queryService,
  };
}

function createEntityQuery(props: EntityQueryCreationProps): EntityQuery {
  const key = ArchitectureActorType.EntityQuery;

  chartBuilder.addMessage({
    type: MessageType.Sync,
    sender: props.callerId,
    receiver: key,
    text: ArchitectureMessageType.Create,
  });

  function getFilteredEntities(): Entity[] {
    const entities = toEntitiesArray({
      callerId: props.callerId,
      entityQuery: props.universalEntityQuery,
    });

    const filteredEntities: typeof entities = [];
    entities.forEach((entity) => {
      let addEntity = false;
      entity.components.forEach((component) => {
        if (
          props.queryDesc.all === undefined ||
          props.queryDesc.all.length === 0 ||
          props.queryDesc.all.indexOf(component.type) >= 0
        ) {
          addEntity = true;
        }
        if (
          props.queryDesc.none !== undefined &&
          props.queryDesc.none.indexOf(component.type) >= 0
        ) {
          addEntity = false;
        }
      });

      if (addEntity) {
        filteredEntities.push(entity);
      }
    });
    return filteredEntities;
  }

  const machine = Machine<EntityQueryContext, any, EntityQueryEvent>({
    key: key,
    initial: StateName.idle,
    context: {
      entities: [],
    },
    states: {
      idle: {
        on: {
          [EventType.READ_QUERY_SYNC]: {
            target: "updating",
            actions: [
              (_context, event) =>
                chartBuilder.addMessage({
                  type: MessageType.Sync,
                  sender: props.universalEntityQuery.queryService.id,
                  receiver: key,
                  text: event.type,
                }),
              assign({
                entities: (_context, _event) => {
                  return getFilteredEntities();
                },
              }),
            ],
          },
          [EventType.WRITE_QUERY_SYNC]: {
            target: "updating",
            actions: [
              assign({
                entities: (_context, event) => {
                  const allEntities = toEntitiesArray({
                    callerId: props.callerId,
                    entityQuery: props.universalEntityQuery,
                  });
                  const mergedEntities: typeof allEntities = [];
                  allEntities.forEach((existingEntity) => {
                    const newEntity = event.entities.find(
                      (newEntity) => newEntity._guid === existingEntity._guid
                    );
                    if (newEntity) {
                      mergedEntities.push(newEntity);
                    } else {
                      mergedEntities.push(existingEntity);
                    }
                  });
                  setEntitiesArray({
                    callerId: event.callerId,
                    entityQuery: props.universalEntityQuery,
                    entities: mergedEntities,
                  });

                  console.info(
                    "Entities of custom query: " +
                      JSON.stringify(event.entities)
                  );
                  return event.entities;
                },
              }),
            ],
          },
        },
      },
      updating: {
        always: {
          target: StateName.idle,
        },
      },
    },
  });

  const queryService = createStateMachineService(machine);

  return {
    callerId: props.callerId,
    queryService: queryService,
    queryDesc: props.queryDesc,
    universalEntityQuery: props.universalEntityQuery,
  };
}

export function createEntityManager(
  props: CreateEntityManagerInputProps
): EntityManager {
  const key = ArchitectureActorType.EntityManager;

  chartBuilder.addMessage({
    type: MessageType.Sync,
    sender: props.callerId,
    receiver: key,
    text: ArchitectureMessageType.Create,
  });

  const cache = new InMemoryCache();

  const apolloClient = new ApolloClient({
    link: authLink.concat(link),
    cache: cache,
  });

  const machine = Machine<EntityManagerContext, any, EntityManagerEvent>({
    key: key,
    initial: StateName.idle,
    states: {
      idle: {
        on: {
          ENTITIES_WRITTEN: {
            target: StateName.updating,
            actions: [
              (_context, event) => {
                chartBuilder.addMessage({
                  type: MessageType.Sync,
                  sender: event.callerId,
                  receiver: key,
                  text: event?.type,
                });
              },
              (context, event) => {
                console.info("entities written");
              },
              (context, event) => {
                props.systemsService.send({
                  type: EventType.START_UPDATE_SYSTEM,
                  callerId: key,
                });
              },
            ],
          },

          ENTITIES_READ: {
            target: StateName.idle,
            actions: [
              (context, event) => {
                console.info("Read entities message from " + event.callerId);
                chartBuilder.addMessage({
                  type: MessageType.Sync,
                  sender: event.callerId,
                  receiver: key,
                  text: event?.type,
                });
              },
              (context, event) => {
                console.info("entities read");
              },
              (context, event) => {
                console.info(
                  "Sending update system message through world service"
                );
                props.systemsService.send({
                  type: EventType.START_UPDATE_SYSTEM,
                  callerId: key,
                });
              },
            ],
          },

          ENTITIES_CHANGED: {
            target: StateName.updating,
            actions: [
              (context, event) => {
                console.info(
                  "Adding entities changed message from " +
                    ArchitectureActorType.ComponentSystemGroup
                );
                chartBuilder.addMessage({
                  type: MessageType.Sync,
                  sender: event.callerId,
                  receiver: key,
                  text: event?.type,
                });
              },
              (context, event) => {
                console.info("entities changed");
              },
              (context, event) => {
                console.info(
                  "Sending update system message through world service"
                );
                props.systemsService.send({
                  type: EventType.START_UPDATE_SYSTEM,
                  callerId: key,
                });
              },
            ],
          },

          COMPONENT_CHANGED: {
            target: StateName.updating,
            actions: [
              (context, event) => {
                console.info("changed component of entity");
              },
            ],
          },
        },
      },
      created: {
        always: {
          target: StateName.idle,
        },
      },
      added: {
        always: {
          target: StateName.idle,
        },
      },
      updating: {
        on: {
          ENTITY_CREATED: {
            target: StateName.idle,
            actions: [
              (context, event) => {
                chartBuilder.addMessage({
                  type: MessageType.Sync,
                  sender: event.callerId,
                  receiver: key,
                  text: event?.type,
                });
              },
              (context, event) => {
                console.info("created entity");
              },
              //(context, event) => props.systemsService.send({ type: EventType.FINISH_UPDATE_SYSTEM, callerId: key })
            ],
          },
          COMPONENT_ADDED: {
            target: StateName.idle,
            actions: [
              (context, event) => {
                chartBuilder.addMessage({
                  type: MessageType.Sync,
                  sender: event.callerId,
                  receiver: key,
                  text: event?.type,
                });
              },
              (context, event) => {
                console.info("added component entity");
              },
              //(context, event) => props.systemsService.send({ type: EventType.FINISH_UPDATE_SYSTEM, callerId: key })
            ],
          },
        },
      },
    },
  });

  const service = createStateMachineService(machine);

  const universalEntityQuery = createUniversalEntityQuery({
    callerId: props.callerId,
    apolloClient: apolloClient,
    entityManagerService: service,
    problemSpaceQueryString: `
        query ALL_PROBLEM_ENTITIES {
          uxmData(repositoryId: ${props.world.problemSpace.gitLabProjectId}) {
            equipments {
              _guid,
              line,
              description
            }
          }
        } 
      `,
    solutionSpaceQueryString: `
          query ALL_SOLUTION_ENTITIES {
              entities @client
          }
        `,
  });

  return {
    apolloClient: apolloClient,
    world: props.world,
    universalEntityQuery: universalEntityQuery,
    entityManagerService: service,
  };
}

export function addSystemToUpdateList(props: {
  group: SystemGroup;
  system: System;
}): SystemGroup {
  chartBuilder.addMessage({
    type: MessageType.Sync,
    sender: props.group.callerId,
    receiver: props.system.type,
    text: ArchitectureMessageType.Add,
  });

  return {
    callerId: props.group.callerId,
    type: props.group.type,
    systemsService: props.group.systemsService,
    systems: [...props.group.systems, props.system],
  };
}

let defaultWorld: World | undefined = undefined;
export function getOrCreateDefaultWorld(props: WorldCreationProps): World {
  if (defaultWorld) {
    return defaultWorld;
  }
  const type = ArchitectureActorType.World;
  chartBuilder.addMessage({
    type: MessageType.Sync,
    sender: props.callerId,
    receiver: props.name,
    text: ArchitectureMessageType.Create,
  });

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
                chartBuilder.addMessage({
                  type: MessageType.Sync,
                  sender: props.callerId,
                  receiver: callerId,
                  text: event?.type,
                });

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
            chartBuilder.addMessage({
              type: MessageType.Sync,
              sender: event.callerId,
              receiver: type,
              text: event?.type,
            });

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
                chartBuilder.addMessage({
                  type: MessageType.Sync,
                  sender: event.callerId,
                  receiver: type,
                  text: event?.type,
                });

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

export function createEntity(props: CreateEntityInputProps): Entity {
  const guid = uuid();

  const key = ArchitectureActorType.Entity + Base64.encode(guid);
  chartBuilder.addMessage({
    type: MessageType.Sync,
    sender: props.callerId,
    receiver: key,
    text: ArchitectureMessageType.Create,
  });

  const universalEntityQuery = props.entityManager.universalEntityQuery;
  const currentEntities = toEntitiesArray({
    callerId: props.callerId,
    entityQuery: universalEntityQuery,
  });

  const newEntity = {
    _guid: guid,
    components: props.components ? props.components : [],
  };
  const newEntities = [...currentEntities, newEntity];

  setEntitiesArray({
    callerId: props.callerId,
    entityQuery: universalEntityQuery,
    entities: newEntities,
  });
  props.entityManager.entityManagerService.send({
    type: EventType.ENTITY_CREATED,
    callerId: props.callerId,
    entity: newEntity,
  });

  return { _guid: guid, components: props.components ?? [] };
}

export function createComponentSystemGroup(
  props: SystemGroupCreationProps
): SystemGroup {
  const type = ArchitectureActorType.ComponentSystemGroup;
  chartBuilder.addMessage({
    type: MessageType.Sync,
    sender: props.callerId,
    receiver: type,
    text: ArchitectureMessageType.Create,
  });

  return {
    ...props,
    systems: [],
    type: type,
  };
}

export function createInteractionSystemGroup(
  props: SystemGroupCreationProps
): SystemGroup {
  const type = ArchitectureActorType.InteractionSystemGroup;
  chartBuilder.addMessage({
    type: MessageType.Sync,
    sender: props.callerId,
    receiver: type,
    text: ArchitectureMessageType.Create,
  });

  return {
    ...props,
    systems: [],
    type: type,
  };
}

export function createSystem(props: SystemCreationProps) {}

let pointerId = 0;

export const Pointer = (
  props: PointerInputProps = {
    id: pointerId++,
    x: -1,
    y: -1,
  }
): PointerOutputProps => {
  return {
    type: ComponentType.POINTER,
    id: props.id,
    x: props.x,
    y: props.y,
  };
};

export const Tag = (props: TagInputProps): TagOutputProps => {
  return {
    type: ComponentType.TAG,
    guid: props.guid,
    name: props.name,
  };
};

export const UserInterface = (
  props: UserInterfaceInputProps
): UserInterfaceOutputProps => {
  return {
    type: ComponentType.USER_INTERFACE,
  };
};

export const User = (props: UserInputProps): UserOutputProps => {
  return {
    type: ComponentType.USER,
    name: props.name,
  };
};

export const Story = (props: StoryInputProps): StoryOutputProps => {
  return {
    type: ComponentType.STORY,
    guid: props.guid,
    title: props.title,
  };
};

export const InputAction = (
  props: InputActionCreationProps = {
    name: "",
    isTriggered: false,
    isEnabled: false,
    bindings: [],
    onTrigger: () => {
      console.warn(
        "Triggering action " + props.name + " without a callback defined."
      );
    },
  }
): InputActionComponent => {
  return {
    type: ComponentType.INPUT_ACTION,
    name: props.name,
    isEnabled: props.isEnabled,
    isTriggered: props.isTriggered,
    bindings: props.bindings,
    onTrigger: props.onTrigger,
  };
};

export const InputActionMap = (
  props: InputActionMapCreationProps = {
    name: "",
    entries: {},
  }
): InputActionMapComponent => {
  return {
    type: ComponentType.INPUT_ACTION_MAP,
    name: props.name,
    entries: props.entries,
  };
};

const inputActionMapJson = {
  [InputActionName.addParticipant]: {
    type: ComponentType.INPUT_ACTION,
    name: InputActionName.addParticipant,
    bindings: [
      {
        path: "<Keyboard>/#" + Key.PlusSign,
      },
    ],
  },
};

export function createInputActionMapFromJson(props: {
  name: string;
  json: any;
}) {
  const entries: { [name: string]: InputActionComponent } = {};
  for (let key in props.json) {
    entries[key] = props.json[key];
  }

  const inputActionMap: InputActionMapComponent = {
    type: ComponentType.INPUT_ACTION_MAP,
    name: props.name,
    entries: entries,
  };

  return inputActionMap;
}

export const createTriggeredInputAction = (
  props: InputActionCreationProps,
  isTriggered: boolean
): InputActionComponent => {
  const result = Object.assign(InputAction(), props);
  result.isTriggered = isTriggered;
  return result;
};

export const EntityDescription = (
  props: EntityDescriptionInputProps
): EntityDescriptionOutputProps => {
  return {
    type: ComponentType.DESCRIPTION,
    name: props.name,
    description: props.description,
  };
};

export function updateSystem(props: {
  callerId: string;
  systemService: Interpreter<SystemContext, any, SystemEvent>;
}) {
  props.systemService.send({
    type: EventType.START_UPDATE_SYSTEM,
    callerId: props.callerId,
  });
  props.systemService.send({
    type: EventType.FINISH_UPDATE_SYSTEM,
    callerId: props.callerId,
  });
}

export function createComponentSystem(props: SystemCreationProps): System {
  const type = ArchitectureActorType.ComponentSystem;
  chartBuilder.addMessage({
    type: MessageType.Sync,
    sender: props.callerId,
    receiver: type,
    text: ArchitectureMessageType.Create,
  });
  const universalEntityQuery = props.entityManager.universalEntityQuery;

  const machine = Machine<SystemContext, any, SystemEvent>(
    createSystemMachineConfig({
      callerId: props.callerId,
      key: type,
      entityQuery: universalEntityQuery,
    }),
    {
      actions: {
        [TransitionActionName.onStartRunning]: (_context, _event) => {
          console.info("Starting component system");

          chartBuilder.addMessage({
            type: MessageType.Sync,
            sender: type,
            receiver: type,
            text: TransitionActionName.onStartRunning,
          });
        },
        [TransitionActionName.onUpdate]: (_context, _event) => {
          console.info("Component system updated");

          chartBuilder.addMessage({
            type: MessageType.Sync,
            sender: type,
            receiver: type,
            text: TransitionActionName.onUpdate,
          });

          //universalEntityQuery.service.send({ type: EventType.READ_QUERY, callerId: type });
        },
      },
    }
  );

  const service = createStateMachineService(machine);

  return {
    callerId: props.callerId,
    type: type,
    entityManager: props.entityManager,
    service: service,
  };
}

const toEntitiesArray = (props: {
  callerId: string;
  entityQuery: EntityQueryBase;
}): Entity[] => {
  //props.entityQuery.service.send({ type: EventType.READ_PROBLEM_SPACE_QUERY });
  //
  if (
    props.entityQuery.queryService.machine.key ===
    ArchitectureActorType.UniversalEntityQuery
  ) {
    return props.entityQuery.queryService.state.context.entities;
  }
  props.entityQuery.queryService.send({
    type: EventType.READ_QUERY_SYNC,
    callerId: props.callerId,
  });
  return props.entityQuery.queryService.state.context.entities;
};

const setEntitiesArray = (props: {
  callerId: string;
  entityQuery: EntityQueryBase;
  entities: Entity[];
}): void => {
  const a1 = props.entityQuery.queryService.state.context.entities;
  const a2 = props.entities;

  // compare existing entities with new entities
  const entitiesChanged = !(JSON.stringify(a1) === JSON.stringify(a2));
  if (entitiesChanged) {
    props.entityQuery.queryService.send({
      type: EventType.WRITE_QUERY_SYNC,
      callerId: props.callerId,
      entities: props.entities,
    });
  }

  // props.entityQuery.service.onTransition((_context, event) => {
  //   log.info('Set entities due to ' + event.type + ' array to ' + JSON.stringify(props.entities) + ' in query state ' + props.entityQuery.service.state.value);
  //   props.entityQuery.service.send({ type: EventType.WRITE_SOLUTION_SPACE_QUERY, callerId: 'setEntitiesArray', entities: props.entities });
  //   //}
  // })

  //
};

export function setComponentData<T extends ComponentType>(
  props: SetComponentDataInputProps<T>
): SetComponentDataOutputProps {
  // @Todo: get rid of the array copying mechanism for the sake of performance
  console.info("setComponentData");
  const currentEntities = toEntitiesArray({
    callerId: props.callerId,
    entityQuery: props.entityManager.universalEntityQuery,
  });
  const newEntities = new Array<Entity>();
  currentEntities.forEach((entity) => {
    if (entity._guid === props.entity._guid) {
      const newComponents = new Array<IComponent<T>>();

      let modified = false;
      entity.components.forEach((component) => {
        if (component.type === props.componentData.type) {
          newComponents.push(props.componentData);
          modified = true;
        } else {
          newComponents.push(component);
        }
      });

      if (!modified) {
        newComponents.push(props.componentData);
      }
      const newEntity = Object.assign(
        {},
        { _guid: entity._guid, components: newComponents }
      );

      newEntities.push(newEntity);
      console.info(
        "Setting component data to " + JSON.stringify(entity.components)
      );
    } else {
      newEntities.push(entity);
    }
  });

  setEntitiesArray({
    callerId: props.callerId,
    entityQuery: props.entityManager.universalEntityQuery,
    entities: [...newEntities],
  });

  props.entityManager.entityManagerService.send({
    type: EventType.COMPONENT_ADDED,
    callerId: props.callerId,
  });

  return {
    entity: props.entity,
  };
}

export function getComponentData<T extends IComponent>(
  entity: Entity,
  creator: () => T
): T | undefined {
  const componentData = entity.components.find((component) => {
    return component.type === creator().type;
  });
  if (componentData) {
    return componentData as T;
  }
  throw new Error(
    `Component ${creator().type} not found on Entity ${entity._guid}`
  );
}

export function addComponentsToEntity<T extends ComponentType>(props: {
  callerId: string;
  entityManager: EntityManager;
  entity: Entity;
  components: IComponent<T>[];
}) {
  const newEntities = addComponentsToEntities({
    entities: [props.entity],
    components: props.components,
  }).entities;
  setEntitiesArray({
    callerId: props.callerId,
    entityQuery: props.entityManager.universalEntityQuery,
    entities: newEntities,
  });
}

export function addComponentsToEntitiesByQuery<T extends ComponentType>(props: {
  callerId: string;
  entityQuery: EntityQuery;
  components: IComponent<T>[];
}) {
  const newEntities = addComponentsToEntities({
    entities: toEntitiesArray({
      callerId: props.callerId,
      entityQuery: props.entityQuery,
    }),
    components: props.components,
  }).entities;
  setEntitiesArray({
    callerId: props.callerId,
    entityQuery: props.entityQuery,
    entities: newEntities,
  });
}

export function addComponentsToEntities<T extends ComponentType>(
  props: AddComponentsInputProps<T>
): AddComponentsOutputProps<T> {
  const currentEntities = props.entities;

  const newEntities = [...currentEntities];

  currentEntities.forEach((currentEntity) => {
    const currentComponents = currentEntity.components;
    const newComponents = [...currentComponents, ...props.components];

    newEntities.forEach((newEntity: Entity, index) => {
      if (newEntity._guid === currentEntity._guid) {
        newEntities[index] = {
          _guid: currentEntity._guid,
          components: newComponents,
        };
      }
    });
  });

  return {
    entities: newEntities,
    components: props.components,
  };
}

export function createStateMachineService<
  T extends StateMachine<any, any, any>
>(props: { machine: T }) {
  const service = interpret(props.machine).start();

  service.onTransition((context, _event) => {
    chartBuilder.addMessage({
      type: MessageType.Sync,
      sender: service.id,
      receiver: service.id,
      text:
        "Transition " +
        context.history?.value.toString() +
        " -> " +
        context.value.toString(),
    });
  });
  return service;
}

export function createSystemMachineConfig(
  props: CreateSystemMachineConfigInputProps
) {
  return {
    key: props.key,
    initial: StateName.idle,
    states: {
      idle: {
        on: {
          [EventType.START_RUN_SYSTEM]: {
            target: StateName.initializing,
            actions: [
              (_context: SystemContext, event: SystemEvent) =>
                chartBuilder.addMessage({
                  type: MessageType.Sync,
                  sender: event.callerId,
                  receiver: props.key,
                  text: event.type,
                }),

              () => {
                props.entityQuery.queryService.send({
                  type: EventType.READ_QUERY_ASYNC,
                  callerId: props.key,
                });
              },
            ],
          },
        },
      },
      initializing: {
        on: {
          [EventType.START_UPDATE_SYSTEM]: {
            target: StateName.running,
            actions: [
              (_context: SystemContext, event: SystemEvent) =>
                chartBuilder.addMessage({
                  type: MessageType.Sync,
                  sender: event.callerId,
                  receiver: props.key,
                  text: event.type,
                }),
              TransitionActionName.onStartRunning,
            ],
          },
        },
      },
      running: {
        on: {
          [EventType.START_UPDATE_SYSTEM]: {
            target: StateName.updating,
            actions: [
              (_context: SystemContext, event: SystemEvent) =>
                chartBuilder.addMessage({
                  type: MessageType.Sync,
                  sender: event.callerId,
                  receiver: props.key,
                  text: event.type,
                }),
              TransitionActionName.onUpdate,
            ],
          },
        },
      },
      updating: {
        on: {
          [EventType.FINISH_UPDATE_SYSTEM]: {
            target: StateName.running,
            actions: [
              (_context: SystemContext, event: SystemEvent) =>
                chartBuilder.addMessage({
                  type: MessageType.Sync,
                  sender: event.callerId,
                  receiver: props.key,
                  text: event.type,
                }),
            ],
          },
        },
      },
    },
  };
}

export function createCollaborationSystem(props: SystemCreationProps): System {
  const type = ArchitectureActorType.CollaborationSystem;
  chartBuilder.addMessage({
    type: MessageType.Sync,
    sender: props.callerId,
    receiver: type,
    text: ArchitectureMessageType.Create,
  });

  const entityManager = props.entityManager;
  const entityQuery = getEntityQueryFromDesc({
    callerId: type,
    entityManager: entityManager,
    queryDesc: { all: [ComponentType.USER], none: [ComponentType.POINTER] },
  });

  const machine = Machine<SystemContext, any, SystemEvent>(
    createSystemMachineConfig({
      callerId: props.callerId,
      key: type,
      entityQuery: entityQuery,
    }),
    {
      // update handlers
      actions: {
        [TransitionActionName.onStartRunning]: (_context, _event) => {},
        [TransitionActionName.onUpdate]: (_context, _event) => {
          addComponentsToEntitiesByQuery({
            callerId: props.callerId,
            entityQuery: entityQuery,
            components: [Pointer()],
          });
        },
      },
    }
  );

  const service = createStateMachineService(machine);

  return {
    callerId: props.callerId,
    type: type,
    entityManager: props.entityManager,
    service: service,
  };
}

export function createInputSystem(props: SystemCreationProps): System {
  const type = ArchitectureActorType.InputSystem;
  const entityQuery = getEntityQueryFromDesc({
    callerId: type,
    entityManager: props.entityManager,
    queryDesc: { all: [ComponentType.USER] },
  });

  const inputActionMapQuery = getEntityQueryFromDesc({
    callerId: type,
    entityManager: props.entityManager,
    queryDesc: { all: [ComponentType.INPUT_ACTION_MAP] },
  });

  let x = -1;
  let y = -1;
  let pressedKeys: any = {};

  const machine = Machine<SystemContext, any, SystemEvent>(
    createSystemMachineConfig({
      callerId: props.callerId,
      key: type,
      entityQuery: entityQuery,
    }),
    {
      actions: {
        [TransitionActionName.onStartRunning]: (_context, _event) => {
          const onKeyUp = (e: any) => {
            console.info("Key up: " + e.keyCode);
            pressedKeys[e.keyCode] = false;

            updateSystem({ callerId: type, systemService: service });

            return () => {
              document.removeEventListener("keyup", onKeyUp);
            };
          };
          document.addEventListener("keyup", onKeyUp, false);

          const onKeyDown = (e: any) => {
            console.info("Key down: " + e.keyCode);
            pressedKeys[e.keyCode] = true;

            updateSystem({ callerId: type, systemService: service });

            return () => {
              document.removeEventListener("keydown", onKeyDown);
            };
          };
          document.addEventListener("keydown", onKeyDown, false);

          const onMouseMove = (e: any) => {
            x = e.pageX;
            y = e.pageY;
            console.info("Mouse move (" + x + "/" + y + ")");
            //updateSystem({ callerId: type, systemService: service });

            return () => {
              document.removeEventListener("mousemove", onMouseMove);
            };
          };
          document.addEventListener("mousemove", onMouseMove, false);
        },

        [TransitionActionName.onUpdate]: (_context, _event) => {
          console.info("Input System updated");
          const inputActionMapEntity = toEntitiesArray({
            callerId: props.callerId,
            entityQuery: inputActionMapQuery,
          })[0];
          const inputActionMap = getComponentData(
            inputActionMapEntity,
            InputActionMap
          );

          const newInputActionMap = _.cloneDeep(
            inputActionMap
          ) as InputActionMapComponent;
          const inputActions = Object.values(newInputActionMap.entries);

          inputActions.forEach((inputAction) => {
            inputAction?.bindings.forEach((binding) => {
              const key = binding.path.split("#")[1];
              const triggeredAction = createTriggeredInputAction(
                inputAction,
                pressedKeys[key]
              );
              newInputActionMap.entries[inputAction.name] = triggeredAction;
              if (triggeredAction.isTriggered && triggeredAction.isEnabled) {
                triggeredAction.onTrigger();
              }
            });
          });

          setComponentData({
            callerId: props.callerId,
            entityManager: props.entityManager,
            entity: inputActionMapEntity,
            componentData: newInputActionMap,
          });
        },
      },
    }
  );

  const service = createStateMachineService(machine);

  service.onTransition((context, event) => {
    chartBuilder.addMessage({
      type: MessageType.Sync,
      sender: service.id,
      receiver: service.id,
      text:
        "Transition " +
        context.history?.value.toString() +
        " -> " +
        context.value.toString(),
    });
  });

  return {
    callerId: props.callerId,
    type: type,
    entityManager: props.entityManager,
    service: service,
  };
}

export function createInteractionSystem(props: SystemCreationProps): System {
  const type = ArchitectureActorType.InteractionSystem;
  const entityQuery = props.entityManager.universalEntityQuery;

  const machine = Machine<SystemContext, any, SystemEvent>(
    createSystemMachineConfig({
      callerId: props.callerId,
      key: type,
      entityQuery: entityQuery,
    }),
    {
      actions: {
        [TransitionActionName.onStartRunning]: (_context, _event) => {
          chartBuilder.addMessage({
            type: MessageType.Sync,
            sender: type,
            receiver: type,
            text: TransitionActionName.onStartRunning,
          });

          createEntity({
            callerId: type,
            entityManager: props.entityManager,
            components: [
              UserInterface({}),
              createInputActionMapFromJson({
                name: "Standard Actions",
                json: inputActionMapJson,
              }),
            ],
          });
        },
        [TransitionActionName.onUpdate]: (_context, _event) => {},
      },
    }
  );

  const service = createStateMachineService(machine);
  return {
    callerId: props.callerId,
    type: type,
    entityManager: props.entityManager,
    service: service,
  };
}

export function createWelcomeParticipantsStorySystem(
  props: SystemCreationProps
): System {
  const type = ArchitectureActorType.WelcomeParticipantsStorySystem;
  const entityQuery = props.entityManager.universalEntityQuery;
  const uiEntityQuery = getEntityQueryFromDesc({
    callerId: type,
    entityManager: props.entityManager,
    queryDesc: { all: [ComponentType.USER_INTERFACE] },
  });

  const machine = Machine<SystemContext, any, SystemEvent>(
    createSystemMachineConfig({
      callerId: props.callerId,
      key: type,
      entityQuery: entityQuery,
    }),
    {
      actions: {
        [TransitionActionName.onStartRunning]: (_context, event) => {
          chartBuilder.addMessage({
            type: MessageType.Sync,
            sender: type,
            receiver: type,
            text: TransitionActionName.onStartRunning,
          });
        },
        [TransitionActionName.onUpdate]: (_context, event) => {
          chartBuilder.addMessage({
            type: MessageType.Sync,
            sender: type,
            receiver: type,
            text: event.type,
          });

          const uiEntity = toEntitiesArray({
            callerId: props.callerId,
            entityQuery: uiEntityQuery,
          })[0];

          const inputActionMap = getComponentData(uiEntity, InputActionMap);

          const newInputActionMap = _.cloneDeep(
            inputActionMap
          ) as InputActionMapComponent;
          newInputActionMap.entries[InputActionName.addParticipant].isEnabled =
            true;
          newInputActionMap.entries[InputActionName.addParticipant].onTrigger =
            () => {
              createEntity({
                callerId: type,
                entityManager: props.entityManager,
                components: [
                  User({ name: "Jack the user" }),
                  Tag({ guid: EntityGuids.USER, name: EntityNames.USER }),
                ],
              });
            };

          setComponentData({
            callerId: type,
            entityManager: props.entityManager,
            entity: uiEntity,
            componentData: newInputActionMap,
          });
        },
      },
    }
  );

  const service = createStateMachineService(machine);
  return {
    callerId: props.callerId,
    type: type,
    entityManager: props.entityManager,
    service: service,
  };
}
