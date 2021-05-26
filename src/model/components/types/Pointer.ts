import { IComponent, IComponentType } from "..";

export const PointerComponentType: IComponentType = { type: "POINTER" };

export interface PointerInputProps {
  id: number;
  x: number;
  y: number;
}

export interface PointerComponent extends PointerInputProps, IComponent {}
