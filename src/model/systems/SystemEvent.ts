import { EventType } from "../EventType";

export type SystemEvent =
  | { type: EventType.START_RUN_SYSTEM; callerId?: string }
  | { type: EventType.FINISH_INITIALIZING; callerId?: string }
  | { type: EventType.START_UPDATE_SYSTEM; callerId?: string }
  | { type: EventType.FINISH_UPDATE_SYSTEM; callerId?: string };
