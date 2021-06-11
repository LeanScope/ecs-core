# Entity Component System Core

This repository contains the basic sources needed to establish an Entity-Component-System architecture known from Unity3D for the modern web.



## Create a Component

*exampleComponent.ts*

```javascript
import { IComponent, IComponentType } from "@leanscope/ecs-core/lib/model/components";
import { Position, Dimensions } from "../../types";

//Create a type that you can reference later on
export const ExampleComponentType: IComponentType = { type: "example" };

//Define the abstract data that your component holds
export interface ExampleComponentInputProps {
  id: string;
  exampleNum: number;
  exampleString: string;
  exampleBool: boolean;
}

//Make your component definition available outside
export interface ExampleComponent extends ExampleComponentInputProps, IComponent {}

//Define the Component Constructor
export function CreateExampleComponent(props: ExampleComponentInputProps = {
  	//Define default values
   	id: "example-id";
  	exampleNum: 1;
 	exampleString: "example";
  	exampleBool: true;
  }
): ExampleComponent {
  return {
    type: "example",
    ...props,
  };
}
```



## Create a System

*exampleSystem.ts*

```javascript
import { System, SystemContext, SystemCreationProps, SystemEvent} from "@leanscope/ecs-core/lib/model/systems";
import ecs from "@leanscope/ecs-core";
import { Machine } from "xstate";

export function exampleSystem(props: SystemCreationProps): System {
  const type = ArchitectureActorType.GenericSystem;
  const entityQuery = ecs.getEntityQueryFromDesc({
    callerId: props.callerId,
    entityManager: props.entityManager,
    queryDesc: {},
  });

  const machine = Machine<SystemContext, any, SystemEvent>(
    ecs.createSystemMachineConfig({
      callerId: props.callerId,
      key: type,
      entityQuery: entityQuery,
    }),
    {
      actions: {
        [TransitionActionName.onStartRunning]: (_context, _event) => {
			// Your initialization code...
        },

        [TransitionActionName.onUpdate]: (_context, _event) => {
			// Your onUpdate code...
        },
      },
    }
  );

  const service = ecs.createStateMachineService({ machine: machine as any });

  return {
    callerId: props.callerId,
    type: type,
    entityManager: props.entityManager,
    service: service,
  };
}
```



## Create a World

```javascript
import ecs from "@leanscope/ecs-core";

//Create the World object
const world = ecs.getOrCreateDefaultWorld({
  problemSpace: {
    gitLabProjectId: 207,
  },
  solutionSpace: {
    gitLabProjectId: 186,
  },
});


//Create an empty group of Systems
let systemGroup = ecs.createSystemGroup({
  systemsService: world.systemsService,
});

//Add your priorly defined System to the group
systemGroup = ecs.addSystemToUpdateList({
  group: systemGroup,
  system: createExampleSystem({
    entityManager: world.entityManager,
  }),
});

//Push your System group into the World object
world.systemGroups.push(systemGroup);

//Initiate all systems in the World
ecs.initSystems({ world });
```

