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

  it("Should initialize world with 0 Entities", () => {
    const entities = toEntitiesArray({
      callerId: world.callerId,
      entityQuery: world.entityManager.universalEntityQuery,
    });

    expect(entities.length).toBe(0);
  });

  it("Should add one Entity", () => {
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
});
