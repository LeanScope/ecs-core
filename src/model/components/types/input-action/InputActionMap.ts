import { IComponent, IComponentType, InputActionComponent } from "../..";

export const InputActionMapComponentType: IComponentType = {
  type: "INPUT_ACTION_MAP",
};

export interface InputActionMapCreationProps {
  name: string;
  entries: { [name: string]: InputActionComponent };
}

export interface InputActionMapComponent
  extends InputActionMapCreationProps,
    IComponent {}
