import { IComponent, ComponentType } from "../../../components";
import { InputActionCreationProps } from "./InputActionCreation";

export interface InputActionComponent
  extends InputActionCreationProps,
    IComponent<ComponentType.INPUT_ACTION> {}
