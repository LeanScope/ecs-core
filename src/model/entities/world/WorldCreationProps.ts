import { FunctionInputProps } from "../../FunctionInputProps";

export interface WorldCreationProps extends FunctionInputProps {
  name: string;
  problemSpace: {
    gitLabProjectId: number;
  };
  solutionSpace: {
    gitLabProjectId: number;
  };
}
