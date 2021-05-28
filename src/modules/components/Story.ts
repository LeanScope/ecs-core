import { StoryInputProps, StoryComponent } from "../../model/components";

export const Story = (props: StoryInputProps): StoryComponent => {
  return {
    type: "STORY",
    guid: props.guid,
    title: props.title,
  };
};
