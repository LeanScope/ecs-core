import { Interpreter, Machine } from "xstate";
import { ArchitectureActorType } from "../../model/architecture";
import {
  ComponentType,
  InputActionMapComponent,
  InputActionMapComponentType,
  InputActionName,
  PointerComponentType,
  UserComponentType,
  UserInterfaceComponentType,
} from "../../model/components";
import { EventType } from "../../model/EventType";
import { StateName } from "../../model/StateName";
import {
  CreateSystemMachineConfigInputProps,
  System,
  SystemContext,
  SystemCreationProps,
  SystemEvent,
  SystemGroup,
} from "../../model/systems";
import * as _ from "lodash";
import { TransitionActionName } from "../../model/TransitionActionName";
import { EntityGuids, EntityNames } from "../../api/Entities";
import { createStateMachineService } from "../StateMachine";
import { getEntityQueryFromDesc } from "../entities";
import {
  addComponentsToEntitiesByQuery,
  createEntity,
  toEntitiesArray,
} from "../entities";
import {
  Pointer,
  getComponentData,
  InputActionMap,
  createTriggeredInputAction,
  setComponentData,
  UserInterface,
  createInputActionMapFromJson,
  User,
  Tag,
  inputActionMapJson,
} from "../components";

export function addSystemToUpdateList(props: {
  group: SystemGroup;
  system: System;
}): SystemGroup {
  return {
    callerId: props.group.callerId,
    type: props.group.type,
    systemsService: props.group.systemsService,
    systems: [...props.group.systems, props.system],
  };
}

export function createSystem(props: SystemCreationProps) {}

export function updateSystem(props: {
  callerId?: string;
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
          //console.info("Starting component system");
        },
        [TransitionActionName.onUpdate]: (_context, _event) => {
          //console.info("Component system updated");
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
        entry: [
          TransitionActionName.onStartRunning
        ],
        on: {
          [EventType.START_UPDATE_SYSTEM]: {
            target: StateName.running,
            actions: [],
          },
        },
      },
      running: {
        on: {
          [EventType.START_UPDATE_SYSTEM]: {
            target: StateName.updating,
            actions: [TransitionActionName.onUpdate],
          },
        },
      },
      updating: {
        on: {
          [EventType.FINISH_UPDATE_SYSTEM]: {
            target: StateName.running,
          },
        },
      },
    },
  };
}

export function createCollaborationSystem(props: SystemCreationProps): System {
  const type = ArchitectureActorType.CollaborationSystem;

  const entityManager = props.entityManager;
  const entityQuery = getEntityQueryFromDesc({
    callerId: type,
    entityManager: entityManager,
    queryDesc: { all: [UserComponentType], none: [PointerComponentType] },
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
    queryDesc: { all: [UserComponentType] },
  });

  const inputActionMapQuery = getEntityQueryFromDesc({
    callerId: type,
    entityManager: props.entityManager,
    queryDesc: { all: [InputActionMapComponentType] },
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

          for (let inputAction of inputActions) {
            for (let binding of inputAction?.bindings) {
              const key = binding.path.split("#")[1];
              const triggeredAction = createTriggeredInputAction(
                inputAction,
                pressedKeys[key]
              );
              newInputActionMap.entries[inputAction.name] = triggeredAction;
              if (triggeredAction.isTriggered && triggeredAction.isEnabled) {
                triggeredAction.onTrigger();
              }
            }
          }

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
    queryDesc: { all: [UserInterfaceComponentType] },
  });

  const machine = Machine<SystemContext, any, SystemEvent>(
    createSystemMachineConfig({
      callerId: props.callerId,
      key: type,
      entityQuery: entityQuery,
    }),
    {
      actions: {
        [TransitionActionName.onUpdate]: (_context, event) => {
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
