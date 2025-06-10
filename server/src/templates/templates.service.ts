import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class TemplatesService {
  private YAML = require('yaml');
  constructor() {}

  async getTemplate(templateB64: string) {
    // decode the base64 encoded URL
    const templateUrl = Buffer.from(templateB64, 'base64').toString('ascii');

    const template = await axios.get(templateUrl).catch((err) => {
      throw new Error(err);
    });
    if (template) {
      const ret = this.YAML.parse(template.data);
      return ret.spec;
    }
  }
}
