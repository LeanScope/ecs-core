import { v4 as uuid } from "uuid";
import { ArchitectureActorType } from "../model/architecture";
import { ComponentType, IComponent } from "../model/components";
import { World } from "../model/entities";
import {
  createEntity,
  getOrCreateDefaultWorld,
  toEntitiesArray,
} from "../modules/entities";

interface TestComponent extends IComponent, ComponentType {
  testString: string;
  testNumber: number;
  testBoolean: boolean;
}

describe("Test Component functions", () => {
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
      forceNew: true,
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
        {
          type: "Test-Component",
          testBoolean: true,
          testString: "test",
          testNumber: 41,
        } as TestComponent,
      ],
    });

    const entities = toEntitiesArray({
      entityQuery: world.entityManager.universalEntityQuery,
      callerId: world.callerId,
    });

    expect(entities[0]).toBeDefined();
    expect(entities[0].components[0]).toBeDefined();
    expect(entities[0].components[0].type).toBe("Test-Component");
  });

  it("Initializes Entity with multiple components", () => {
    createEntity({
      entityManager: world.entityManager,
      callerId: world.callerId,
      components: [{ type: "Test-Component" }],
    });

    const entities = toEntitiesArray({
      entityQuery: world.entityManager.universalEntityQuery,
      callerId: world.callerId,
    });

    expect(entities[0]).toBeDefined();
    expect(entities[0].components[0]).toBeDefined();
    expect(entities[0].components[0].type).toBe("Test-Component");
  });
});

//TODO Add components to entities afterwards
