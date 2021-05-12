import { Cue } from './Cue'
import { IEntity } from './Entity'

export interface Script extends IEntity {
    name: string;
    cues: Cue[];
}