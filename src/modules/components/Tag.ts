import { TagInputProps, TagComponent } from "../../model/components";

export const Tag = (props: TagInputProps): TagComponent => {
  return {
    type: "TAG",
    guid: props.guid,
    name: props.name,
  };
};
