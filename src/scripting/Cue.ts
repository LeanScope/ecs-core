import { IEntity } from '../core/Entity'

export interface Cue extends IEntity {
    _guid: string;
    name: string;
    timestamp: number;
    receiverGuid: string;
    payload?: string;
  }