import { v4 as uuid } from "uuid";
import { ArchitectureActorType } from "../model/architecture";
import { ComponentType, IComponent } from "../model/components";
import { World } from "../model/entities";
import {
  createEntity,
  createDefaultWorld,
  toEntitiesArray,
} from "../modules/entities";
import { TestComponent, Test_1, Test_2 } from "./components/test-components";

describe("Test Component functions", () => {
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
  });

  afterEach(() => {
    world = undefined;
  });

  it("Initializes Entity with 0 components", () => {
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

  it("Initializes Entity with 1 component", () => {
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

  it("Initializes Entity with multiple components", () => {
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
});

//TODO Add components to entities afterwards
