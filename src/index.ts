import * as entityApi from "./modules/Entities";
import * as componentsApi from "./modules/Components";
import * as systemsApi from "./modules/Systems";
import { ECSApp } from "./components/ecs-app.component";

export * from "./modules/Entities";
export * from "./modules/Components";
export * from "./modules/Systems";
export * from "./components/ecs-app.component";

export default {
  ECSApp,
  ...entityApi,
  ...componentsApi,
  ...systemsApi,
};
