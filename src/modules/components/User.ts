import { UserInputProps, UserComponent } from "../../model/components";

export const User = (props: UserInputProps): UserComponent => {
  return {
    type: "USER",
    name: props.name,
  };
};
