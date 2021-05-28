import { ArchitectureActorType } from "../../model/architecture";
import { SystemGroup, SystemGroupCreationProps } from "../../model/systems";

export function createSystemGroup(
  props: SystemGroupCreationProps
): SystemGroup {
  return {
    ...props,
    systems: [],
    type: ArchitectureActorType.ComponentSystemGroup,
  };
}

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
