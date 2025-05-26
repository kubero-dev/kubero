export interface IPluginFormFields {
  type:
    | 'text'
    | 'number'
    | 'switch'
    | 'select'
    | 'select-storageclass'
    | 'combobox';
  label: string;
  name: string;
  required: boolean;
  options?: string[];
  default: string | number | boolean;
  description?: string;
}

export interface IPlugin {
  id: string;
  enabled: boolean;
  beta: boolean;
  version: {
    latest: string;
    installed: string;
  };
  description: string;
  install: string;
  formfields: { [key: string]: IPluginFormFields };
  //crd: KubernetesObject,
  resourceDefinitions: any;
  artifact_url: string;
}
