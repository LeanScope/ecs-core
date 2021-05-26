import { gql } from "@apollo/client";
import { assign, Machine } from "xstate";
import { ArchitectureActorType } from "../../model/architecture";
import {
  CreateUniversalEntityQueryInputProps,
  Entity,
  EntityQuery,
  EntityQueryContext,
  EntityQueryCreationProps,
  EntityQueryEvent,
  EntityQueryFromDescProps,
  UniversalEntityQuery,
} from "../../model/entities";
import { Equipment } from "../../model/Equipment";
import { EventType } from "../../model/EventType";
import { StateName } from "../../model/StateName";
import {
  EntityDescription,
  toEntitiesArray,
  setEntitiesArray,
} from "./Entities";
import { createStateMachineService } from "../StateMachine";
import { allowedNodeEnvironmentFlags } from "process";
import { Component } from "react";

export function getEntityQueryFromDesc(
  props: EntityQueryFromDescProps
): EntityQuery {
  return createEntityQuery({
    callerId: props.callerId,
    queryDesc: props.queryDesc,
    universalEntityQuery: props.entityManager.universalEntityQuery,
  });
}

export function createUniversalEntityQuery(
  props: CreateUniversalEntityQueryInputProps
): UniversalEntityQuery {
  const key = ArchitectureActorType.UniversalEntityQuery;

  const fetchProblemSpaceEntities = (
    _context: EntityQueryContext,
    event: EntityQueryEvent
  ) =>
    new Promise((resolve, _reject) => {
      props.apolloClient
        .query({
          query: gql(props.problemSpaceQueryString),
        })
        .then((response) => {
          const data = response.data;
          // todo: beat anne
          const equipments: Equipment[] = data.uxmData.equipments;
          let entities: Entity[] = [];
          for (let equipment of equipments) {
            const entity = {
              _guid: equipment._guid,
              components: [
                EntityDescription({
                  name: equipment.line,
                  description: equipment.description,
                }),
              ],
            };
            entities.push(entity);
          }
          return resolve({
            callerId: event.callerId,
            entities: entities,
          });
        });
    });

  const fetchSolutionSpaceEntities = (
    _context: EntityQueryContext,
    event: EntityQueryEvent
  ) =>
    new Promise((resolve, _reject) => {
      const data = props.apolloClient.readQuery({
        query: gql(props.solutionSpaceQueryString),
      });
      const entities = data ? (data.entities as Entity[]) : [];
      return resolve({
        callerId: event.callerId,
        entites: entities,
      });
    });

  const machine = Machine<EntityQueryContext, any, EntityQueryEvent>({
    key: key,
    initial: StateName.idle,
    context: {
      entities: [],
    },
    states: {
      idle: {
        on: {
          [EventType.READ_QUERY_ASYNC]: {
            target: StateName.fetchingSolutionSpaceEntities,
          },
          [EventType.WRITE_QUERY_SYNC]: {
            target: StateName.idle,
            actions: [
              assign({
                entities: (_context, event) => {
                  props.apolloClient.writeQuery({
                    query: gql(props.solutionSpaceQueryString),
                    data: {
                      entities: event.entities,
                    },
                  });
                  /* console.info(
                    "Writing entities of universal query: " +
                      JSON.stringify(event.entities)
                  ); */
                  return event.entities;
                },
              }),
              () => {
                props.entityManagerService.send({
                  type: EventType.ENTITIES_WRITTEN,
                  callerId: key,
                });
              },
            ],
          },
        },
      },
      fetchingSolutionSpaceEntities: {
        invoke: {
          id: "fetchingSolutionSpaceEntities",
          src: fetchSolutionSpaceEntities,
          onError: {
            target: StateName.idle,
          },
          onDone: {
            target: StateName.idle,
            actions: [
              (_context, event) => {
                console.info(
                  "Async response from " +
                    ArchitectureActorType.UniversalEntityQuery
                );
              },
              assign({
                entities: (context, _event) => {
                  console.info("Response from fetching solution entities");
                  return context.entities;
                },
              }),
              () =>
                props.entityManagerService.send({
                  type: EventType.ENTITIES_READ,
                  callerId: key,
                }),
            ],
          },
        },
      },
      fetchingProblemSpaceEntities: {
        invoke: {
          id: "fetchProblemSpaceEntities",
          src: fetchProblemSpaceEntities,
          onError: {
            target: StateName.idle,
          },
          onDone: {
            target: StateName.idle,
            actions: [
              assign({
                entities: (context, event) => {
                  console.info("Response from fetching problem entities");
                  const currentEntities = context.entities;
                  const mergedEntities = [
                    ...event.data.entities,
                    currentEntities,
                  ];
                  return mergedEntities;
                },
              }),
              () =>
                props.entityManagerService.send({
                  type: EventType.ENTITIES_READ,
                  callerId: key,
                }),
            ],
          },
        },
      },
    },
  });

  const queryService = createStateMachineService(machine);
  return {
    callerId: props.callerId,
    apolloClient: props.apolloClient,
    entityManagerService: props.entityManagerService,
    problemSpaceQueryString: props.problemSpaceQueryString,
    solutionSpaceQueryString: props.solutionSpaceQueryString,
    queryService: queryService,
  };
}

