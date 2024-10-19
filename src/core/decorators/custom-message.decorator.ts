import { SetMetadata } from '@nestjs/common';

export const SuccessMessage = (message: string = '요청이 완료 되었습니다.') =>
  SetMetadata('customMessage', message);
