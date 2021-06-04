import { Entity } from "../entities";
import { IComponent } from "./Component";

export interface AddComponentInputProps {
  entities: Entity[];
  components: IComponent[];
}

export interface AddComponentOutputProps extends AddComponentInputProps {
  entities: Entity[];
}
