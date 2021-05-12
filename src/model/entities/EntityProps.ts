import { IComponent } from "../components";
import { FunctionInputProps } from "../FunctionInputProps";
import { EntityManager } from "./EntityManager";

export interface CreateEntityInputProps extends FunctionInputProps {
  entityManager: EntityManager;
  components?: IComponent[];
}
