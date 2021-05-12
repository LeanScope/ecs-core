import { EntityManager } from './EntityManager'
import { ComponentSystem } from './ComponentSystem'
import { Space } from './Space'


// compare https://docs.unity3d.com/Packages/com.unity.entities@0.1/api/Unity.Entities.World.html
export class World {
    private static _activeWorld?: World;
    private static _allWorlds: Array<World>

    private _entityManager?: EntityManager;
    private _componentSystem?: ComponentSystem;

    public constructor(public readonly name: string, public readonly space: Space) {

    }

    public static setActive(activeWorld: World) {
        if (!this._allWorlds) {
            this._allWorlds = new Array<World>();
        }
        if (activeWorld?.name === this.getActive()?.name) {
            return;
        }
        if (!this._allWorlds.find((world) => activeWorld.name === world.name)) {
            this._activeWorld = activeWorld;
            return;
        }
    }

    public static getActive() {
        return this._activeWorld;
    }

    public getOrCreateComponentSystem() {
        if (this._componentSystem === undefined) {
            this._componentSystem = new ComponentSystem(this.getOrCreateEntityManager(), this)
        }
        return this._componentSystem;
    }

    public getOrCreateEntityManager() {
        if (this._entityManager === undefined) {
            this._entityManager = new EntityManager(this);
            this._componentSystem = this.getOrCreateComponentSystem();
        }
        return this._entityManager;
    }
}
