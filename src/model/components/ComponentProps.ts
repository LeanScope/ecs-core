import { Entity } from "../entities";
import { IComponent } from "./Component";

export interface AddComponentsInputProps {
  entities: Entity[];
  components: IComponent[];
}

export interface AddComponentsOutputProps extends AddComponentsInputProps {
  entities: Entity[];
}
