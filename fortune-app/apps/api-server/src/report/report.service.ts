import { Injectable } from '@nestjs/common';

@Injectable()
export class ReportService {
  getDemo() {
    return { module: 'report', ok: true };
  }
}
