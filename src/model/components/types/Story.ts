import { ComponentType, IComponent } from "..";

export interface StoryInputProps {
  guid: string;
  title: string;
}
export interface StoryOutputProps
  extends StoryInputProps,
    IComponent<ComponentType.STORY> {}
