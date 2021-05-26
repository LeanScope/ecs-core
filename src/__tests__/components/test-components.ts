import { IComponent, IComponentType } from "../../model/components";

export const TestComponentType_1: IComponentType = { type: "TEST-1" };
export const TestComponentType_2: IComponentType = { type: "TEST-2" };
export const TestComponentType_3: IComponentType = { type: "TEST-3" };
export const TestComponentType_4: IComponentType = { type: "TEST-4" };

export interface TestComponentInputProps {
  testString: string;
  testNumber: number;
  testBoolean: boolean;
}

export interface TestComponent extends TestComponentInputProps, IComponent {}

export function Test_1(props: TestComponentInputProps): TestComponent {
  return {
    type: "TEST-1",
    ...props,
  };
}

export function Test_2(props: TestComponentInputProps): TestComponent {
  return {
    type: "TEST-2",
    ...props,
  };
}

export function Test_3(props: TestComponentInputProps): TestComponent {
  return {
    type: "TEST-3",
    ...props,
  };
}

export function Test_4(props: TestComponentInputProps): TestComponent {
  return {
    type: "TEST-4",
    ...props,
  };
}
