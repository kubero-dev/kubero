
import { KubernetesListObject, KubernetesObject } from '@kubernetes/client-node'

export interface IAddon {
  id: string
  operator: string,
  enabled: boolean,
  name: string,
  CRDkind: string,
  icon: string,
  displayName: string,
  version: string
  plural: string;
  description?: string,
  install: string,
  formfields: {[key: string]: IAddonFormFields},
  crd: KubernetesObject
}

interface IAddonMinimal {
  group: string;
  version: string;
  namespace: string;
  pipeline: string;
  phase: string;
  plural: string;
  id: string;
}

interface IAddonFormFields {
  type: 'text' | 'number' |'switch',
  label: string,
  name: string,
  required: boolean,
  default: string | number | boolean,
  description?: string,
  //value?: string | number | boolean,
}

export interface IAddon {
  id: string
  operator: string,
  enabled: boolean,
  name: string,
  CRDkind: string,
  icon: string,
  displayName: string,
  version: string
  plural: string;
  description?: string,
  install: string,
  formfields: {[key: string]: IAddonFormFields},
  crd: KubernetesObject
}

interface IUniqueAddons {
  [key: string]: IAddon
}