function createEntityQuery(props: EntityQueryCreationProps): EntityQuery {
  const key = ArchitectureActorType.EntityQuery;

  function getFilteredEntities(): Entity[] {
    const entities = toEntitiesArray({
      callerId: props.callerId,
      entityQuery: props.universalEntityQuery,
    });

    const filteredEntities: typeof entities = [];
    for (let entity of entities) {
      let isAllFulfilled =
        props.queryDesc.all === undefined || props.queryDesc.all.length === 0;
      let isAnyFulfilled =
        props.queryDesc.any === undefined || props.queryDesc.any.length === 0;
      let isNoneFulfilled = true;

      const queryDescAllClone = props.queryDesc.all
        ? [...props.queryDesc.all]
        : undefined;

      for (let component of entity.components) {
        if (queryDescAllClone) {
          for (let i = 0; i < queryDescAllClone.length; i++) {
            if (queryDescAllClone[i].type === component.type) {
              queryDescAllClone.splice(i, 1);
              isAllFulfilled = queryDescAllClone.length === 0;
              break;
            }
          }
        }

        if (props.queryDesc.any && !isAnyFulfilled) {
          for (let anyDesc of props.queryDesc.any) {
            if (anyDesc.type === component.type) {
              isAnyFulfilled = true;
              break;
            }
          }
        }

        if (props.queryDesc.none && isNoneFulfilled) {
          for (let noneDesc of props.queryDesc.none) {
            if (noneDesc.type === component.type) {
              isNoneFulfilled = false;
              break;
            }
          }
          if (isNoneFulfilled === false) break;
        }
      }

      if (isAllFulfilled && isAnyFulfilled && isNoneFulfilled) {
        filteredEntities.push(entity);
      }
    }
    return filteredEntities;
  }

  const machine = Machine<EntityQueryContext, any, EntityQueryEvent>({
    key: key,
    initial: StateName.idle,
    context: {
      entities: [],
    },
    states: {
      idle: {
        on: {
          [EventType.READ_QUERY_SYNC]: {
            target: "updating",
            actions: [
              assign({
                entities: (_context, _event) => {
                  return getFilteredEntities();
                },
              }),
            ],
          },
          [EventType.WRITE_QUERY_SYNC]: {
            target: "updating",
            actions: [
              assign({
                entities: (_context, event) => {
                  const allEntities = toEntitiesArray({
                    callerId: props.callerId,
                    entityQuery: props.universalEntityQuery,
                  });
                  const mergedEntities: typeof allEntities = [];
                  for (let existingEntity of allEntities) {
                    const newEntity = event.entities.find(
                      (newEntity) => newEntity._guid === existingEntity._guid
                    );
                    if (newEntity) {
                      mergedEntities.push(newEntity);
                    } else {
                      mergedEntities.push(existingEntity);
                    }
                  }
                  setEntitiesArray({
                    callerId: event.callerId,
                    entityQuery: props.universalEntityQuery,
                    entities: mergedEntities,
                  });

                  console.info(
                    "Entities of custom query: " +
                      JSON.stringify(event.entities)
                  );
                  return event.entities;
                },
              }),
            ],
          },
        },
      },
      updating: {
        always: {
          target: StateName.idle,
        },
      },
    },
  });

  const queryService = createStateMachineService(machine);

  return {
    callerId: props.callerId,
    queryService: queryService,
    queryDesc: props.queryDesc,
    universalEntityQuery: props.universalEntityQuery,
  };
}