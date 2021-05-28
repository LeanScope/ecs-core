import { Entity } from "../../model/entities";
import { World } from "../../model/entities/world";
import { createEntity } from "../../modules/entities";
import { Test_1, Test_2, Test_3, Test_4 } from "../components/TestComponents";

export function createEntityComponentsExample(world: World): Entity[] {
  const entities: Entity[] = [];
  entities.push(
    createEntity({
      entityManager: world.entityManager,
      callerId: world.callerId,
      components: [
        Test_1({ testString: "Test 1", testNumber: 1, testBoolean: true }),
        { type: "A" },
      ],
    })
  );

  entities.push(
    createEntity({
      entityManager: world.entityManager,
      callerId: world.callerId,
      components: [
        Test_2({ testString: "Test 2", testNumber: 2, testBoolean: false }),
        { type: "A" },
      ],
    })
  );

  entities.push(
    createEntity({
      entityManager: world.entityManager,
      callerId: world.callerId,
      components: [
        Test_2({ testString: "Test 2", testNumber: 2, testBoolean: true }),
        { type: "B" },
      ],
    })
  );

  entities.push(
    createEntity({
      entityManager: world.entityManager,
      callerId: world.callerId,
      components: [
        Test_3({ testString: "Test 3", testNumber: 3, testBoolean: true }),
        { type: "A" },
      ],
    })
  );

  entities.push(
    createEntity({
      entityManager: world.entityManager,
      callerId: world.callerId,
      components: [
        Test_3({ testString: "Test 3", testNumber: 3, testBoolean: true }),
        { type: "B" },
        { type: "B" },
      ],
    })
  );

  entities.push(
    createEntity({
      entityManager: world.entityManager,
      callerId: world.callerId,
      components: [
        Test_3({ testString: "Test 3", testNumber: 3, testBoolean: true }),
        { type: "A" },
        { type: "B" },
      ],
    })
  );

  entities.push(
    createEntity({
      entityManager: world.entityManager,
      callerId: world.callerId,
      components: [
        Test_4({ testString: "Test 4", testNumber: 4, testBoolean: true }),
        { type: "A" },
        { type: "A" },
      ],
    })
  );

  entities.push(
    createEntity({
      entityManager: world.entityManager,
      callerId: world.callerId,
      components: [
        Test_4({ testString: "Test 4", testNumber: 4, testBoolean: true }),
        { type: "B" },
      ],
    })
  );

  entities.push(
    createEntity({
      entityManager: world.entityManager,
      callerId: world.callerId,
      components: [
        Test_4({ testString: "Test 4", testNumber: 4, testBoolean: true }),
        { type: "A" },
      ],
    })
  );

  entities.push(
    createEntity({
      entityManager: world.entityManager,
      callerId: world.callerId,
      components: [
        Test_4({ testString: "Test 4", testNumber: 4, testBoolean: true }),
        { type: "B" },
      ],
    })
  );

  return entities;
}
