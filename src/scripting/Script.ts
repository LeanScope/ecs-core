import { Cue } from "./Cue";
import { IEntity } from '../core/Entity'

export interface Script extends IEntity {
    name: string;
    cues: Cue[];
  }