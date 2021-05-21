import { v4 as uuid } from "uuid";
import { ArchitectureActorType } from "../model/architecture";
import { ComponentType, IComponent } from "../model/components";
import { EntityQueryBase, EntityQueryDesc, World } from "../model/entities";
import {
  createEntity,
  getEntityQueryFromDesc,
  getOrCreateDefaultWorld,
  toEntitiesArray,
} from "../modules/entities";

interface TestComponent extends IComponent {
  testString: string;
  testNumber: number;
  testBoolean: boolean;
}

describe("Test Queries", () => {
  let world: World;

  beforeEach(() => {
    world = getOrCreateDefaultWorld({
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
  });

  afterEach(() => {
    world = undefined;
  });

  it("Query all components", () => {
    for (let i = 0; i < 10; i++) {
      createEntity({
        entityManager: world.entityManager,
        callerId: world.callerId,
      });
    }

    const entities = toEntitiesArray({
      entityQuery: world.entityManager.universalEntityQuery,
      callerId: world.callerId,
    });

    expect(entities.length).toBe(10);
    for (let i = 0; i < 10; i++) {
      expect(entities[i]).toBeDefined();
      expect(entities[i].components.length).toBe(0);
    }
  });

  it("Query all with specific component", () => {
    createEntityComponentsExample(world);

    for (let i = 1; i <= 4; i++) {
      let query = getEntityQueryFromDesc({
        callerId: world.callerId,
        entityManager: world.entityManager,
        queryDesc: { all: ["Test-" + i] },
      });

      const entities = toEntitiesArray({
        callerId: world.callerId,
        entityQuery: query,
      });

      expect(entities.length).toBe(i);
      for (let entity of entities) {
        expect(entity.components.length).toBe(2);
        expect(entity.components[0].type).toBe("Test-" + i);
      }
    }
  });

  it("Query with non-existant component type", () => {
    createEntityComponentsExample(world);

    let query = getEntityQueryFromDesc({
      callerId: world.callerId,
      entityManager: world.entityManager,
      queryDesc: { all: ["NonExistentComponent"] },
    });

    const entities = toEntitiesArray({
      callerId: world.callerId,
      entityQuery: query,
    });

    expect(entities.length).toBe(0);
  });

  it("Query all entities with specific component archetype", () => {
    createEntityComponentsExample(world);

    let query = getEntityQueryFromDesc({
      callerId: world.callerId,
      entityManager: world.entityManager,
      queryDesc: { all: ["Test-1", "A"] },
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
      queryDesc: { all: ["Test-3", "A"] },
    });

    entities = toEntitiesArray({
      callerId: world.callerId,
      entityQuery: query,
    });

    expect(entities.length).toBe(2);
    expect(entities[0].components).toContainEqual({ type: "Test-3" });
    expect(entities[0].components).toContainEqual({ type: "A" });
    expect(entities[1].components).toContainEqual({ type: "Test-3" });
    expect(entities[1].components).toContainEqual({ type: "A" });

    query = getEntityQueryFromDesc({
      callerId: world.callerId,
      entityManager: world.entityManager,
      queryDesc: { all: ["Test-3", "B"] },
    });

    entities = toEntitiesArray({
      callerId: world.callerId,
      entityQuery: query,
    });

    expect(entities.length).toBe(1);
    expect(entities[0].components).toContainEqual({ type: "Test-3" });
    expect(entities[0].components).toContainEqual({ type: "B" });
  });

  /*  it("Query all without specific component", () => {});

  it("Query all without specific component archetype", () => {});

  it("Query all with any specific component", () => {}); */
});

function createEntityComponentsExample(world: World) {
  createEntity({
    entityManager: world.entityManager,
    callerId: world.callerId,
    components: [{ type: "Test-1" }, { type: "A" }],
  });

  createEntity({
    entityManager: world.entityManager,
    callerId: world.callerId,
    components: [{ type: "Test-2" }, { type: "A" }],
  });
  createEntity({
    entityManager: world.entityManager,
    callerId: world.callerId,
    components: [{ type: "Test-2" }, { type: "B" }],
  });

  createEntity({
    entityManager: world.entityManager,
    callerId: world.callerId,
    components: [{ type: "Test-3" }, { type: "A" }],
  });
  createEntity({
    entityManager: world.entityManager,
    callerId: world.callerId,
    components: [{ type: "Test-3" }, { type: "A" }],
  });
  createEntity({
    entityManager: world.entityManager,
    callerId: world.callerId,
    components: [{ type: "Test-3" }, { type: "B" }],
  });

  createEntity({
    entityManager: world.entityManager,
    callerId: world.callerId,
    components: [{ type: "Test-4" }, { type: "A" }],
  });
  createEntity({
    entityManager: world.entityManager,
    callerId: world.callerId,
    components: [{ type: "Test-4" }, { type: "B" }],
  });
  createEntity({
    entityManager: world.entityManager,
    callerId: world.callerId,
    components: [{ type: "Test-4" }, { type: "A" }],
  });
  createEntity({
    entityManager: world.entityManager,
    callerId: world.callerId,
    components: [{ type: "Test-4" }, { type: "B" }],
  });
}
