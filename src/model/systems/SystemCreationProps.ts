import { EntityManager } from "../entities";
import { FunctionInputProps } from "../FunctionInputProps";

export interface SystemCreationProps extends FunctionInputProps {
  entityManager: EntityManager;
}
