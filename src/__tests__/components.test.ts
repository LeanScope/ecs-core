import { ArchitectureActorType } from "../model/architecture";
import { World } from "../model/entities";
import {
  createEntity,
  createDefaultWorld,
  toEntitiesArray,
  addComponentsToEntity,
  getEntityQueryFromDesc,
  addComponentsToEntitiesByQuery,
} from "../modules/entities";
import {
  TestComponentType_1,
  TestComponentType_3,
  Test_1,
  Test_2,
} from "./components/TestComponents";
import { createEntityComponentsExample } from "./helpers/createEntityComponentsExample";

describe("Test Component functions", () => {
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
  });

  afterEach(() => {
    world = undefined;
  });

  it("Initializes Entity with 0 Components", () => {
    createEntity({
      entityManager: world.entityManager,
      callerId: world.callerId,
    });

    const entities = toEntitiesArray({
      entityQuery: world.entityManager.universalEntityQuery,
      callerId: world.callerId,
    });

    expect(entities[0]).toBeDefined();
    expect(entities[0].components.length).toBe(0);
  });

  it("Initializes Entity with 1 Component", () => {
    createEntity({
      entityManager: world.entityManager,
      callerId: world.callerId,
      components: [
        Test_1({ testString: "Test 1", testNumber: 1, testBoolean: true }),
      ],
    });

    const entities = toEntitiesArray({
      entityQuery: world.entityManager.universalEntityQuery,
      callerId: world.callerId,
    });

    expect(entities[0]).toBeDefined();
    expect(entities[0].components[0]).toBeDefined();
    expect(entities[0].components[0].type).toBe("TEST-1");
  });

  it("Initializes Entity with multiple Components", () => {
    createEntity({
      entityManager: world.entityManager,
      callerId: world.callerId,
      components: [
        Test_1({ testString: "Test 1", testNumber: 1, testBoolean: true }),
        Test_2({ testString: "Test 2", testNumber: 2, testBoolean: false }),
      ],
    });

    const entities = toEntitiesArray({
      entityQuery: world.entityManager.universalEntityQuery,
      callerId: world.callerId,
    });

    expect(entities[0]).toBeDefined();
    expect(entities[0].components.length).toBe(2);
    expect(entities[0].components[0]).toBeDefined();
    expect(entities[0].components[1]).toBeDefined();

    expect(entities[0].components[0].type).toBe("TEST-1");
    expect(entities[0].components[1].type).toBe("TEST-2");
  });

  it("Should add a component AFTER Entity creation", () => {
    const entity = createEntity({
      entityManager: world.entityManager,
      callerId: world.callerId,
    });

    addComponentsToEntity({
      callerId: world.callerId,
      entityManager: world.entityManager,
      entity: entity,
      components: [
        Test_1({ testString: "Test 1", testNumber: 1, testBoolean: true }),
      ],
    });

    let query = getEntityQueryFromDesc({
      callerId: world.callerId,
      entityManager: world.entityManager,
      queryDesc: { all: [TestComponentType_1] },
    });

    const entities = toEntitiesArray({
      callerId: world.callerId,
      entityQuery: query,
    });

    expect(entities.length).toBe(1);
    expect(entities[0].components.length).toBe(1);
    expect(entities[0].components[0].type).toBe("TEST-1");
  });

  it("Should add mutiple components AFTER Entity creation", () => {
    const entity = createEntity({
      entityManager: world.entityManager,
      callerId: world.callerId,
    });

    addComponentsToEntity({
      callerId: world.callerId,
      entityManager: world.entityManager,
      entity: entity,
      components: [
        Test_1({ testString: "Test 1", testNumber: 1, testBoolean: true }),
        Test_2({ testString: "Test 2", testNumber: 2, testBoolean: false }),
      ],
    });

    let query = getEntityQueryFromDesc({
      callerId: world.callerId,
      entityManager: world.entityManager,
      queryDesc: { all: [TestComponentType_1] },
    });

    const entities = toEntitiesArray({
      callerId: world.callerId,
      entityQuery: query,
    });

    expect(entities.length).toBe(1);
    expect(entities[0].components.length).toBe(2);
    expect(entities[0].components[0].type).toBe("TEST-1");
    expect(entities[0].components[1].type).toBe("TEST-2");
  });

  it("Should add a component to all existing Entities", () => {
    createEntityComponentsExample(world);

    const queryAll = getEntityQueryFromDesc({
      callerId: world.callerId,
      entityManager: world.entityManager,
      queryDesc: {},
    });

    addComponentsToEntitiesByQuery({
      callerId: world.callerId,
      entityQuery: queryAll,
      components: [{ type: "T" }],
    });

    const query = getEntityQueryFromDesc({
      callerId: world.callerId,
      entityManager: world.entityManager,
      queryDesc: { all: [{ type: "T" }] },
    });

    const entities = toEntitiesArray({
      callerId: world.callerId,
      entityQuery: query,
    });

    expect(entities.length).toBe(10);
  });

  it("Should add multiple components to all existing Entities", () => {
    createEntityComponentsExample(world);

    const queryAll = getEntityQueryFromDesc({
      callerId: world.callerId,
      entityManager: world.entityManager,
      queryDesc: {},
    });

    addComponentsToEntitiesByQuery({
      callerId: world.callerId,
      entityQuery: queryAll,
      components: [{ type: "T" }, { type: "E" }, { type: "ST" }],
    });

    const query = getEntityQueryFromDesc({
      callerId: world.callerId,
      entityManager: world.entityManager,
      queryDesc: {
        all: [{ type: "T" }, { type: "E" }, { type: "ST" }],
      },
    });

    const entities = toEntitiesArray({
      callerId: world.callerId,
      entityQuery: query,
    });

    expect(entities.length).toBe(10);
  });

  it("Should add components to queried Entities", () => {
    createEntityComponentsExample(world);

    let query = getEntityQueryFromDesc({
      callerId: world.callerId,
      entityManager: world.entityManager,
      queryDesc: { all: [TestComponentType_3] },
    });

    addComponentsToEntitiesByQuery({
      callerId: world.callerId,
      entityQuery: query,
      components: [{ type: "T" }, { type: "E" }, { type: "ST" }],
    });

    query = getEntityQueryFromDesc({
      callerId: world.callerId,
      entityManager: world.entityManager,
      queryDesc: {
        all: [{ type: "T" }, { type: "E" }, { type: "ST" }],
      },
    });

    const entities = toEntitiesArray({
      callerId: world.callerId,
      entityQuery: query,
    });

    expect(entities.length).toBe(3);
  });

  it("Should add components to referenced Entities", () => {
    let entities = createEntityComponentsExample(world);

    addComponentsToEntitiesByQuery({
      entityQuery: world.entityManager.universalEntityQuery,
      components: [{ type: "T" }, { type: "E" }, { type: "ST" }],
    });

    const query = getEntityQueryFromDesc({
      callerId: world.callerId,
      entityManager: world.entityManager,
      queryDesc: {
        all: [{ type: "T" }, { type: "E" }, { type: "ST" }],
      },
    });

    entities = toEntitiesArray({
      callerId: world.callerId,
      entityQuery: query,
    });

    expect(entities.length).toBe(10);
  });
});
