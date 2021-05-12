import { ApolloClient, NormalizedCacheObject } from "@apollo/client";

import { EntityManager } from './EntityManager';
import { World } from './World';
import { EntityQuery } from './EntityQuery'


export class ComponentSystemBase {
    public constructor(
        // the EntityManager object of the World in which this system exists.
        public readonly entityManager: EntityManager,
        public readonly world: World,
    ) {

    }
}

export type EntityQueryClient = ApolloClient<NormalizedCacheObject>;

// compare https://docs.unity3d.com/Packages/com.unity.entities@0.1/manual/component_system.html?q=entity%20component%20system
export class ComponentSystem extends ComponentSystemBase {
    public constructor(
        // the EntityManager object of the World in which this system exists.
        public readonly entityManager: EntityManager,
        public readonly world: World
    ) {
        super(entityManager, world)
    }

    public getEntityQuery(componentType: string) {
        const query = new EntityQuery(this.entityManager.apolloClient);
        return query;
    }
}