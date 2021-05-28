import {
  UserInterfaceInputProps,
  UserInterfaceComponent,
} from "../../model/components";

export const UserInterface = (
  props: UserInterfaceInputProps
): UserInterfaceComponent => {
  return {
    type: "USER_INTERFACE",
  };
};
