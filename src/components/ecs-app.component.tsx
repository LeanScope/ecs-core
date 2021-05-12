import React, { useState } from "react";
import { v4 as uuid } from "uuid";
import { getOrCreateDefaultWorld } from "../index";
import { ArchitectureActorType } from "../model/architecture";
import { ApolloProvider } from "@apollo/client";

export const ECSApp: React.FunctionComponent = (props) => {
  const sessionGuid = uuid();

  const [world] = useState(
    getOrCreateDefaultWorld({
      callerId: ArchitectureActorType.App,
      name: ArchitectureActorType.World,
      sessionGuid: sessionGuid,
      problemSpace: {
        gitLabProjectId: 207,
      },
      solutionSpace: {
        gitLabProjectId: 186,
      },
    })
  );

  const childrenWithWorld = React.Children.map(props.children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { world: world });
    }
  });

  return (
    <ApolloProvider client={world.entityManager.apolloClient}>
      {childrenWithWorld}
    </ApolloProvider>
  );
};
