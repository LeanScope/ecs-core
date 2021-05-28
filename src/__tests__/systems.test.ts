import { ArchitectureActorType } from "../model/architecture";
import { World } from "../model/entities";
import { EventType } from "../model/EventType";
import {
  createDefaultWorld,
  toEntitiesArray,
  getEntityQueryFromDesc,
} from "../modules/entities";
import {
  addSystemToUpdateList,
  createSystemGroup,
  updateSystem,
} from "../modules/systems";
import {
  TestComponent,
  TestComponentType_1,
  TestComponentType_2,
  TestComponentType_3,
  TestComponentType_4,
} from "./components/TestComponents";
import { createEntityComponentsExample } from "./helpers/createEntityComponentsExample";
import { createTestSystem } from "./systems/TestSystem";

describe("Test System functions", () => {
  let world: World;

  beforeEach(() => {
    world = createDefaultWorld({
      callerId: ArchitectureActorType.App,
      name: ArchitectureActorType.World,
      problemSpace: {
        gitLabProjectId: 207,
      },
      solutionSpace: {
        gitLabProjectId: 186,
      },
    });

    createEntityComponentsExample(world);
  });

  afterEach(() => {
    world = undefined;
  });

  it("Should update the test system once", () => {
    let testSystemGroup = createSystemGroup({
      callerId: world.callerId,
      systemsService: world.systemsService,
    });

    testSystemGroup = addSystemToUpdateList({
      group: testSystemGroup,
      system: createTestSystem({
        callerId: world.callerId,
        entityManager: world.entityManager,
      }),
    });

    world.systemGroups.push(testSystemGroup);

    world.systemsService.send(EventType.START_RUN_SYSTEM);
    updateSystem({
      callerId: world.callerId,
      systemService: world.systemsService,
    });

    //world.systemsService.send(EventType.START_UPDATE_SYSTEM);

    const query = getEntityQueryFromDesc({
      callerId: world.callerId,
      entityManager: world.entityManager,
      queryDesc: {},
    });

    const entities = toEntitiesArray({
      callerId: world.callerId,
      entityQuery: query,
    });

    for (let entity of entities) {
      expect(entity.components.length).toBeGreaterThanOrEqual(2);
      expect(entity.components.length).toBeLessThanOrEqual(3);

      for (let component of entity.components) {
        if (
          component.type === TestComponentType_1.type ||
          component.type === TestComponentType_2.type ||
          component.type === TestComponentType_3.type ||
          component.type === TestComponentType_4.type
        ) {
          expect((component as TestComponent).testString).toBe("1");
          expect((component as TestComponent).testNumber).toBe(1);
          expect((component as TestComponent).testBoolean).toBe(true);
        }
      }
    }
  });
});
