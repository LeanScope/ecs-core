export interface IComponentType {
  type: any;
}

export interface ComponentType<T> extends IComponentType {
  type: T;
}
