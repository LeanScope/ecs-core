import { IComponentType, IComponent } from "..";

export const StoryComponentType: IComponentType = { type: "STORY" };

export interface StoryInputProps {
  guid: string;
  title: string;
}

export interface StoryComponent extends StoryInputProps, IComponent {}
