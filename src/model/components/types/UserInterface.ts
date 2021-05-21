import { ComponentType, IComponent } from "..";

export interface UserInterfaceInputProps {}

export interface UserInterfaceOutputProps
  extends UserInterfaceInputProps,
    IComponent<ComponentType.USER_INTERFACE> {}
