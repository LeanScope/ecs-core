import { IComponentType, IComponent } from "..";

export const UserInterfaceComponentType: IComponentType = {
  type: "USER_INTERFACE",
};

export interface UserInterfaceInputProps {}

export interface UserInterfaceComponent
  extends UserInterfaceInputProps,
    IComponent {}
