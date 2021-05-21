import { v4 as uuid } from "uuid";
import { ArchitectureActorType } from "../model/architecture";
import { World } from "../model/entities";
import {
  createEntity,
  getOrCreateDefaultWorld,
  toEntitiesArray,
} from "../modules/entities";

describe("Test System functions", () => {
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

  it("", () => {});
});
