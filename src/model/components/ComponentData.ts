import { ComponentType } from ".";
import { Entity, EntityManager } from "../entities";
import { FunctionInputProps } from "../FunctionInputProps";
import { IComponent } from "./Component";

export interface SetComponentDataInputProps<T extends ComponentType>
  extends FunctionInputProps {
  entityManager: EntityManager;
  entity: Entity;
  componentData: IComponent<T>;
}

export interface SetComponentDataOutputProps {
  entity: Entity;
}
