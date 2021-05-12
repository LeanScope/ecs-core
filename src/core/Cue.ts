
import { IEntity } from './Entity'

export interface Cue extends IEntity {
    _guid: string;
    name: string;
    timestamp: number;
    payload?: string;
  }