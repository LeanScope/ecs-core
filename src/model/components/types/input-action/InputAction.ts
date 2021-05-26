import { IComponent, IComponentType } from "../..";
import { InputBinding } from "../../../InputBinding";

export const InputActionComponentType: IComponentType = {
  type: "INPUT_ACTION",
};

export interface InputActionCreationProps {
  name: string;
  isTriggered: boolean;
  isEnabled: boolean;
  bindings: InputBinding[];
  onTrigger: () => void;
}

export interface InputActionComponent
  extends InputActionCreationProps,
    IComponent {}
