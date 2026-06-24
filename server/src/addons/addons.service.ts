import { Injectable } from '@nestjs/common';
import { IPlugin } from './plugins/plugin.interface';
import { KuberoMysql } from './plugins/kuberoMysql';
import { KuberoRedis } from './plugins/kuberoRedis';
import { KuberoPostgresql } from './plugins/kuberoPostgresql';
import { KuberoMongoDB } from './plugins/kuberoMongoDB';
import { KuberoMemcached } from './plugins/kuberoMemcached';
import { KuberoElasticsearch } from './plugins/kuberoElasticsearch';
import { KuberoCouchDB } from './plugins/kuberoCouchDB';
import { KuberoKafka } from './plugins/kuberoKafka';
import { KuberoMail } from './plugins/kuberoMail';
import { KuberoRabbitMQ } from './plugins/kuberoRabbitMQ';
import { Tunnel } from './plugins/cloudflare';
import { PostgresCluster } from './plugins/postgresCluster';
import { RedisCluster } from './plugins/redisCluster';
import { Redis } from './plugins/redis';
import { PerconaServerMongoDB as MongoDB } from './plugins/mongoDB';
import { Cockroachdb } from './plugins/cockroachDB';
import { Tenant } from './plugins/minio';
import { ClickHouseInstallation } from './plugins/clickhouse';
import { KubernetesService } from '../kubernetes/kubernetes.service';
import { KuberoAddonPostgres } from './plugins/kuberoaddonsPostgres';
import { KuberoAddonMysql } from './plugins/kuberoaddonsMysql';
import { KuberoAddonRedis } from './plugins/kuberoaddonsRedis';
import { KuberoAddonRabbitmq } from './plugins/kuberoaddonsRabbitmq';
import { KuberoAddonMongodb } from './plugins/kuberoaddonsMongodb';
import { KuberoAddonMemcached } from './plugins/kuberoaddonsMemcached';
import { Cluster as CloudnativePG } from './plugins/cloudnativePG';
import { Elasticsearch } from './plugins/elasticsearch';

@Injectable()
export class AddonsService {
  private operatorsAvailable: string[] = [];
  public addonsList: IPlugin[] = []; // List or possibly installed operators
  private CRDList: any; //List of installed CRDs from kubectl

  constructor(private kubectl: KubernetesService) {
    this.loadOperators();
  }

  public async loadOperators(): Promise<void> {
    // Load all Custom Resource Definitions to get the list of installed operators
    this.CRDList = await this.kubectl.getCustomresources();

    const kuberoAddonPostgres = new KuberoAddonPostgres(this.CRDList);
    this.addonsList.push(kuberoAddonPostgres);

    const kuberoAddonRedis = new KuberoAddonRedis(this.CRDList);
    this.addonsList.push(kuberoAddonRedis);

    const kuberoAddonMysql = new KuberoAddonMysql(this.CRDList);
    this.addonsList.push(kuberoAddonMysql);

    const kuberoAddonMemcached = new KuberoAddonMemcached(this.CRDList);
    this.addonsList.push(kuberoAddonMemcached);

    const kuberoAddonMongodb = new KuberoAddonMongodb(this.CRDList);
    this.addonsList.push(kuberoAddonMongodb);

    const kuberoCouchDB = new KuberoCouchDB(this.CRDList);
    this.addonsList.push(kuberoCouchDB);

    const kuberoMail = new KuberoMail(this.CRDList);
    this.addonsList.push(kuberoMail);

    const kuberoAddonRabbitMQ = new KuberoAddonRabbitmq(this.CRDList);
    this.addonsList.push(kuberoAddonRabbitMQ);

    const tunnel = new Tunnel(this.CRDList);
    this.addonsList.push(tunnel);

    const cloudnativePG = new CloudnativePG(this.CRDList);
    this.addonsList.push(cloudnativePG);

    const postgresCluster = new PostgresCluster(this.CRDList);
    this.addonsList.push(postgresCluster);

    const redisCluster = new RedisCluster(this.CRDList);
    this.addonsList.push(redisCluster);

    const redis = new Redis(this.CRDList);
    this.addonsList.push(redis);

    const elasticsearch = new Elasticsearch(this.CRDList);
    this.addonsList.push(elasticsearch);

    const mongoDB = new MongoDB(this.CRDList);
    this.addonsList.push(mongoDB);

    const cockroachdb = new Cockroachdb(this.CRDList);
    this.addonsList.push(cockroachdb);

    const minio = new Tenant(this.CRDList);
    this.addonsList.push(minio);

    const clickhouse = new ClickHouseInstallation(this.CRDList);
    this.addonsList.push(clickhouse);

    const kuberoMysql = new KuberoMysql(this.CRDList);
    this.addonsList.push(kuberoMysql);

    const kuberoRedis = new KuberoRedis(this.CRDList);
    this.addonsList.push(kuberoRedis);

    const kuberoKafka = new KuberoKafka(this.CRDList);
    this.addonsList.push(kuberoKafka);

    const kuberoMemcached = new KuberoMemcached(this.CRDList);
    this.addonsList.push(kuberoMemcached);

    const kuberoElasticsearch = new KuberoElasticsearch(this.CRDList);
    this.addonsList.push(kuberoElasticsearch);

    const kuberoMongoDB = new KuberoMongoDB(this.CRDList);
    this.addonsList.push(kuberoMongoDB);

    const kuberoPostgresql = new KuberoPostgresql(this.CRDList);
    this.addonsList.push(kuberoPostgresql);

    const kuberoRabbitMQ = new KuberoRabbitMQ(this.CRDList);
    this.addonsList.push(kuberoRabbitMQ);
  }

  public async getAddonsList(): Promise<IPlugin[]> {
    return this.addonsList;
  }

  public getOperatorsList(): string[] {
    return this.operatorsAvailable;
  }
}
