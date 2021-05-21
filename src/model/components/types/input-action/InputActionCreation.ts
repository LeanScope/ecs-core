import { InputBinding } from "../../../InputBinding";

export interface InputActionCreationProps {
  name: string;
  isTriggered: boolean;
  isEnabled: boolean;
  bindings: InputBinding[];
  onTrigger: () => void;
}
