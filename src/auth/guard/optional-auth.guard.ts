import { Injectable, ExecutionContext } from '@nestjs/common';
import { JwtAuthGuard } from './auth.guard';

export interface OptionalJwtGuardOptions {
  pass?: boolean;
}

@Injectable()
export class OptionalJwtAuthGuard extends JwtAuthGuard {
  private options: OptionalJwtGuardOptions;

  constructor(options?: OptionalJwtGuardOptions) {
    super();
    this.options = options || { pass: false };
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const result = await super.canActivate(context);
      return Boolean(result);
    } catch (err) {
      if (this.options.pass) {
        return true;
      }
      throw err;
    }
  }

  handleRequest(err, user, info, context, status) {
    if (this.options.pass && (err || !user)) {
      return true;
    }
    return super.handleRequest(err, user, info, context, status);
  }
}
