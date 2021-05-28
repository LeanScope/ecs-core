import {
  InputActionComponent,
  InputActionMapComponent,
  InputActionMapCreationProps,
  InputActionName,
} from "../../model/components";
import { Key } from "ts-keycode-enum";

export const InputActionMap = (
  props: InputActionMapCreationProps = {
    name: "",
    entries: {},
  }
): InputActionMapComponent => {
  return {
    type: "INPUT_ACTION_MAP",
    name: props.name,
    entries: props.entries,
  };
};

export function createInputActionMapFromJson(props: {
  name: string;
  json: any;
}) {
  const entries: { [name: string]: InputActionComponent } = {};
  for (let key in props.json) {
    entries[key] = props.json[key];
  }

  const inputActionMap: InputActionMapComponent = {
    type: "INPUT_ACTION_MAP",
    name: props.name,
    entries: entries,
  };

  return inputActionMap;
}

export const inputActionMapJson = {
  [InputActionName.addParticipant]: {
    type: "INPUT_ACTION",
    name: InputActionName.addParticipant,
    bindings: [
      {
        path: "<Keyboard>/#" + Key.PlusSign,
      },
    ],
  },
};
