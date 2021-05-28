import * as entityApi from "./modules/entities";
import * as componentsApi from "./modules/components/Components";
import * as systemsApi from "./modules/systems";

export * from "./modules/entities";
export * from "./modules/components/Components";
export * from "./modules/systems";

export default {
  ...entityApi,
  ...componentsApi,
  ...systemsApi,
};
