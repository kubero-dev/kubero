export type OneDevProjectINfo = {
  id: number;
  forkedFromId: number;
  parentId: number;
  description: string;
  createDate: string;
  defaultRoleId: number;
  name: string;
  codeManagement: boolean;
  issueManagement: boolean;
  gitPackConfig: {
    windowMemory: string,
    packSizeLimit: string,
    threads: string,
    window: string
  };
  codeAnalysisSetting: {
    analysisFiles: string
  };
};