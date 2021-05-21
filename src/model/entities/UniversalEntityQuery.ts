import { ApolloClient, NormalizedCacheObject } from "@apollo/client";
import { Interpreter } from "xstate";
import { EntityManagerContext, EntityManagerEvent, EntityQueryBase } from ".";
import { FunctionInputProps } from "../FunctionInputProps";

export interface UniversalEntityQuery
  extends CreateUniversalEntityQueryInputProps,
    EntityQueryBase {}

export interface CreateUniversalEntityQueryInputProps
  extends FunctionInputProps {
  entityManagerService: Interpreter<
    EntityManagerContext,
    any,
    EntityManagerEvent
  >;
  apolloClient: ApolloClient<NormalizedCacheObject>;
  problemSpaceQueryString: string;
  solutionSpaceQueryString: string;
}
