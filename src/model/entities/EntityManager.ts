import { ApolloClient, NormalizedCacheObject } from "@apollo/client";
import { Interpreter } from "xstate";
import { FunctionInputProps } from "../FunctionInputProps";
import { WorldCreationProps } from "./world";
import { EventType } from "../EventType";
import { Entity, UniversalEntityQuery } from ".";
import { SystemContext, SystemEvent } from "../systems";

export interface EntityManager {
  apolloClient: ApolloClient<NormalizedCacheObject>;
  universalEntityQuery: UniversalEntityQuery;
  world: WorldCreationProps;
  entityManagerService: Interpreter<
    EntityManagerContext,
    any,
    EntityManagerEvent
  >;
}

export interface CreateEntityManagerInputProps extends FunctionInputProps {
  world: WorldCreationProps;
  systemsService: Interpreter<SystemContext, any, SystemEvent>;
}

// The events that the machine handles
export type EntityManagerEvent =
  | { type: EventType.ENTITIES_READ; callerId?: string }
  | { type: EventType.ENTITIES_CHANGED; callerId?: string }
  | { type: EventType.ENTITIES_WRITTEN; callerId?: string }
  | { type: EventType.ENTITY_CREATED; callerId?: string; entity: Entity }
  | { type: EventType.COMPONENT_ADDED; callerId?: string }
  | { type: EventType.COMPONENT_CHANGED; callerId?: string };

// The context (extended state) of the machine
export interface EntityManagerContext {}
