import { InputActionComponent } from "./InputAction";

export interface InputActionMapCreationProps {
  name: string;
  entries: { [name: string]: InputActionComponent };
}
