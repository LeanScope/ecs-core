import { IComponent, ComponentType } from "..";

export interface TagInputProps {
  guid: string;
  name: string;
}

export interface TagOutputProps
  extends TagInputProps,
    IComponent<ComponentType.TAG> {}
