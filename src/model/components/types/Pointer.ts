import { IComponent, ComponentType } from "..";

export interface PointerInputProps {
  id: number;
  x: number;
  y: number;
}

export interface PointerOutputProps
  extends PointerInputProps,
    IComponent<ComponentType.POINTER> {}
