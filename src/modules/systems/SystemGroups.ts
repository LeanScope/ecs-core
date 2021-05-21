import { ArchitectureActorType } from "../../model/architecture";
import { SystemGroup, SystemGroupCreationProps } from "../../model/systems";

export function createComponentSystemGroup(
  props: SystemGroupCreationProps
): SystemGroup {
  const type = ArchitectureActorType.ComponentSystemGroup;
  return {
    ...props,
    systems: [],
    type: type,
  };
}

export function createInteractionSystemGroup(
  props: SystemGroupCreationProps
): SystemGroup {
  const type = ArchitectureActorType.InteractionSystemGroup;

  return {
    ...props,
    systems: [],
    type: type,
  };
}
