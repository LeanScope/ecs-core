import ecs from "../index";
import { ArchitectureActorType } from "../model/architecture";
import { World } from "../model/entities";
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
    world = ecs.createDefaultWorld({
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
    ecs.createEntity({
      entityManager: world.entityManager,
      callerId: world.callerId,
    });

    const entities = ecs.toEntitiesArray({
      entityQuery: world.entityManager.universalEntityQuery,
      callerId: world.callerId,
    });

    expect(entities[0]).toBeDefined();
    expect(entities[0].components.length).toBe(0);
  });

  it("Initializes Entity with 1 Component", () => {
    ecs.createEntity({
      entityManager: world.entityManager,
      callerId: world.callerId,
      components: [
        Test_1({ testString: "Test 1", testNumber: 1, testBoolean: true }),
      ],
    });

    const entities = ecs.toEntitiesArray({
      entityQuery: world.entityManager.universalEntityQuery,
      callerId: world.callerId,
    });

    expect(entities[0]).toBeDefined();
    expect(entities[0].components[0]).toBeDefined();
    expect(entities[0].components[0].type).toBe("TEST-1");
  });

  it("Initializes Entity with multiple Components", () => {
    ecs.createEntity({
      entityManager: world.entityManager,
      callerId: world.callerId,
      components: [
        Test_1({ testString: "Test 1", testNumber: 1, testBoolean: true }),
        Test_2({ testString: "Test 2", testNumber: 2, testBoolean: false }),
      ],
    });

    const entities = ecs.toEntitiesArray({
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
    const entity = ecs.createEntity({
      entityManager: world.entityManager,
      callerId: world.callerId,
    });

    ecs.addComponentsToEntity({
      callerId: world.callerId,
      entityManager: world.entityManager,
      entity: entity,
      components: [
        Test_1({ testString: "Test 1", testNumber: 1, testBoolean: true }),
      ],
    });

    let query = ecs.getEntityQueryFromDesc({
      callerId: world.callerId,
      entityManager: world.entityManager,
      queryDesc: { all: [TestComponentType_1] },
    });

    const entities = ecs.toEntitiesArray({
      callerId: world.callerId,
      entityQuery: query,
    });

    expect(entities.length).toBe(1);
    expect(entities[0].components.length).toBe(1);
    expect(entities[0].components[0].type).toBe("TEST-1");
  });

  it("Should add mutiple components AFTER Entity creation", () => {
    const entity = ecs.createEntity({
      entityManager: world.entityManager,
      callerId: world.callerId,
    });

    ecs.addComponentsToEntity({
      callerId: world.callerId,
      entityManager: world.entityManager,
      entity: entity,
      components: [
        Test_1({ testString: "Test 1", testNumber: 1, testBoolean: true }),
        Test_2({ testString: "Test 2", testNumber: 2, testBoolean: false }),
      ],
    });

    let query = ecs.getEntityQueryFromDesc({
      callerId: world.callerId,
      entityManager: world.entityManager,
      queryDesc: { all: [TestComponentType_1] },
    });

    const entities = ecs.toEntitiesArray({
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

    const queryAll = ecs.getEntityQueryFromDesc({
      callerId: world.callerId,
      entityManager: world.entityManager,
      queryDesc: {},
    });

    ecs.addComponentsToEntitiesByQuery({
      callerId: world.callerId,
      entityQuery: queryAll,
      components: [{ type: "T" }],
    });

    const query = ecs.getEntityQueryFromDesc({
      callerId: world.callerId,
      entityManager: world.entityManager,
      queryDesc: { all: [{ type: "T" }] },
    });

    const entities = ecs.toEntitiesArray({
      callerId: world.callerId,
      entityQuery: query,
    });

    expect(entities.length).toBe(10);
  });

  it("Should add multiple components to all existing Entities", () => {
    createEntityComponentsExample(world);

    const queryAll = ecs.getEntityQueryFromDesc({
      callerId: world.callerId,
      entityManager: world.entityManager,
      queryDesc: {},
    });

    ecs.addComponentsToEntitiesByQuery({
      callerId: world.callerId,
      entityQuery: queryAll,
      components: [{ type: "T" }, { type: "E" }, { type: "ST" }],
    });

    const query = ecs.getEntityQueryFromDesc({
      callerId: world.callerId,
      entityManager: world.entityManager,
      queryDesc: {
        all: [{ type: "T" }, { type: "E" }, { type: "ST" }],
      },
    });

    const entities = ecs.toEntitiesArray({
      callerId: world.callerId,
      entityQuery: query,
    });

    expect(entities.length).toBe(10);
  });

  it("Should add components to queried Entities", () => {
    createEntityComponentsExample(world);

    let query = ecs.getEntityQueryFromDesc({
      callerId: world.callerId,
      entityManager: world.entityManager,
      queryDesc: { all: [TestComponentType_3] },
    });

    ecs.addComponentsToEntitiesByQuery({
      callerId: world.callerId,
      entityQuery: query,
      components: [{ type: "T" }, { type: "E" }, { type: "ST" }],
    });

    query = ecs.getEntityQueryFromDesc({
      callerId: world.callerId,
      entityManager: world.entityManager,
      queryDesc: {
        all: [{ type: "T" }, { type: "E" }, { type: "ST" }],
      },
    });

    const entities = ecs.toEntitiesArray({
      callerId: world.callerId,
      entityQuery: query,
    });

    expect(entities.length).toBe(3);
  });

  it("Should add components to referenced Entities", () => {
    let entities = createEntityComponentsExample(world);

    ecs.addComponentsToEntitiesByQuery({
      entityQuery: world.entityManager.universalEntityQuery,
      components: [{ type: "T" }, { type: "E" }, { type: "ST" }],
    });

    const query = ecs.getEntityQueryFromDesc({
      callerId: world.callerId,
      entityManager: world.entityManager,
      queryDesc: {
        all: [{ type: "T" }, { type: "E" }, { type: "ST" }],
      },
    });

    entities = ecs.toEntitiesArray({
      callerId: world.callerId,
      entityQuery: query,
    });

    expect(entities.length).toBe(10);
  });
});
