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
import { createSystemMachineConfig } from "../../modules/systems";
import {
  TestComponent,
  TestComponentType_1,
  TestComponentType_2,
  TestComponentType_3,
  TestComponentType_4,
} from "../components/TestComponents";

export function createTestSystem(props: SystemCreationProps): System {
  const type = ArchitectureActorType.InteractionSystem;
  const entityQuery = getEntityQueryFromDesc({
    callerId: props.callerId,
    entityManager: props.entityManager,
    queryDesc: {
      any: [
        TestComponentType_1,
        TestComponentType_2,
        TestComponentType_3,
        TestComponentType_4,
      ],
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
          console.log('onStartRunning()');
          const entities = toEntitiesArray({
            callerId: props.callerId,
            entityQuery: entityQuery,
          });

          for (let entity of entities) {
            const component = entity.components.find((component) => {
              return (
                TestComponentType_1.type === component.type ||
                TestComponentType_2.type === component.type ||
                TestComponentType_3.type === component.type ||
                TestComponentType_4.type === component.type
              );
            }) as TestComponent;

            setComponentData({
              callerId: props.callerId,
              entity: entity,
              entityManager: props.entityManager,
              componentData: {
                type: component.type,
                testString: "1",
                testNumber: 1,
                testBoolean: true,
              } as TestComponent,
            });
          }
        },

        [TransitionActionName.onUpdate]: (_context, _event) => {
          console.log("UPDATING");
          const entities = toEntitiesArray({
            callerId: props.callerId,
            entityQuery: entityQuery,
          });

          for (let entity of entities) {
            const components = entity.components.filter((component) => {
              return (
                TestComponentType_1.type === component.type ||
                TestComponentType_2.type === component.type ||
                TestComponentType_3.type === component.type ||
                TestComponentType_4.type === component.type
              );
            }) as TestComponent[];

            for (let component of components) {
              setComponentData({
                callerId: props.callerId,
                entity: entity,
                entityManager: props.entityManager,
                componentData: {
                  type: component.type,
                  testString: `${component.testNumber + 1}`,
                  testNumber: component.testNumber + 1,
                  testBoolean: true,
                } as TestComponent,
              });
            }
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
