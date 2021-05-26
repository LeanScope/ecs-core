import { v4 as uuid } from "uuid";
import { ArchitectureActorType } from "../model/architecture";
import { World } from "../model/entities";
import {
  createEntity,
  createDefaultWorld,
  toEntitiesArray,
} from "../modules/entities";

describe("Testing Entity functions", () => {
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

  it("Initialized with 0 entities", () => {
    const entities = toEntitiesArray({
      callerId: world.callerId,
      entityQuery: world.entityManager.universalEntityQuery,
    });

    expect(entities.length).toBe(0);
  });

  it("Adds one entity", () => {
    createEntity({
      callerId: world.callerId,
      entityManager: world.entityManager,
    });

    const entities = toEntitiesArray({
      callerId: world.callerId,
      entityQuery: world.entityManager.universalEntityQuery,
    });

    expect(entities.length).toBe(1);
  });

  it("Test", () => {
    const entities = toEntitiesArray({
      callerId: world.callerId,
      entityQuery: world.entityManager.universalEntityQuery,
    });
    console.log(entities);
    expect(entities.length).toBe(0);
  });
});
