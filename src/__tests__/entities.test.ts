import { ArchitectureActorType } from "../model/architecture";
import { World } from "../model/entities";
import ecs from "../index";

describe("Testing Entity functions", () => {
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

  it("Should initialize world with 0 Entities", () => {
    const entities = ecs.toEntitiesArray({
      callerId: world.callerId,
      entityQuery: world.entityManager.universalEntityQuery,
    });

    expect(entities.length).toBe(0);
  });

  it("Should add one Entity", () => {
    ecs.createEntity({
      callerId: world.callerId,
      entityManager: world.entityManager,
    });

    const entities = ecs.toEntitiesArray({
      callerId: world.callerId,
      entityQuery: world.entityManager.universalEntityQuery,
    });

    expect(entities.length).toBe(1);
  });
});
