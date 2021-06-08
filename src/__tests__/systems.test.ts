import { ArchitectureActorType } from "../model/architecture";
import { World } from "../model/entities";
import {
  TestComponent,
  TestComponentType_1,
  TestComponentType_2,
  TestComponentType_3,
  TestComponentType_4,
} from "./components/TestComponents";
import { createEntityComponentsExample } from "./helpers/createEntityComponentsExample";
import {
  createBasicTestSystem_1,
  createBasicTestSystem_2,
} from "./systems/BasicTestSystem";
import { createEventBasedTestSystem } from "./systems/EventBasedTestSystem";
import ecs from "../index";
import { createCreateEntitiesSystem } from "./systems/CreateEntitiesSystem";
import { getEntityQueryFromDesc } from "../modules/entities";

describe("Test System functions", () => {
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

    createEntityComponentsExample(world);
  });

  afterEach(() => {
    world = undefined;
  });

  it("Should create and initiate a custom System", () => {
    let testSystemGroup = ecs.createSystemGroup({
      callerId: world.callerId,
      systemsService: world.systemsService,
    });

    testSystemGroup = ecs.addSystemToUpdateList({
      group: testSystemGroup,
      system: ecs.createSystem({
        callerId: world.callerId,
        type: ArchitectureActorType.GenericSystem,
        entityManager: world.entityManager,
        queryDesc: {
          all: [TestComponentType_4],
        },
        onStartRunning: (_context, _event, query) => {
          const entities = ecs.toEntitiesArray({
            entityQuery: query,
          });

          for (let entity of entities) {
            for (let component of entity.components) {
              if (component.type === TestComponentType_4.type) {
                ecs.setComponentData({
                  entity: entity,
                  entityManager: world.entityManager,
                  componentData: {
                    type: component.type,
                    testString: "Custom String",
                    testNumber: 25,
                    testBoolean: true,
                  } as TestComponent,
                });
              }
            }
          }
        },
        onUpdate: (_context, _event, query) => {
          const entities = ecs.toEntitiesArray({
            entityQuery: query,
          });

          for (let entity of entities) {
            for (let component of entity.components) {
              if (component.type === TestComponentType_4.type) {
                ecs.setComponentData({
                  entity: entity,
                  entityManager: world.entityManager,
                  componentData: {
                    type: component.type,
                    testString: "Not relevant",
                    testNumber: -1,
                    testBoolean: false,
                  } as TestComponent,
                });
              }
            }
          }
        },
      }),
    });

    world.systemGroups.push(testSystemGroup);

    ecs.initSystems({ world });

    const entities = ecs.toEntitiesArray({
      callerId: world.callerId,
      entityQuery: world.entityManager.universalEntityQuery,
    });

    expect(world.systemGroups.length).toBe(1);
    expect(world.systemGroups[0].systems.length).toBe(1);
    expect(world.systemGroups[0].systems[0].type).toBe(
      ArchitectureActorType.GenericSystem
    );

    for (let entity of entities) {
      expect(entity.components.length).toBeGreaterThanOrEqual(2);
      expect(entity.components.length).toBeLessThanOrEqual(3);

      for (let component of entity.components) {
        if (component.type === TestComponentType_4.type) {
          expect((component as TestComponent).testString).toBe("Custom String");
          expect((component as TestComponent).testNumber).toBe(25);
          expect((component as TestComponent).testBoolean).toBe(true);
        }
      }
    }
  });

  it("Should update a custom System", () => {
    let testSystemGroup = ecs.createSystemGroup({
      callerId: world.callerId,
      systemsService: world.systemsService,
    });

    testSystemGroup = ecs.addSystemToUpdateList({
      group: testSystemGroup,
      system: ecs.createSystem({
        callerId: world.callerId,
        type: ArchitectureActorType.GenericSystem,
        entityManager: world.entityManager,
        queryDesc: {
          all: [TestComponentType_4],
        },
        onStartRunning: (_context, _event, query) => {
          const entities = ecs.toEntitiesArray({
            entityQuery: query,
          });

          for (let entity of entities) {
            for (let component of entity.components) {
              if (component.type === TestComponentType_4.type) {
                ecs.setComponentData({
                  entity: entity,
                  entityManager: world.entityManager,
                  componentData: {
                    type: component.type,
                    testString: "Custom String",
                    testNumber: 25,
                    testBoolean: true,
                  } as TestComponent,
                });
              }
            }
          }
        },
        onUpdate: (_context, _event, query) => {
          const entities = ecs.toEntitiesArray({
            entityQuery: query,
          });

          for (let entity of entities) {
            for (let component of entity.components) {
              if (component.type === TestComponentType_4.type) {
                ecs.setComponentData({
                  entity: entity,
                  entityManager: world.entityManager,
                  componentData: {
                    type: component.type,
                    testString: "Updated",
                    testNumber: 123,
                    testBoolean: false,
                  } as TestComponent,
                });
              }
            }
          }
        },
      }),
    });

    world.systemGroups.push(testSystemGroup);

    ecs.initSystems({ world });
    ecs.updateAllSystems({ world });

    const entities = ecs.toEntitiesArray({
      callerId: world.callerId,
      entityQuery: world.entityManager.universalEntityQuery,
    });

    expect(world.systemGroups.length).toBe(1);
    expect(world.systemGroups[0].systems.length).toBe(1);
    expect(world.systemGroups[0].systems[0].type).toBe(
      ArchitectureActorType.GenericSystem
    );

    for (let entity of entities) {
      expect(entity.components.length).toBeGreaterThanOrEqual(2);
      expect(entity.components.length).toBeLessThanOrEqual(3);

      for (let component of entity.components) {
        if (component.type === TestComponentType_4.type) {
          expect((component as TestComponent).testString).toBe("Updated");
          expect((component as TestComponent).testNumber).toBe(123);
          expect((component as TestComponent).testBoolean).toBe(false);
        }
      }
    }
  });

  it("Should initialize the BasicTestSystem", () => {
    let testSystemGroup = ecs.createSystemGroup({
      callerId: world.callerId,
      systemsService: world.systemsService,
    });

    testSystemGroup = ecs.addSystemToUpdateList({
      group: testSystemGroup,
      system: createBasicTestSystem_1({
        callerId: world.callerId,
        entityManager: world.entityManager,
      }),
    });

    world.systemGroups.push(testSystemGroup);

    ecs.initSystems({ world });

    const query = ecs.getEntityQueryFromDesc({
      callerId: world.callerId,
      entityManager: world.entityManager,
      queryDesc: {},
    });

    const entities = ecs.toEntitiesArray({
      callerId: world.callerId,
      entityQuery: query,
    });

    for (let entity of entities) {
      expect(entity.components.length).toBeGreaterThanOrEqual(2);
      expect(entity.components.length).toBeLessThanOrEqual(3);

      for (let component of entity.components) {
        if (
          component.type === TestComponentType_1.type ||
          component.type === TestComponentType_2.type
        ) {
          expect((component as TestComponent).testString).toBe("Starting");
          expect((component as TestComponent).testNumber).toBe(0);
          expect((component as TestComponent).testBoolean).toBe(false);
        } else if (component.type === TestComponentType_3.type) {
          expect((component as TestComponent).testString).toBe("Test 3");
          expect((component as TestComponent).testNumber).toBe(3);
          expect((component as TestComponent).testBoolean).toBe(true);
        } else if (component.type === TestComponentType_4.type) {
          expect((component as TestComponent).testString).toBe("Test 4");
          expect((component as TestComponent).testNumber).toBe(4);
          expect((component as TestComponent).testBoolean).toBe(true);
        }
      }
    }
  });

  it("Should execute 50 update cycles with the BasicTestSystem", () => {
    let testSystemGroup = ecs.createSystemGroup({
      callerId: world.callerId,
      systemsService: world.systemsService,
    });

    testSystemGroup = ecs.addSystemToUpdateList({
      group: testSystemGroup,
      system: createBasicTestSystem_1({
        callerId: world.callerId,
        entityManager: world.entityManager,
      }),
    });

    world.systemGroups.push(testSystemGroup);

    ecs.initSystems({ world });
    for (let i = 0; i < 50; i++) {
      ecs.updateAllSystems({ world });
    }

    const query = ecs.getEntityQueryFromDesc({
      callerId: world.callerId,
      entityManager: world.entityManager,
      queryDesc: {},
    });

    const entities = ecs.toEntitiesArray({
      callerId: world.callerId,
      entityQuery: query,
    });

    for (let entity of entities) {
      expect(entity.components.length).toBeGreaterThanOrEqual(2);
      expect(entity.components.length).toBeLessThanOrEqual(3);

      for (let component of entity.components) {
        if (
          component.type === TestComponentType_1.type ||
          component.type === TestComponentType_2.type
        ) {
          expect((component as TestComponent).testString).toBe("50");
          expect((component as TestComponent).testNumber).toBe(50);
          expect((component as TestComponent).testBoolean).toBe(true);
        } else if (component.type === TestComponentType_3.type) {
          expect((component as TestComponent).testString).toBe("Test 3");
          expect((component as TestComponent).testNumber).toBe(3);
          expect((component as TestComponent).testBoolean).toBe(true);
        } else if (component.type === TestComponentType_4.type) {
          expect((component as TestComponent).testString).toBe("Test 4");
          expect((component as TestComponent).testNumber).toBe(4);
          expect((component as TestComponent).testBoolean).toBe(true);
        }
      }
    }
  });

  it("Should init multiple systems", () => {
    let testSystemGroup = ecs.createSystemGroup({
      callerId: world.callerId,
      systemsService: world.systemsService,
    });

    testSystemGroup = ecs.addSystemToUpdateList({
      group: testSystemGroup,
      system: createBasicTestSystem_1({
        callerId: world.callerId,
        entityManager: world.entityManager,
      }),
    });

    testSystemGroup = ecs.addSystemToUpdateList({
      group: testSystemGroup,
      system: createBasicTestSystem_2({
        callerId: world.callerId,
        entityManager: world.entityManager,
      }),
    });

    world.systemGroups.push(testSystemGroup);

    ecs.initSystems({ world });

    const entities = ecs.toEntitiesArray({
      entityQuery: world.entityManager.universalEntityQuery,
    });

    for (let entity of entities) {
      for (let component of entity.components as TestComponent[]) {
        if (component.type === TestComponentType_1.type) {
          expect(component.testString).toBe("Starting");
          expect(component.testNumber).toBe(0);
          expect(component.testBoolean).toBe(false);
        }
        if (
          component.type === TestComponentType_2.type ||
          component.type === TestComponentType_3.type
        ) {
          expect(component.testString).toBe("Starting");
          expect(component.testNumber).toBe(0);
          expect(component.testBoolean).toBe(true);
        }
      }
    }
  });

  it("Should update multiple systems", () => {
    let testSystemGroup = ecs.createSystemGroup({
      callerId: world.callerId,
      systemsService: world.systemsService,
    });

    testSystemGroup = ecs.addSystemToUpdateList({
      group: testSystemGroup,
      system: createBasicTestSystem_1({
        callerId: world.callerId,
        entityManager: world.entityManager,
      }),
    });

    testSystemGroup = ecs.addSystemToUpdateList({
      group: testSystemGroup,
      system: createBasicTestSystem_2({
        callerId: world.callerId,
        entityManager: world.entityManager,
      }),
    });

    world.systemGroups.push(testSystemGroup);

    ecs.initSystems({ world });
    for (let i = 0; i < 30; i++) {
      ecs.updateAllSystems({ world });
    }

    const entities = ecs.toEntitiesArray({
      entityQuery: world.entityManager.universalEntityQuery,
    });

    for (let entity of entities) {
      for (let component of entity.components as TestComponent[]) {
        if (component.type === TestComponentType_1.type) {
          expect(component.testString).toBe("30");
          expect(component.testNumber).toBe(30);
          expect(component.testBoolean).toBe(true);
        } else if (component.type === TestComponentType_2.type) {
          expect(component.testString).toBe("0");
          expect(component.testNumber).toBe(0);
          expect(component.testBoolean).toBe(false);
        } else if (component.type === TestComponentType_3.type) {
          expect(component.testString).toBe("-30");
          expect(component.testNumber).toBe(-30);
          expect(component.testBoolean).toBe(false);
        }
      }
    }
  });

  it("Should init multiple system groups", () => {
    let testSystemGroup_1 = ecs.createSystemGroup({
      callerId: world.callerId,
      systemsService: world.systemsService,
    });

    let testSystemGroup_2 = ecs.createSystemGroup({
      callerId: world.callerId,
      systemsService: world.systemsService,
    });

    testSystemGroup_1 = ecs.addSystemToUpdateList({
      group: testSystemGroup_1,
      system: createBasicTestSystem_1({
        callerId: world.callerId,
        entityManager: world.entityManager,
      }),
    });

    testSystemGroup_2 = ecs.addSystemToUpdateList({
      group: testSystemGroup_2,
      system: createBasicTestSystem_2({
        callerId: world.callerId,
        entityManager: world.entityManager,
      }),
    });

    world.systemGroups.push(testSystemGroup_1);
    world.systemGroups.push(testSystemGroup_2);

    ecs.initSystems({ world });

    const entities = ecs.toEntitiesArray({
      entityQuery: world.entityManager.universalEntityQuery,
    });

    for (let entity of entities) {
      for (let component of entity.components as TestComponent[]) {
        if (component.type === TestComponentType_1.type) {
          expect(component.testString).toBe("Starting");
          expect(component.testNumber).toBe(0);
          expect(component.testBoolean).toBe(false);
        }
        if (
          component.type === TestComponentType_2.type ||
          component.type === TestComponentType_3.type
        ) {
          expect(component.testString).toBe("Starting");
          expect(component.testNumber).toBe(0);
          expect(component.testBoolean).toBe(true);
        }
      }
    }
  });

  it("Should update multiple system groups", () => {
    let testSystemGroup = ecs.createSystemGroup({
      callerId: world.callerId,
      systemsService: world.systemsService,
    });

    testSystemGroup = ecs.addSystemToUpdateList({
      group: testSystemGroup,
      system: createBasicTestSystem_1({
        callerId: world.callerId,
        entityManager: world.entityManager,
      }),
    });

    testSystemGroup = ecs.addSystemToUpdateList({
      group: testSystemGroup,
      system: createBasicTestSystem_2({
        callerId: world.callerId,
        entityManager: world.entityManager,
      }),
    });

    world.systemGroups.push(testSystemGroup);

    ecs.initSystems({ world });
    for (let i = 0; i < 30; i++) {
      ecs.updateAllSystems({ world });
    }

    const entities = ecs.toEntitiesArray({
      entityQuery: world.entityManager.universalEntityQuery,
    });

    for (let entity of entities) {
      for (let component of entity.components as TestComponent[]) {
        if (component.type === TestComponentType_1.type) {
          expect(component.testString).toBe("30");
          expect(component.testNumber).toBe(30);
          expect(component.testBoolean).toBe(true);
        } else if (component.type === TestComponentType_2.type) {
          expect(component.testString).toBe("0");
          expect(component.testNumber).toBe(0);
          expect(component.testBoolean).toBe(false);
        } else if (component.type === TestComponentType_3.type) {
          expect(component.testString).toBe("-30");
          expect(component.testNumber).toBe(-30);
          expect(component.testBoolean).toBe(false);
        }
      }
    }
  });

  it("EventBasedSystem should update based on 'events'", (done) => {
    let testSystemGroup = ecs.createSystemGroup({
      callerId: world.callerId,
      systemsService: world.systemsService,
    });

    testSystemGroup = ecs.addSystemToUpdateList({
      group: testSystemGroup,
      system: createEventBasedTestSystem({
        callerId: world.callerId,
        entityManager: world.entityManager,
      }),
    });

    world.systemGroups.push(testSystemGroup);

    ecs.initSystems({ world });

    setTimeout(() => {
      const query = ecs.getEntityQueryFromDesc({
        callerId: world.callerId,
        entityManager: world.entityManager,
        queryDesc: { all: [TestComponentType_4] },
      });

      const entities = ecs.toEntitiesArray({
        callerId: world.callerId,
        entityQuery: query,
      });

      for (let entity of entities) {
        const component = entity.components.find((component) => {
          return component.type === TestComponentType_4.type;
        }) as TestComponent;

        expect(component.testString).toBe("304");
        expect(component.testNumber).toBe(304);
        expect(component.testBoolean).toBe(true);
        done();
      }
    }, 500);
  });

  it("Should add entities at initalization of system", () => {
    let testSystemGroup = ecs.createSystemGroup({
      callerId: world.callerId,
      systemsService: world.systemsService,
    });

    testSystemGroup = ecs.addSystemToUpdateList({
      group: testSystemGroup,
      system: createCreateEntitiesSystem({
        callerId: world.callerId,
        entityManager: world.entityManager,
      }),
    });

    world.systemGroups.push(testSystemGroup);

    ecs.initSystems({ world });

    const query = getEntityQueryFromDesc({
      entityManager: world.entityManager,
      queryDesc: { all: [{ type: "InitEntityComponent" }] },
    });

    const entities = ecs.toEntitiesArray({
      entityQuery: query,
    });

    expect(entities.length).toBe(1);
    expect(entities[0].components.length).toBe(1);
    expect(entities[0].components[0].type).toBe("InitEntityComponent");
  });

  it("Should add entities with each update", () => {
    let testSystemGroup = ecs.createSystemGroup({
      callerId: world.callerId,
      systemsService: world.systemsService,
    });

    testSystemGroup = ecs.addSystemToUpdateList({
      group: testSystemGroup,
      system: createCreateEntitiesSystem({
        callerId: world.callerId,
        entityManager: world.entityManager,
      }),
    });

    world.systemGroups.push(testSystemGroup);

    ecs.initSystems({ world });
    for (let i = 0; i < 25; i++) {
      ecs.updateAllSystems({ world });
    }

    const query = getEntityQueryFromDesc({
      entityManager: world.entityManager,
      queryDesc: { all: [{ type: "UpdateEntityComponent" }] },
    });

    const entities = ecs.toEntitiesArray({
      entityQuery: query,
    });

    expect(entities.length).toBe(25);
    for (let entity of entities) {
      expect(entity.components.length).toBe(1);
      expect(entity.components[0].type).toBe("UpdateEntityComponent");
    }
  });
});
