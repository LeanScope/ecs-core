import { IComponent, IComponentType } from "..";

export const UserComponentType: IComponentType = { type: "USER" };

export interface UserInputProps {
  name: string;
}

export interface UserComponent extends UserInputProps, IComponent {}
