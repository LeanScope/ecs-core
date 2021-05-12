import { ComponentType } from ".";
import { Entity } from "../entities";
import { IComponent } from "./Component";

export interface AddComponentsInputProps<T extends ComponentType> {
  entities: Entity[];
  components: IComponent<T>[];
}

export interface AddComponentsOutputProps<T extends ComponentType>
  extends AddComponentsInputProps<T> {
  entities: Entity[];
}
