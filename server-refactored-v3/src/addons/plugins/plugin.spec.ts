import axios from 'axios';
import { Logger } from '@nestjs/common';
import { Plugin } from './plugin';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Plugin (abstract)', () => {
  class TestPlugin extends Plugin {
    constructor() {
      super();
      this.id = 'test-plugin';
      this.artifact_url = 'https://artifacthub.io/api/v1/packages/test';
      this.kind = 'TestPlugin';
    }
  }

  let plugin: TestPlugin;
  let loggerSpy: jest.SpyInstance;

  beforeEach(() => {
    plugin = new TestPlugin();
    loggerSpy = jest
      .spyOn(Logger.prototype, 'log')
      .mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(plugin).toBeDefined();
  });

  it('should load metadata from artifacthub and set properties', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        description: 'desc',
        maintainers: [{ name: 'dev' }],
        links: [{ url: 'link' }],
        readme: 'readme',
        version: '1.2.3',
        crds: [{ kind: 'TestPlugin', description: 'crd-desc' }],
        crds_examples: [{ kind: 'TestPlugin', example: true }],
      },
    });

    // Operator data mock
    const availableCRDs = [
      {
        spec: { names: { kind: 'TestPlugin' }, version: '1.0.0' },
        metadata: {
          annotations: {
            'alm-examples': JSON.stringify([
              { kind: 'TestPlugin', foo: 'bar' },
            ]),
          },
        },
      },
    ];

    await plugin.init(availableCRDs);

    expect(plugin.description).toBe('crd-desc');
    expect(plugin.maintainers).toEqual([{ name: 'dev' }]);
    expect(plugin.links).toEqual([{ url: 'link' }]);
    expect(plugin.readme).toBe('readme');
    expect(plugin.version.latest).toBe('1.2.3');
    expect(plugin.resourceDefinitions['TestPlugin']).toEqual({
      kind: 'TestPlugin',
      example: true,
    });
    expect(plugin.enabled).toBe(true);
    expect(plugin.version.installed).toBe('1.0.0');
  });

  it('should fallback to operator CRD if no crds in artefact_data', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        description: 'desc',
        maintainers: [],
        links: [],
        readme: '',
        version: '1.2.3',
        // crds fehlt
      },
    });

    const availableCRDs = [
      {
        spec: { names: { kind: 'TestPlugin' }, version: '1.0.0' },
        metadata: {
          annotations: {
            'alm-examples': JSON.stringify([
              { kind: 'TestPlugin', foo: 'bar' },
            ]),
          },
        },
      },
    ];

    await plugin.init(availableCRDs);

    expect(plugin.resourceDefinitions['TestPlugin']).toEqual({
      kind: 'TestPlugin',
      foo: 'bar',
    });
    expect(plugin.enabled).toBe(true);
  });

  it('should log if no operator CRDs found', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        description: 'desc',
        maintainers: [],
        links: [],
        readme: '',
        version: '1.2.3',
      },
    });

    const availableCRDs = [
      {
        spec: { names: { kind: 'OtherPlugin' }, version: '1.0.0' },
        metadata: {
          annotations: {
            'alm-examples': JSON.stringify([
              { kind: 'OtherPlugin', foo: 'bar' },
            ]),
          },
        },
      },
    ];

    await plugin.init(availableCRDs);

    expect(plugin.enabled).toBe(false);
    expect(loggerSpy).toHaveBeenCalledWith('☑️ test-plugin TestPlugin');
  });

  it('should handle axios error gracefully', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('fail'));
    const availableCRDs = [];
    await plugin.init(availableCRDs);
    expect(plugin.description).toBe('');
    expect(loggerSpy).toHaveBeenCalledWith('☑️ test-plugin TestPlugin');
  });
});
