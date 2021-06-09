export enum StateName {
  idle = "idle",
  initializing = "initializing",
  notifying = "notifying",
  updating = "updating",
  persisting = "persisting",
  filtering = "filtering",
  updatingProblemSpace = "updatingProblemSpace",
  fetchingProblemSpaceEntities = "fetchingProblemSpaceEntities",
  fetchingSolutionSpaceEntities = "fetchingSolutionSpaceEntities",
  running = "running",
  persistingDuringFetching = "persistingDuringFetching",
}
