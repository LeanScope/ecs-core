import {
  IComponent,
  SetComponentDataInputProps,
  SetComponentDataOutputProps,
  IComponentType,
} from "../../model/components";
import { Entity } from "../../model/entities";
import { EventType } from "../../model/EventType";
import { toEntitiesArray, setEntitiesArray } from "../entities";

export function setComponentData<T extends IComponentType>(
  props: SetComponentDataInputProps
): SetComponentDataOutputProps {
  // @Todo: get rid of the array copying mechanism for the sake of performance
  /* console.info("setComponentData"); */
  const currentEntities = toEntitiesArray({
    callerId: props.callerId,
    entityQuery: props.entityManager.universalEntityQuery,
  });
  const newEntities = new Array<Entity>();
  for (let entity of currentEntities) {
    if (entity._guid === props.entity._guid) {
      const newComponents: IComponent[] = [];

      let modified = false;
      for (let component of entity.components) {
        if (component.type === props.componentData.type) {
          newComponents.push(props.componentData);
          modified = true;
        } else {
          newComponents.push(component);
        }
      }

      if (!modified) {
        newComponents.push(props.componentData);
      }
      const newEntity = Object.assign(
        {},
        { _guid: entity._guid, components: newComponents }
      );

      newEntities.push(newEntity);
      /*       console.info(
        "Setting component data to " + JSON.stringify(entity.components)
      ); */
    } else {
      newEntities.push(entity);
    }
  }

  setEntitiesArray({
    callerId: props.callerId,
    entityQuery: props.entityManager.universalEntityQuery,
    entities: newEntities,
  });

  props.entityManager.entityManagerService.send({
    type: EventType.COMPONENT_ADDED,
    callerId: props.callerId,
  });

  return {
    entity: props.entity,
  };
}

export function getComponentData<T extends IComponent>(
  entity: Entity,
  creator: () => T
): T | undefined {
  const componentData = entity.components.find((component) => {
    return component.type === creator().type;
  });
  if (componentData) {
    return componentData as T;
  }
  throw new Error(
    `Component ${creator().type} not found on Entity ${entity._guid}`
  );
}
