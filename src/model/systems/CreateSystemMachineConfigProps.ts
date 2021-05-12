import { EntityQueryBase } from "../entities";
import { FunctionInputProps } from "../FunctionInputProps";

export interface CreateSystemMachineConfigInputProps
  extends FunctionInputProps {
  key: string;
  entityQuery: EntityQueryBase;
}
