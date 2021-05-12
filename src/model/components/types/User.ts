import { ComponentType, IComponent } from "../../components";

export interface UserInputProps {
  name: string;
}

export interface UserOutputProps
  extends UserInputProps,
    IComponent<ComponentType.USER> {}
