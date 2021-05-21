import "cross-fetch/polyfill";
import { createHttpLink } from "apollo-link-http";
import { split } from "apollo-link";
import { setContext } from "apollo-link-context";
import { WebSocketLink } from "apollo-link-ws";
import { getMainDefinition } from "apollo-utilities";

const httpLink = createHttpLink({
  uri: "https://dev.api.leanscope.io/graphql",
});

// Create a WebSocket link:
const websocketLink = new WebSocketLink({
  uri: `wss://dev.api.leanscope.io/graphql`,
  options: {
    reconnect: true,
  },
});

// using the ability to split links, you can send data to each link
// depending on what kind of operation is being sent
export const link = split(
  // split based on operation type
  ({ query }) => {
    const operationDefNode = getMainDefinition(query);
    return (
      operationDefNode.kind === "OperationDefinition" &&
      operationDefNode.operation === "subscription"
    );
  },
  websocketLink,
  httpLink
);

export const authLink: any = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
      userToken: "suPer$ecRetToken_Thomas",
    },
  };
});
