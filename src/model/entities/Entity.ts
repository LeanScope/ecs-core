import { IComponent } from "../components";

export interface Entity {
  _guid: string;
  components: IComponent[];
}
