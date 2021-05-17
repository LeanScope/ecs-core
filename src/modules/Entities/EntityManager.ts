import { ApolloClient, InMemoryCache } from "@apollo/client";
import { Machine } from "xstate";
import { ArchitectureActorType } from "../../model/architecture";
import {
  CreateEntityManagerInputProps,
  EntityManager,
  EntityManagerContext,
  EntityManagerEvent,
} from "../../model/entities";
import { EventType } from "../../model/EventType";
import { StateName } from "../../model/StateName";
import { authLink, link } from "../../api/graph-ql.client";
import { createStateMachineService } from "../StateMachine";
import { createUniversalEntityQuery } from "../Entities/EntityQueries";

export function createEntityManager(
  props: CreateEntityManagerInputProps
): EntityManager {
  const key = ArchitectureActorType.EntityManager;

  const cache = new InMemoryCache();

  const apolloClient = new ApolloClient({
    link: authLink.concat(link),
    cache: cache,
  });

  const machine = Machine<EntityManagerContext, any, EntityManagerEvent>({
    key: key,
    initial: StateName.idle,
    states: {
      idle: {
        on: {
          ENTITIES_WRITTEN: {
            target: StateName.updating,
            actions: [
              (context, event) => {
                console.info("entities written");
              },
              (context, event) => {
                props.systemsService.send({
                  type: EventType.START_UPDATE_SYSTEM,
                  callerId: key,
                });
              },
            ],
          },

          ENTITIES_READ: {
            target: StateName.idle,
            actions: [
              (context, event) => {
                console.info("Read entities message from " + event.callerId);
              },
              (context, event) => {
                console.info("entities read");
              },
              (context, event) => {
                console.info(
                  "Sending update system message through world service"
                );
                props.systemsService.send({
                  type: EventType.START_UPDATE_SYSTEM,
                  callerId: key,
                });
              },
            ],
          },

          ENTITIES_CHANGED: {
            target: StateName.updating,
            actions: [
              (context, event) => {
                console.info(
                  "Adding entities changed message from " +
                    ArchitectureActorType.ComponentSystemGroup
                );
              },
              (context, event) => {
                console.info("entities changed");
              },
              (context, event) => {
                console.info(
                  "Sending update system message through world service"
                );
                props.systemsService.send({
                  type: EventType.START_UPDATE_SYSTEM,
                  callerId: key,
                });
              },
            ],
          },

          COMPONENT_CHANGED: {
            target: StateName.updating,
            actions: [
              (context, event) => {
                console.info("changed component of entity");
              },
            ],
          },
        },
      },
      created: {
        always: {
          target: StateName.idle,
        },
      },
      added: {
        always: {
          target: StateName.idle,
        },
      },
      updating: {
        on: {
          ENTITY_CREATED: {
            target: StateName.idle,
            actions: [
              (context, event) => {
                console.info("created entity");
              },
              //(context, event) => props.systemsService.send({ type: EventType.FINISH_UPDATE_SYSTEM, callerId: key })
            ],
          },
          COMPONENT_ADDED: {
            target: StateName.idle,
            actions: [
              (context, event) => {
                console.info("added component entity");
              },
              //(context, event) => props.systemsService.send({ type: EventType.FINISH_UPDATE_SYSTEM, callerId: key })
            ],
          },
        },
      },
    },
  });

  const service = createStateMachineService(machine);

  const universalEntityQuery = createUniversalEntityQuery({
    callerId: props.callerId,
    apolloClient: apolloClient,
    entityManagerService: service,
    problemSpaceQueryString: `
          query ALL_PROBLEM_ENTITIES {
            uxmData(repositoryId: ${props.world.problemSpace.gitLabProjectId}) {
              equipments {
                _guid,
                line,
                description
              }
            }
          } 
        `,
    solutionSpaceQueryString: `
            query ALL_SOLUTION_ENTITIES {
                entities @client
            }
          `,
  });

  return {
    apolloClient: apolloClient,
    world: props.world,
    universalEntityQuery: universalEntityQuery,
    entityManagerService: service,
  };
}
