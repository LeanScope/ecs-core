import '../api/logger'
import { log } from '../api/logger'

export interface IBaseEntity {

}

export interface IEntity extends IBaseEntity {

}
// compare https://docs.unity3d.com/Packages/com.unity.entities@0.1/manual/ecs_entities.html
export class Entity implements IEntity {
    
    static readonly __sharedTypename = 'Entity';
    static POINTER: any;
    public constructor(public readonly _guid: string, public readonly __typename = Entity.__sharedTypename) {
        log.info('Constructing entity ' + _guid)

    }
}
