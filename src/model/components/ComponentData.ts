import { IComponentType, IComponent } from ".";
import { Entity, EntityManager } from "../entities";
import { FunctionInputProps } from "../FunctionInputProps";

export interface SetComponentDataInputProps extends FunctionInputProps {
  entityManager: EntityManager;
  entity: Entity;
  componentData: IComponent;
}

export interface SetComponentDataOutputProps {
  entity: Entity;
}
