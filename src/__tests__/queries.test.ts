import { ArchitectureActorType } from "../model/architecture";
import { World } from "../model/entities";
import {
  TestComponentType_1,
  TestComponentType_2,
  TestComponentType_3,
  TestComponentType_4,
} from "./components/TestComponents";
import { createEntityComponentsExample } from "./helpers/createEntityComponentsExample";
import ecs from "../index";

describe("Test Entity Queries with 'all'", () => {
  let world: World;

  beforeEach(() => {
    world = ecs.createDefaultWorld({
      callerId: ArchitectureActorType.App,
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
    const entities = ecs.toEntitiesArray({
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
      let query = ecs.getEntityQueryFromDesc({
        callerId: world.callerId,
        entityManager: world.entityManager,
        queryDesc: { all: [componentTypes[i - 1]] },
      });

      const entities = ecs.toEntitiesArray({
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
    let query = ecs.getEntityQueryFromDesc({
      callerId: world.callerId,
      entityManager: world.entityManager,
      queryDesc: { all: [{ type: "NonExistentComponent" }] },
    });

    const entities = ecs.toEntitiesArray({
      callerId: world.callerId,
      entityQuery: query,
    });

    expect(entities.length).toBe(0);
  });

  it("Should query all entities with specific component archetype", () => {
    let query = ecs.getEntityQueryFromDesc({
      callerId: world.callerId,
      entityManager: world.entityManager,
      queryDesc: { all: [TestComponentType_1, { type: "A" }] },
    });

    const entities_1 = ecs.toEntitiesArray({
      callerId: world.callerId,
      entityQuery: query,
    });

    query = ecs.getEntityQueryFromDesc({
      callerId: world.callerId,
      entityManager: world.entityManager,
      queryDesc: { all: [TestComponentType_3, { type: "A" }] },
    });

    const entities_2 = ecs.toEntitiesArray({
      callerId: world.callerId,
      entityQuery: query,
    });

    query = ecs.getEntityQueryFromDesc({
      callerId: world.callerId,
      entityManager: world.entityManager,
      queryDesc: { all: [TestComponentType_3, { type: "B" }] },
    });

    const entities_3 = ecs.toEntitiesArray({
      callerId: world.callerId,
      entityQuery: query,
    });

    expect(entities_1.length).toBe(1);
    expect(entities_1[0].components.length).toBe(2);
    expect(entities_1[0].components[0].type).toBe("TEST-1");
    expect(entities_1[0].components).toContainEqual({ type: "A" });

    expect(entities_2.length).toBe(2);
    expect(entities_2[0].components.length).toBe(2);
    expect(entities_2[0].components[0].type).toBe("TEST-3");
    expect(entities_2[0].components).toContainEqual({ type: "A" });
    expect(entities_2[1].components.length).toBe(3);
    expect(entities_2[1].components[0].type).toBe("TEST-3");
    expect(entities_2[1].components).toContainEqual({ type: "A" });

    expect(entities_3.length).toBe(2);
    expect(entities_3[0].components.length).toBe(3);
    expect(entities_3[0].components[0].type).toBe("TEST-3");
    expect(entities_3[0].components).toContainEqual({ type: "B" });
    expect(entities_3[1].components.length).toBe(3);
    expect(entities_3[1].components[0].type).toBe("TEST-3");
    expect(entities_3[1].components).toContainEqual({ type: "B" });
  });
});

describe("Test Entity Queries with 'any'", () => {
  let world: World;

  beforeEach(() => {
    world = ecs.createDefaultWorld({
      callerId: ArchitectureActorType.App,
      problemSpace: {
        gitLabProjectId: 207,
      },
      solutionSpace: {
        gitLabProjectId: 186,
      },
    });

    createEntityComponentsExample(world);
  });

  it("Should query all entities with any of various component", () => {});
});

describe("Test Entity Queries with 'none'", () => {
  let world: World;

  beforeEach(() => {
    world = ecs.createDefaultWorld({
      callerId: ArchitectureActorType.App,
      problemSpace: {
        gitLabProjectId: 207,
      },
      solutionSpace: {
        gitLabProjectId: 186,
      },
    });

    createEntityComponentsExample(world);
  });

  it("Should query all entities without a specific component", () => {
    let query = ecs.getEntityQueryFromDesc({
      callerId: world.callerId,
      entityManager: world.entityManager,
      queryDesc: { none: [TestComponentType_3] },
    });

    const entities_1 = ecs.toEntitiesArray({
      callerId: world.callerId,
      entityQuery: query,
    });

    query = ecs.getEntityQueryFromDesc({
      callerId: world.callerId,
      entityManager: world.entityManager,
      queryDesc: { none: [{ type: "A" }] },
    });

    const entities_2 = ecs.toEntitiesArray({
      callerId: world.callerId,
      entityQuery: query,
    });

    expect(entities_1.length).toBe(7);
    for (let entity of entities_1) {
      for (let component of entity.components) {
        expect([
          TestComponentType_1.type,
          TestComponentType_2.type,
          TestComponentType_4.type,
          "A",
          "B",
        ]).toContain(component.type);
      }
    }

    expect(entities_2.length).toBe(4);
    for (let entity of entities_2) {
      for (let component of entity.components) {
        expect([
          TestComponentType_1.type,
          TestComponentType_2.type,
          TestComponentType_3.type,
          TestComponentType_4.type,
          "B",
        ]).toContain(component.type);
      }
    }
  });

  it("Should query all entities without specific components", () => {
    const query = ecs.getEntityQueryFromDesc({
      callerId: world.callerId,
      entityManager: world.entityManager,
      queryDesc: { none: [TestComponentType_3, { type: "B" }] },
    });

    const entities = ecs.toEntitiesArray({
      callerId: world.callerId,
      entityQuery: query,
    });

    expect(entities.length).toBe(4);
    for (let entity of entities) {
      for (let component of entity.components) {
        expect([
          TestComponentType_1.type,
          TestComponentType_2.type,
          TestComponentType_4.type,
          "A",
        ]).toContain(component.type);
      }
    }
  });
});

describe("Test entity Queries with combined descriptors", () => {
  let world: World;

  beforeEach(() => {
    world = ecs.createDefaultWorld({
      callerId: ArchitectureActorType.App,
      problemSpace: {
        gitLabProjectId: 207,
      },
      solutionSpace: {
        gitLabProjectId: 186,
      },
    });

    createEntityComponentsExample(world);
  });

  it("Should return no entity", () => {
    const query = ecs.getEntityQueryFromDesc({
      callerId: world.callerId,
      entityManager: world.entityManager,
      queryDesc: {
        any: [
          TestComponentType_1,
          TestComponentType_2,
          TestComponentType_3,
          TestComponentType_4,
        ],
        none: [{ type: "A" }, { type: "B" }],
      },
    });

    const entities = ecs.toEntitiesArray({
      callerId: world.callerId,
      entityQuery: query,
    });

    expect(entities).toBeDefined();
    expect(entities.length).toBe(0);
  });

  it("Should return entities with archetype + at least one of 'any' components", () => {
    for (let i = 0; i < 20; i++) {
      ecs.createEntity({
        callerId: world.callerId,
        entityManager: world.entityManager,
        components: [
          i < 5 ? TestComponentType_1 : TestComponentType_2,
          i < 15 ? TestComponentType_3 : TestComponentType_4,
          { type: i < 10 ? "A" : "B" },
          { type: "C" },
        ],
      });
    }

    let query = ecs.getEntityQueryFromDesc({
      callerId: world.callerId,
      entityManager: world.entityManager,
      queryDesc: {
        all: [TestComponentType_1, TestComponentType_3],
        any: [{ type: "B" }],
      },
    });

    const entities_1 = ecs.toEntitiesArray({
      callerId: world.callerId,
      entityQuery: query,
    });

    query = ecs.getEntityQueryFromDesc({
      callerId: world.callerId,
      entityManager: world.entityManager,
      queryDesc: {
        all: [TestComponentType_2, TestComponentType_3],
        any: [{ type: "A" }],
      },
    });

    const entities_2 = ecs.toEntitiesArray({
      callerId: world.callerId,
      entityQuery: query,
    });

    query = ecs.getEntityQueryFromDesc({
      callerId: world.callerId,
      entityManager: world.entityManager,
      queryDesc: {
        all: [TestComponentType_2, TestComponentType_3],
        any: [{ type: "A" }, { type: "B" }],
      },
    });

    const entities_3 = ecs.toEntitiesArray({
      callerId: world.callerId,
      entityQuery: query,
    });

    expect(entities_1).toBeDefined();
    expect(entities_1.length).toBe(0);

    expect(entities_2.length).toBe(5);
    for (let entity of entities_2) {
      for (let component of entity.components) {
        expect([
          TestComponentType_2.type,
          TestComponentType_3.type,
          "A",
          "C",
        ]).toContain(component.type);
      }
    }

    expect(entities_3.length).toBe(10);
    for (let entity of entities_3) {
      for (let component of entity.components) {
        expect([
          TestComponentType_2.type,
          TestComponentType_3.type,
          "A",
          "B",
          "C",
        ]).toContain(component.type);
      }
    }
  });
});
