import { FunctionInputProps } from "../../FunctionInputProps";

export interface WorldCreationProps extends FunctionInputProps {
  problemSpace: {
    gitLabProjectId: number;
  };
  solutionSpace: {
    gitLabProjectId: number;
  };
}
