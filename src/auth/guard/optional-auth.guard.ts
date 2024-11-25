import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtAuthGuard } from './auth.guard';
import { User } from 'src/users/entities/user.entity';

export interface OptionalJwtGuardOptions {
  pass?: boolean;
  callback?: (user: User) => { message?: string; shouldPass?: boolean };
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

  handleRequest(
    err: any,
    user: User | null,
    info: any,
    context: ExecutionContext,
    status?: any,
  ): any {
    // If a custom callback is provided, use it to determine whether to pass or fail.
    if (this.options.callback) {
      const result = this.options.callback(user);

      if (!result.shouldPass) {
        throw new UnauthorizedException({
          status: status,
          message: result.message ?? '알수 없는 에러',
        }); // Explicitly return null to signify no user.
      }
    }

    // If `pass` is enabled and either an error occurred or no user is present, bypass authentication.
    if (this.options.pass && (!user || err)) {
      return super.handleRequest(err, null, info, context, status); // Allow the request to pass without a user.
    }

    // Fall back to the default behavior of the parent `AuthGuard`.
    return super.handleRequest(err, user, info, context, status);
  }
}
