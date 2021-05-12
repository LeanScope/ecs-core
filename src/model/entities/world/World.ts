import { Interpreter } from "xstate";
import { EntityManager } from "../";
import { SystemContext, SystemEvent, SystemGroup } from "../../systems";
import { WorldCreationProps } from "./WorldCreationProps";

export interface World extends WorldCreationProps {
  entityManager: EntityManager;
  systemGroups: SystemGroup[];
  systemsService: Interpreter<SystemContext, any, SystemEvent>;
}
