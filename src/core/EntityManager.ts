import { ApolloClient, InMemoryCache, makeVar } from "@apollo/client";
import { v4 as uuid } from "uuid";
import { authLink, link } from "../api/graph-ql.client";
import { ComponentType, DataComponent } from "./Component";
import { EntityQueryClient } from "./ComponentSystem";
import { Entity, IBaseEntity } from "./Entity";
import { EntityQuery, UniversalEntityQuery } from "./EntityQuery";
import { World } from "./World";

// compare https://docs.unity3d.com/Packages/com.unity.entities@0.1/api/Unity.Entities.EntityManager.html
export class EntityManager {
  public readonly apolloClient: EntityQueryClient;
  public readonly universalQuery: UniversalEntityQuery;

  private _entitiesVar = makeVar<IBaseEntity>([]);
  private _componentsVar = makeVar<ComponentType>([]);

  protected createApolloClient() {
    let _this = this;

    const cache = new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            entities: {
              read() {
                const result = _this._entitiesVar();
                return result;
              },
            },
          },
        },
        Entity: {
          fields: {
            components: {
              read() {
                const result = _this._componentsVar();
                return result;
              },
            },
          },
        },
      },
    });

    return new ApolloClient({
      link: authLink.concat(link),
      cache: cache,
    });
  }

  public constructor(public readonly world: World) {
    this.createApolloClient();

    this.apolloClient = this.createApolloClient();
    this.universalQuery = new UniversalEntityQuery(this.apolloClient);
  }

  public createEntity(guid: string = uuid()) {
    const allEntities = this.universalQuery.toEntityArray();
    const newEntity = new Entity(guid);
    const entities = [...allEntities, newEntity];

    this._entitiesVar(entities);

    return newEntity;
  }

  public createEntityQuery<T extends ComponentType>(types: T[]) {
    // const entityQuery = new EntityQuery(this.apolloClient, types);
  }

  public addComponent<T extends DataComponent>(
    entity: Entity,
    componentData: T
  ) {
    const allEntities = this.universalQuery.toEntityArray();
    if (!allEntities.find((e: Entity) => e._guid === entity._guid)) {
      console.warn(`
                The entity ${
                  entity._guid
                } is not managed by this entity manager.
                Component ${JSON.stringify(componentData)} not added.
            `);
      return;
    }

    const allComponentsOfEntity = this.universalQuery.toComponentDataArray(
      componentData.type
    );
    const components = [...allComponentsOfEntity, componentData];

    this._componentsVar(components);
  }

  public addComponentDataWithQuery<T>(
    entityQuery: EntityQuery,
    componentData: T
  ) {
    console.info("Adding component " + JSON.stringify(componentData));

    //const data = entityQuery.read();

    //entityQuery.write([...data.entities, componentData]);

    //entityQuery.run();
  }
}
