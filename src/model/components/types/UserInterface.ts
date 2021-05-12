import { ComponentType, IComponent } from "../../components";

export interface UserInterfaceInputProps {}

export interface UserInterfaceOutputProps
  extends UserInterfaceInputProps,
    IComponent<ComponentType.USER_INTERFACE> {}
