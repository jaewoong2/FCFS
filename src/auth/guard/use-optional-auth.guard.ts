import { UseGuards } from '@nestjs/common';
import {
  OptionalJwtAuthGuard,
  OptionalJwtGuardOptions,
} from './optional-auth.guard'; // 경로에 맞게 수정 필요

export function UseOptionalJwtAuthGuard(options?: OptionalJwtGuardOptions) {
  return UseGuards(new OptionalJwtAuthGuard(options));
}
