import { gql, makeVar } from "@apollo/client";
import { EntityQueryClient } from "./ComponentSystem";
import { DataComponent } from "./Component";
import { IBaseEntity } from "./Entity";
import { ComponentType } from "../api/components";

export const NoDataComponent = {
  type: ComponentType.ALL
}

// compare https://docs.unity3d.com/Packages/com.unity.entities@0.0/api/Unity.Entities.EntityManager.html
export class UniversalEntityQuery {
  constructor(public readonly apolloClientRef: EntityQueryClient) {

  }

  public toEntityArray() {
    const data = this.apolloClientRef.readQuery({
      query: gql(`
        query ALL_ENTITIES {
            entities @client
        }
      `)
    })
    return data.entities;
  }

  public toComponentDataArray<T extends ComponentType>(type: T) {
    const data = this.apolloClientRef.readQuery({
      query: gql(`
        query ALL_COMPONENTS {
            entities @client {
              components @client
            }
        }
      `)
    })

    let components: DataComponent<T>[] = [];
    data.entities.forEach((e: any) => {
      e.components.forEach((c: any) => {
        if (type === ComponentType.ALL || type === c.type) {
          components.push(c)
        }
      })
    })
    return components;
  }
}

export class EntityQuery extends UniversalEntityQuery {
  private _entities = makeVar<IBaseEntity>([]);
  
  // private _componentsMap = new Map([
  //   ['None', makeVar<ComponentType>([])]
  // ]);

  constructor(public readonly apolloClientRef: EntityQueryClient, public readonly types: ComponentType[] = []) {
    super(apolloClientRef);
  }
}