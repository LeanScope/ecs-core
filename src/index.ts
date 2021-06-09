import * as entityApi from "./modules/entities";
import * as componentsApi from "./modules/components/Components";
import * as systemsApi from "./modules/systems";
import * as model from "./model";

export * from "./model";
export * from "./modules/entities";
export * from "./modules/components/Components";
export * from "./modules/systems";

export default {
  ...model,
  ...entityApi,
  ...componentsApi,
  ...systemsApi,
};
