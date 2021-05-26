import { ArchitectureActorType } from "../../model/architecture";
import {
  AddComponentsInputProps,
  AddComponentsOutputProps,
  IComponent,
  IComponentType,
} from "../../model/components";
import {
  CreateEntityInputProps,
  Entity,
  EntityDescriptionInputProps,
  EntityDescriptionOutputProps,
  EntityManager,
  EntityQuery,
  EntityQueryBase,
} from "../../model/entities";
import { EventType } from "../../model/EventType";
import { Base64 } from "js-base64";
import { v4 as uuid } from "uuid";

export function createEntity(props: CreateEntityInputProps): Entity {
  const guid = uuid();

  const key = ArchitectureActorType.Entity + Base64.encode(guid);

  const universalEntityQuery = props.entityManager.universalEntityQuery;
  const currentEntities = toEntitiesArray({
    callerId: props.callerId,
    entityQuery: universalEntityQuery,
  });

  const newEntity = {
    _guid: guid,
    components: props.components ? props.components : [],
  };
  const newEntities = [...currentEntities, newEntity];

  setEntitiesArray({
    callerId: props.callerId,
    entityQuery: universalEntityQuery,
    entities: newEntities,
  });
  props.entityManager.entityManagerService.send({
    type: EventType.ENTITY_CREATED,
    callerId: props.callerId,
    entity: newEntity,
  });

  return { _guid: guid, components: props.components ?? [] };
}

export const EntityDescription = (
  props: EntityDescriptionInputProps
): EntityDescriptionOutputProps => {
  return {
    type: "DESCRIPTION",
    name: props.name,
    description: props.description,
  };
};

export const toEntitiesArray = (props: {
  callerId: string;
  entityQuery: EntityQueryBase;
}): Entity[] => {
  //props.entityQuery.service.send({ type: EventType.READ_PROBLEM_SPACE_QUERY });
  //
  if (
    props.entityQuery.queryService.machine.key ===
    ArchitectureActorType.UniversalEntityQuery
  ) {
    return props.entityQuery.queryService.state.context.entities;
  }
  props.entityQuery.queryService.send({
    type: EventType.READ_QUERY_SYNC,
    callerId: props.callerId,
  });
  return props.entityQuery.queryService.state.context.entities;
};

export const setEntitiesArray = (props: {
  callerId: string;
  entityQuery: EntityQueryBase;
  entities: Entity[];
}): void => {
  const a1 = props.entityQuery.queryService.state.context.entities;
  const a2 = props.entities;

  // compare existing entities with new entities
  const entitiesChanged = !(JSON.stringify(a1) === JSON.stringify(a2));
  if (entitiesChanged) {
    props.entityQuery.queryService.send({
      type: EventType.WRITE_QUERY_SYNC,
      callerId: props.callerId,
      entities: props.entities,
    });
  }

  // props.entityQuery.service.onTransition((_context, event) => {
  //   log.info('Set entities due to ' + event.type + ' array to ' + JSON.stringify(props.entities) + ' in query state ' + props.entityQuery.service.state.value);
  //   props.entityQuery.service.send({ type: EventType.WRITE_SOLUTION_SPACE_QUERY, callerId: 'setEntitiesArray', entities: props.entities });
  //   //}
  // })

  //
};

export function addComponentsToEntity(props: {
  callerId: string;
  entityManager: EntityManager;
  entity: Entity;
  components: IComponent[];
}) {
  const newEntities = addComponentsToEntities({
    entities: [props.entity],
    components: props.components,
  }).entities;
  setEntitiesArray({
    callerId: props.callerId,
    entityQuery: props.entityManager.universalEntityQuery,
    entities: newEntities,
  });
}

export function addComponentsToEntitiesByQuery(props: {
  callerId: string;
  entityQuery: EntityQuery;
  components: IComponent[];
}) {
  const newEntities = addComponentsToEntities({
    entities: toEntitiesArray({
      callerId: props.callerId,
      entityQuery: props.entityQuery,
    }),
    components: props.components,
  }).entities;
  setEntitiesArray({
    callerId: props.callerId,
    entityQuery: props.entityQuery,
    entities: newEntities,
  });
}

export function addComponentsToEntities(
  props: AddComponentsInputProps
): AddComponentsOutputProps {
  const currentEntities = props.entities;

  const newEntities = [...currentEntities];

  currentEntities.forEach((currentEntity) => {
    const currentComponents = currentEntity.components;
    const newComponents = [...currentComponents, ...props.components];

    newEntities.forEach((newEntity: Entity, index) => {
      if (newEntity._guid === currentEntity._guid) {
        newEntities[index] = {
          _guid: currentEntity._guid,
          components: newComponents,
        };
      }
    });
  });

  return {
    entities: newEntities,
    components: props.components,
  };
}
