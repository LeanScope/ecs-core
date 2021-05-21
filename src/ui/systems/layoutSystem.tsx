import { Machine } from "xstate";
import { EntityManager } from "../../model/entities";
import { SystemContext, SystemEvent } from "../../model/systems";
import { TransitionActionName } from "../../model/TransitionActionName";
import { createSystemMachineConfig } from "../../modules/systems/systems";

export const createLayoutSystem = (props: {
  callerId: string;
  entityManager: EntityManager;
}) => {
  //Entity query -> Alle Entities
  const universalEntityQuery = props.entityManager.universalEntityQuery;

  const machine = Machine<SystemContext, any, SystemEvent>(
    createSystemMachineConfig({
      callerId: props.callerId,
      key: "LayoutSystem",
      entityQuery: universalEntityQuery,
    }),
    {
      actions: {
        [TransitionActionName.onStartRunning]: (_context, _event) => {},
        [TransitionActionName.onUpdate]: (_context, _event) => {
          console.log(_context, _event);
          //entity.addComponent(type: "UI Component", content: <div>{entity.guid}</div>)
        },
      },
    }
  );
};
