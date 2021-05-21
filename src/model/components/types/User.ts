import { ComponentType, IComponent } from "..";

export interface UserInputProps {
  name: string;
}

export interface UserOutputProps
  extends UserInputProps,
    IComponent<ComponentType.USER> {}
