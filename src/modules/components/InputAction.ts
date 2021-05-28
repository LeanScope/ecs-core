import {
  InputActionComponent,
  InputActionCreationProps,
} from "../../model/components";

export const InputAction = (
  props: InputActionCreationProps = {
    name: "",
    isTriggered: false,
    isEnabled: false,
    bindings: [],
    onTrigger: () => {
      console.warn(
        "Triggering action " + props.name + " without a callback defined."
      );
    },
  }
): InputActionComponent => {
  return {
    type: "INPUT_ACTION",
    name: props.name,
    isEnabled: props.isEnabled,
    isTriggered: props.isTriggered,
    bindings: props.bindings,
    onTrigger: props.onTrigger,
  };
};

export const createTriggeredInputAction = (
  props: InputActionCreationProps,
  isTriggered: boolean
): InputActionComponent => {
  const result = Object.assign(InputAction(), props);
  result.isTriggered = isTriggered;
  return result;
};
