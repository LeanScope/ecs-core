import { v4 as uuid } from "uuid";
import { ArchitectureActorType } from "../model/architecture";
import { World } from "../model/entities";
import {
  createEntity,
  createDefaultWorld,
  toEntitiesArray,
} from "../modules/entities";

describe("Test System functions", () => {
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

  it("", () => {});
});
