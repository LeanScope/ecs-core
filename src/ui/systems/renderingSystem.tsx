import { UserInterfaceComponentType } from "../../model/components";
import React from "react";
import { SystemCreationProps } from "../../model/systems";
import {
  getEntityQueryFromDesc,
  toEntitiesArray,
} from "../../modules/entities";

export const renderingSystem: React.FunctionComponent<SystemCreationProps> = (
  props: SystemCreationProps
) => {
  const uiEntitiesQuery = getEntityQueryFromDesc({
    callerId: props.callerId,
    entityManager: props.entityManager,
    queryDesc: { all: [UserInterfaceComponentType] },
  });

  const uiEntities = toEntitiesArray({
    callerId: props.callerId,
    entityQuery: uiEntitiesQuery,
  });

  //TODO map all entities mit UI components
  return <div>TEST</div>;
};
