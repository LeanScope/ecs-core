import { FunctionInputProps } from "../../FunctionInputProps";

export interface WorldCreationProps extends FunctionInputProps {
  name: string;
  sessionGuid: string;
  problemSpace: {
    gitLabProjectId: number;
  };
  solutionSpace: {
    gitLabProjectId: number;
  };
}
