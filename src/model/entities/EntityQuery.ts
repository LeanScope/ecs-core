import { Interpreter } from "xstate";
import { EntityManager } from ".";
import { IComponentType } from "../components";
import { Entity } from "./Entity";
import { EventType } from "../EventType";
import { FunctionInputProps } from "../FunctionInputProps";
import { UniversalEntityQuery } from "./UniversalEntityQuery";

export interface EntityQuery
  extends EntityQueryCreationProps,
    EntityQueryBase {}

export type EntityQueryEvent =
  | { type: EventType.READ_QUERY_ASYNC; callerId?: string }
  | { type: EventType.READ_QUERY_SYNC; callerId?: string }
  | { type: EventType.ENTITIES_PERSISTED; callerId?: string }
  | {
      type: EventType.WRITE_QUERY_SYNC;
      callerId?: string;
      entities: Entity[];
      sender?: EntityQuery;
    };

export interface EntityQueryContext {
  entities: Entity[];
}

export interface EntityQueryDesc {
  all?: IComponentType[];
  any?: IComponentType[];
  none?: IComponentType[];
}

export interface EntityQueryBase {
  queryService: Interpreter<EntityQueryContext, any, EntityQueryEvent>;
}

export interface EntityQueryCreationProps extends FunctionInputProps {
  queryDesc: EntityQueryDesc;
  universalEntityQuery: UniversalEntityQuery;
}

export interface EntityQueryFromDescProps extends FunctionInputProps {
  entityManager: EntityManager;
  queryDesc: EntityQueryDesc;
}
