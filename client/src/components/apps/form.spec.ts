import { beforeEach, describe, expect, it, vi } from "vitest";
import axios from "axios";
import AppForm from "./form.vue";

vi.mock("axios", () => ({
  default: {
    get: vi.fn(),
  },
}));

vi.mock("./addons.vue", () => ({
  default: { name: "Addons", render: () => null },
}));

vi.mock("../breadcrumbs.vue", () => ({
  default: { name: "Breadcrumbs", render: () => null },
}));

vi.mock("sweetalert2", () => ({
  default: {},
}));

vi.mock("../../stores/kubero", () => ({
  useKuberoStore: () => ({ kubero: {} }),
}));

const mockedAxios = axios as unknown as { get: ReturnType<typeof vi.fn> };

function formMethods() {
  const methods =
    (AppForm as { methods?: Record<string, (...args: unknown[]) => unknown> })
      .methods;
  if (!methods?.loadPipelineAndApp || !methods.loadBranches || !methods.loadApp) {
    throw new Error("App form methods are not available on the component export");
  }
  return methods;
}

function createFormContext(app: string) {
  const methods = formMethods();
  const ctx: Record<string, unknown> = {
    app,
    pipeline: "demo",
    phase: "production",
    branch: "main",
    branchesList: [] as string[],
    panel: [] as number[],
    docker: { image: "", tag: "", command: "" },
    sslIndex: [] as boolean[],
    takenDomains: [] as string[],
    pipelineData: {
      domain: "example.com",
      dockerimage: "",
      buildpack: { run: { readOnlyAppStorage: true } },
      git: {
        provider: "",
        repository: {},
      },
      buildstrategy: "plain",
      deploymentstrategy: "docker",
      phases: [],
    },
    buildpack: { run: { readOnlyAppStorage: true } },
    buildstrategy: "plain",
    deploymentstrategy: "docker",
    ingress: {
      hosts: [{ host: "" }],
      tls: [{ hosts: [] as string[] }],
    },
  };

  ctx.whiteListDomains = methods.whiteListDomains.bind(ctx);
  ctx.cronjobUnformat = methods.cronjobUnformat.bind(ctx);
  ctx.loadBranches = methods.loadBranches.bind(ctx);
  ctx.loadApp = methods.loadApp.bind(ctx);
  ctx.loadPipelineAndApp = methods.loadPipelineAndApp.bind(ctx);
  return ctx;
}

function pipelineResponse() {
  return {
    data: {
      domain: "example.com",
      dockerimage: "",
      buildpack: { run: { readOnlyAppStorage: true } },
      buildstrategy: "plain",
      deploymentstrategy: "git",
      phases: [],
      git: {
        provider: "github",
        repository: {
          admin: true,
          clone_url: "https://github.com/org/repo.git",
          ssh_url: "git@github.com:org/repo.git",
          default_branch: "main",
        },
      },
    },
  };
}

function appResponse(branch: string) {
  return {
    data: {
      metadata: { resourceVersion: "1" },
      spec: {
        envVars: [],
        serviceAccount: { annotations: {} },
        extraVolumes: [],
        cronjobs: [],
        image: {
          command: [],
          repository: "ghcr.io/org/app",
          tag: "latest",
          containerPort: 8080,
          run: { securityContext: {}, readOnlyAppStorage: true },
          build: { command: "" },
          fetch: {},
        },
        deploymentstrategy: "git",
        buildstrategy: "plain",
        name: "my-app",
        sleep: "disabled",
        basicAuth: { enabled: false, realm: "Authentication required", accounts: [] },
        gitrepo: {
          ssh_url: "git@github.com:org/repo.git",
        },
        branch,
        imageTag: "",
        autodeploy: true,
        podsize: "small",
        autoscale: false,
        web: {
          replicaCount: 1,
          autoscaling: { minReplicas: 1, maxReplicas: 3 },
        },
        worker: {
          replicaCount: 0,
          autoscaling: { minReplicas: 0, maxReplicas: 0 },
        },
        addons: [],
        vulnerabilityscan: { enabled: false },
        ingress: {
          hosts: [{ host: "my-app.example.com" }],
          tls: [{ hosts: [] }],
        },
        healthcheck: {
          enabled: true,
          path: "/",
          startupSeconds: 90,
          timeoutSeconds: 3,
          periodSeconds: 10,
        },
      },
    },
  };
}

describe("app form branch loading", () => {
  beforeEach(() => {
    mockedAxios.get.mockReset();
  });

  it("keeps a saved non-default branch when the repo default is main", async () => {
    const ctx = createFormContext("my-app");
    let resolveBranches!: (value: { data: string[] }) => void;
    const branchesRequest = new Promise<{ data: string[] }>((resolve) => {
      resolveBranches = resolve;
    });

    mockedAxios.get.mockImplementation((url: string) => {
      if (url === "/api/pipelines/demo") {
        return Promise.resolve(pipelineResponse());
      }
      if (url.includes("/branches")) {
        return branchesRequest;
      }
      if (url === "/api/apps/demo/production/my-app") {
        return Promise.resolve(appResponse("develop"));
      }
      return Promise.resolve({ data: [] });
    });

    await (ctx.loadPipelineAndApp as () => Promise<void>)();
    await Promise.resolve();
    await Promise.resolve();

    resolveBranches({ data: ["main", "develop"] });
    await Promise.resolve();
    await Promise.resolve();

    expect(ctx.branch).toBe("develop");
  });

  it("pre-selects the repository default branch when creating an app", async () => {
    const ctx = createFormContext("new");
    let resolveBranches!: (value: { data: string[] }) => void;
    const branchesRequest = new Promise<{ data: string[] }>((resolve) => {
      resolveBranches = resolve;
    });

    mockedAxios.get.mockImplementation((url: string) => {
      if (url === "/api/pipelines/demo") {
        return Promise.resolve(pipelineResponse());
      }
      if (url.includes("/branches")) {
        return branchesRequest;
      }
      return Promise.resolve({ data: [] });
    });

    await (ctx.loadPipelineAndApp as () => Promise<void>)();
    resolveBranches({ data: ["main", "develop"] });
    await Promise.resolve();
    await Promise.resolve();

    expect(ctx.branch).toBe("main");
  });
});
