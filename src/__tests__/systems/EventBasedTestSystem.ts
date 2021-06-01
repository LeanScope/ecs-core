import { Machine } from "xstate";
import { ArchitectureActorType } from "../../model/architecture";
import {
  System,
  SystemContext,
  SystemCreationProps,
  SystemEvent,
} from "../../model/systems";
import { TransitionActionName } from "../../model/TransitionActionName";
import { setComponentData } from "../../modules/components/Components";
import {
  getEntityQueryFromDesc,
  toEntitiesArray,
} from "../../modules/entities";
import { createStateMachineService } from "../../modules/StateMachine";
import { createSystemMachineConfig, updateSystem } from "../../modules/systems";
import {
  TestComponent,
  TestComponentType_1,
  TestComponentType_2,
  TestComponentType_3,
  TestComponentType_4,
} from "../components/TestComponents";

export function createEventBasedTestSystem(props: SystemCreationProps): System {
  const type = ArchitectureActorType.GenericSystem;
  const entityQuery = getEntityQueryFromDesc({
    callerId: props.callerId,
    entityManager: props.entityManager,
    queryDesc: {
      all: [TestComponentType_4],
    },
  });

  const machine = Machine<SystemContext, any, SystemEvent>(
    createSystemMachineConfig({
      callerId: props.callerId,
      key: type,
      entityQuery: entityQuery,
    }),
    {
      actions: {
        [TransitionActionName.onStartRunning]: (_context, _event) => {
          for (let i = 0; i < 3; i++) {
            setInterval(() => {
              updateSystem({ systemService: service });
            }, i * 100);
          }
        },

        [TransitionActionName.onUpdate]: (_context, _event) => {
          const entities = toEntitiesArray({
            entityQuery: entityQuery,
          });

          for (let entity of entities) {
            const component = entity.components.find((component) => {
              return component.type === TestComponentType_4.type;
            }) as TestComponent;

            // INFINITY LOOP!
            setComponentData({
              callerId: props.callerId,
              entity: entity,
              entityManager: props.entityManager,
              componentData: {
                type: component.type,
                testString: `${component.testNumber + 100}`,
                testNumber: component.testNumber + 100,
                testBoolean: true,
              } as TestComponent,
            });
          }
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
