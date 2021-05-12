import { IComponent, ComponentType } from "../../../components";
import { InputActionMapCreationProps } from "./InputActionMapCreation";

export interface InputActionMapComponent
  extends InputActionMapCreationProps,
    IComponent<ComponentType.INPUT_ACTION_MAP> {}
