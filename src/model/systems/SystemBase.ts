import { SystemCreationProps } from "./SystemCreationProps";

export interface SystemBase<T = any> extends SystemCreationProps {
  type: T;
}
