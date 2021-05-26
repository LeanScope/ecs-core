import { IComponent, IComponentType } from "..";

export const TagComponentType: IComponentType = { type: "TAG" };

export interface TagInputProps {
  guid: string;
  name: string;
}

export interface TagComponent extends TagInputProps, IComponent {}
