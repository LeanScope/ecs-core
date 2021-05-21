export enum EventType {
  ENTITY_CREATED = "ENTITY_CREATED",
  COMPONENT_ADDED = "COMPONENT_ADDED",
  COMPONENT_CHANGED = "COMPONENT_CHANGED",
  READ_PROBLEM_SPACE_QUERY = "READ_PROBLEM_SPACE_QUERY",
  READ_QUERY_ASYNC = "READ_QUERY_ASYNC",
  READ_QUERY_SYNC = "READ_QUERY_SYNC",
  WRITE_QUERY_SYNC = "WRITE_QUERY_SYNC",
  ENTITIES_READ = "ENTITIES_READ",
  ENTITIES_CHANGED = "ENTITIES_CHANGED",
  ENTITIES_WRITTEN = "ENTITIES_WRITTEN",
  START_RUN_SYSTEM = "RUN_SYSTEM",
  UPDATE_SYSTEM = "UPDATE_SYSTEM",
  START_UPDATE_SYSTEM = "START_UPDATE_SYSTEM",
  FINISH_UPDATE_SYSTEM = "FINISH_UPDATE_SYSTEM",
}
