import {
  ComponentType,
  IComponent,
  InputActionComponent,
  InputActionCreationProps,
  InputActionMapComponent,
  InputActionMapCreationProps,
  InputActionName,
  PointerInputProps,
  PointerOutputProps,
  SetComponentDataInputProps,
  SetComponentDataOutputProps,
  StoryInputProps,
  StoryOutputProps,
  TagInputProps,
  TagOutputProps,
  UserInputProps,
  UserInterfaceInputProps,
  UserInterfaceOutputProps,
  UserOutputProps,
} from "../model/components";
import { Entity } from "../model/entities";
import { EventType } from "../model/EventType";
import { Key } from "ts-keycode-enum";
import { toEntitiesArray, setEntitiesArray } from "./Entities/Entities";

let pointerId = 0;

export const Pointer = (
  props: PointerInputProps = {
    id: pointerId++,
    x: -1,
    y: -1,
  }
): PointerOutputProps => {
  return {
    type: ComponentType.POINTER,
    id: props.id,
    x: props.x,
    y: props.y,
  };
};

export const Tag = (props: TagInputProps): TagOutputProps => {
  return {
    type: ComponentType.TAG,
    guid: props.guid,
    name: props.name,
  };
};

export const UserInterface = (
  props: UserInterfaceInputProps
): UserInterfaceOutputProps => {
  return {
    type: ComponentType.USER_INTERFACE,
  };
};

export const User = (props: UserInputProps): UserOutputProps => {
  return {
    type: ComponentType.USER,
    name: props.name,
  };
};

export const Story = (props: StoryInputProps): StoryOutputProps => {
  return {
    type: ComponentType.STORY,
    guid: props.guid,
    title: props.title,
  };
};

export const InputAction = (
  props: InputActionCreationProps = {
    name: "",
    isTriggered: false,
    isEnabled: false,
    bindings: [],
    onTrigger: () => {
      console.warn(
        "Triggering action " + props.name + " without a callback defined."
      );
    },
  }
): InputActionComponent => {
  return {
    type: ComponentType.INPUT_ACTION,
    name: props.name,
    isEnabled: props.isEnabled,
    isTriggered: props.isTriggered,
    bindings: props.bindings,
    onTrigger: props.onTrigger,
  };
};

export const InputActionMap = (
  props: InputActionMapCreationProps = {
    name: "",
    entries: {},
  }
): InputActionMapComponent => {
  return {
    type: ComponentType.INPUT_ACTION_MAP,
    name: props.name,
    entries: props.entries,
  };
};

export const inputActionMapJson = {
  [InputActionName.addParticipant]: {
    type: ComponentType.INPUT_ACTION,
    name: InputActionName.addParticipant,
    bindings: [
      {
        path: "<Keyboard>/#" + Key.PlusSign,
      },
    ],
  },
};

export function createInputActionMapFromJson(props: {
  name: string;
  json: any;
}) {
  const entries: { [name: string]: InputActionComponent } = {};
  for (let key in props.json) {
    entries[key] = props.json[key];
  }

  const inputActionMap: InputActionMapComponent = {
    type: ComponentType.INPUT_ACTION_MAP,
    name: props.name,
    entries: entries,
  };

  return inputActionMap;
}

export const createTriggeredInputAction = (
  props: InputActionCreationProps,
  isTriggered: boolean
): InputActionComponent => {
  const result = Object.assign(InputAction(), props);
  result.isTriggered = isTriggered;
  return result;
};

export function setComponentData<T extends ComponentType>(
  props: SetComponentDataInputProps<T>
): SetComponentDataOutputProps {
  // @Todo: get rid of the array copying mechanism for the sake of performance
  console.info("setComponentData");
  const currentEntities = toEntitiesArray({
    callerId: props.callerId,
    entityQuery: props.entityManager.universalEntityQuery,
  });
  const newEntities = new Array<Entity>();
  currentEntities.forEach((entity) => {
    if (entity._guid === props.entity._guid) {
      const newComponents = new Array<IComponent<T>>();

      let modified = false;
      entity.components.forEach((component) => {
        if (component.type === props.componentData.type) {
          newComponents.push(props.componentData);
          modified = true;
        } else {
          newComponents.push(component);
        }
      });

      if (!modified) {
        newComponents.push(props.componentData);
      }
      const newEntity = Object.assign(
        {},
        { _guid: entity._guid, components: newComponents }
      );

      newEntities.push(newEntity);
      console.info(
        "Setting component data to " + JSON.stringify(entity.components)
      );
    } else {
      newEntities.push(entity);
    }
  });

  setEntitiesArray({
    callerId: props.callerId,
    entityQuery: props.entityManager.universalEntityQuery,
    entities: [...newEntities],
  });

  props.entityManager.entityManagerService.send({
    type: EventType.COMPONENT_ADDED,
    callerId: props.callerId,
  });

  return {
    entity: props.entity,
  };
}

export function getComponentData<T extends IComponent>(
  entity: Entity,
  creator: () => T
): T | undefined {
  const componentData = entity.components.find((component) => {
    return component.type === creator().type;
  });
  if (componentData) {
    return componentData as T;
  }
  throw new Error(
    `Component ${creator().type} not found on Entity ${entity._guid}`
  );
}
