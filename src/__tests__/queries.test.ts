import { v4 as uuid } from "uuid";
import { ArchitectureActorType } from "../model/architecture";
import { World } from "../model/entities";
import {
  createEntity,
  getEntityQueryFromDesc,
  createDefaultWorld,
  toEntitiesArray,
} from "../modules/entities";
import {
  Test_1,
  Test_2,
  Test_3,
  Test_4,
  TestComponentType_1,
  TestComponentType_2,
  TestComponentType_3,
  TestComponentType_4,
} from "./components/test-components";

describe("Test various Entity Queries", () => {
  let world: World;

  beforeEach(() => {
    world = createDefaultWorld({
      callerId: ArchitectureActorType.App,
      name: ArchitectureActorType.World,
      sessionGuid: uuid(),
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

  it("Should query all entities", () => {
    const entities = toEntitiesArray({
      entityQuery: world.entityManager.universalEntityQuery,
      callerId: world.callerId,
    });

    expect(entities.length).toBe(10);
    for (let i = 0; i < 10; i++) {
      expect(entities[i]).toBeDefined();
    }
  });

  it("Should query all entities with a specific component", () => {
    const componentTypes = [
      TestComponentType_1,
      TestComponentType_2,
      TestComponentType_3,
      TestComponentType_4,
    ];

    for (let i = 1; i <= 4; i++) {
      let query = getEntityQueryFromDesc({
        callerId: world.callerId,
        entityManager: world.entityManager,
        queryDesc: { all: [componentTypes[i - 1]] },
      });

      const entities = toEntitiesArray({
        callerId: world.callerId,
        entityQuery: query,
      });

      expect(entities.length).toBe(i);
      for (let entity of entities) {
        expect(entity.components[0].type).toBe(`TEST-${i}`);
      }
    }
  });

  it("Should query entities with non-existant component type", () => {
    let query = getEntityQueryFromDesc({
      callerId: world.callerId,
      entityManager: world.entityManager,
      queryDesc: { all: [{ type: "NonExistentComponent" }] },
    });

    const entities = toEntitiesArray({
      callerId: world.callerId,
      entityQuery: query,
    });

    expect(entities.length).toBe(0);
  });

  it("Should query all entities with specific component archetype", () => {
    let query = getEntityQueryFromDesc({
      callerId: world.callerId,
      entityManager: world.entityManager,
      queryDesc: { all: [TestComponentType_1, { type: "A" }] },
    });

    let entities = toEntitiesArray({
      callerId: world.callerId,
      entityQuery: query,
    });

    expect(entities.length).toBe(1);
    expect(entities[0].components.length).toBe(2);

    query = getEntityQueryFromDesc({
      callerId: world.callerId,
      entityManager: world.entityManager,
      queryDesc: { all: [TestComponentType_3, { type: "A" }] },
    });

    entities = toEntitiesArray({
      callerId: world.callerId,
      entityQuery: query,
    });

    expect(entities.length).toBe(2);
    expect(entities[0].components.length).toBe(2);
    expect(entities[0].components[0].type).toBe("TEST-3");
    expect(entities[0].components).toContainEqual({ type: "A" });
    expect(entities[1].components.length).toBe(3);
    expect(entities[1].components[0].type).toBe("TEST-3");
    expect(entities[1].components).toContainEqual({ type: "A" });

    query = getEntityQueryFromDesc({
      callerId: world.callerId,
      entityManager: world.entityManager,
      queryDesc: { all: [TestComponentType_3, { type: "B" }] },
    });

    entities = toEntitiesArray({
      callerId: world.callerId,
      entityQuery: query,
    });

    expect(entities.length).toBe(2);
    expect(entities[0].components.length).toBe(3);
    expect(entities[0].components[0].type).toBe("TEST-3");
    expect(entities[0].components).toContainEqual({ type: "B" });
    expect(entities[1].components.length).toBe(3);
    expect(entities[1].components[0].type).toBe("TEST-3");
    expect(entities[1].components).toContainEqual({ type: "B" });
  });

  /*  it("Should query all entities without a specific component", () => {});

  it("Should query all entities without a specific component archetype", () => {});

  it("Should query all entities with any of various component", () => {}); */
});

function createEntityComponentsExample(world: World) {
  createEntity({
    entityManager: world.entityManager,
    callerId: world.callerId,
    components: [
      Test_1({ testString: "Test 1", testNumber: 1, testBoolean: true }),
      { type: "A" },
    ],
  });

  createEntity({
    entityManager: world.entityManager,
    callerId: world.callerId,
    components: [
      Test_2({ testString: "Test 2", testNumber: 2, testBoolean: false }),
      { type: "A" },
    ],
  });

  createEntity({
    entityManager: world.entityManager,
    callerId: world.callerId,
    components: [
      Test_2({ testString: "Test 2", testNumber: 2, testBoolean: true }),
      { type: "B" },
    ],
  });

  createEntity({
    entityManager: world.entityManager,
    callerId: world.callerId,
    components: [
      Test_3({ testString: "Test 3", testNumber: 3, testBoolean: true }),
      { type: "A" },
    ],
  });
  createEntity({
    entityManager: world.entityManager,
    callerId: world.callerId,
    components: [
      Test_3({ testString: "Test 3", testNumber: 3, testBoolean: true }),
      { type: "B" },
      { type: "B" },
    ],
  });
  createEntity({
    entityManager: world.entityManager,
    callerId: world.callerId,
    components: [
      Test_3({ testString: "Test 3", testNumber: 3, testBoolean: true }),
      { type: "A" },
      { type: "B" },
    ],
  });

  createEntity({
    entityManager: world.entityManager,
    callerId: world.callerId,
    components: [
      Test_4({ testString: "Test 4", testNumber: 4, testBoolean: true }),
      { type: "A" },
      { type: "A" },
    ],
  });
  createEntity({
    entityManager: world.entityManager,
    callerId: world.callerId,
    components: [
      Test_4({ testString: "Test 4", testNumber: 4, testBoolean: true }),
      { type: "B" },
    ],
  });
  createEntity({
    entityManager: world.entityManager,
    callerId: world.callerId,
    components: [
      Test_4({ testString: "Test 4", testNumber: 4, testBoolean: true }),
      { type: "A" },
    ],
  });
  createEntity({
    entityManager: world.entityManager,
    callerId: world.callerId,
    components: [
      Test_4({ testString: "Test 4", testNumber: 4, testBoolean: true }),
      { type: "B" },
    ],
  });
}
