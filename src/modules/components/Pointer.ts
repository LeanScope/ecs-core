import { PointerInputProps, PointerComponent } from "../../model/components";

let pointerId = 0;

export const Pointer = (
  props: PointerInputProps = {
    id: pointerId++,
    x: -1,
    y: -1,
  }
): PointerComponent => {
  return {
    type: "POINTER",
    id: props.id,
    x: props.x,
    y: props.y,
  };
};
