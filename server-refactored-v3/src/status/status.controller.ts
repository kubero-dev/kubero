import { Controller, Logger, Get, Res } from "@nestjs/common";
import { PrometheusController } from "@willsoto/nestjs-prometheus";
import { Response } from "express";

@Controller('status')
export class StatusController extends PrometheusController {
  private readonly logger = new Logger(StatusController.name);
  @Get()
  async index(@Res({ passthrough: true }) response: Response) {
    // check if the request is been forwarded by the ingress controller
    // block the request if it is forwarded
    if (response.req.headers['x-forwarded-for']) {
      response.status(403)
      this.logger.warn('Blocked request from ingress controller');
      return '';
    }
    return super.index(response);
  }
}
