import { IComponent, ComponentType } from "../components";

export interface EntityDescriptionInputProps {
  name: string;
  description: string;
}
export interface EntityDescriptionOutputProps
  extends EntityDescriptionInputProps,
    IComponent<ComponentType.DESCRIPTION> {}
