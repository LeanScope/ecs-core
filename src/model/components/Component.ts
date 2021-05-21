import { ComponentType } from "./types/ComponentType";

export interface IComponent<T extends ComponentType = any> {
  type: T;
}
