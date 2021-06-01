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
  initSystems,
  updateAllSystems,
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
import { createBasicTestSystem } from "./systems/BasicTestSystem";

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

  it("Should initialize the test system", () => {
    let testSystemGroup = createSystemGroup({
      callerId: world.callerId,
      systemsService: world.systemsService,
    });

    testSystemGroup = addSystemToUpdateList({
      group: testSystemGroup,
      system: createBasicTestSystem({
        callerId: world.callerId,
        entityManager: world.entityManager,
      }),
    });

    world.systemGroups.push(testSystemGroup);

    initSystems({ world });

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
          component.type === TestComponentType_3.type
        ) {
          expect((component as TestComponent).testString).toBe("Starting");
          expect((component as TestComponent).testNumber).toBe(0);
          expect((component as TestComponent).testBoolean).toBe(false);
        } else if (component.type === TestComponentType_4.type) {
          expect((component as TestComponent).testString).toBe("Test 4");
          expect((component as TestComponent).testNumber).toBe(4);
          expect((component as TestComponent).testBoolean).toBe(true);
        }
      }
    }
  });

  it("Should execute 50 update cycles", () => {
    let testSystemGroup = createSystemGroup({
      callerId: world.callerId,
      systemsService: world.systemsService,
    });

    testSystemGroup = addSystemToUpdateList({
      group: testSystemGroup,
      system: createBasicTestSystem({
        callerId: world.callerId,
        entityManager: world.entityManager,
      }),
    });

    world.systemGroups.push(testSystemGroup);

    initSystems({ world });
    for (let i = 0; i < 50; i++) {
      updateAllSystems({ world });
    }

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
          component.type === TestComponentType_3.type
        ) {
          expect((component as TestComponent).testString).toBe("50");
          expect((component as TestComponent).testNumber).toBe(50);
          expect((component as TestComponent).testBoolean).toBe(true);
        } else if (component.type === TestComponentType_4.type) {
          expect((component as TestComponent).testString).toBe("Test 4");
          expect((component as TestComponent).testNumber).toBe(4);
          expect((component as TestComponent).testBoolean).toBe(true);
        }
      }
    }
  });

  //
});
