// ENTITY_NOT_FOUND 값 객체(status, default-message)를 가진

import {
  ALREADY_EXIST_ERROR,
  AUTHORIZATION_ERROR,
  CLIENT_ERROR,
  ENTITY_NOT_FOUND,
  ErrorCode,
} from './error-code';

//  ServiceException 인스턴스 생성 메서드
export const EntityNotFoundException = (message?: string): ServiceException => {
  return new ServiceException(ENTITY_NOT_FOUND, message);
};

// 이미 존재 하는 값 에러
export const AlereadyExistException = (message?: string): ServiceException => {
  return new ServiceException(ALREADY_EXIST_ERROR, message);
};

//  인증 오류
export const AuthroizationException = (message?: string): ServiceException => {
  return new ServiceException(AUTHORIZATION_ERROR, message);
};

export const ClientErrorException = (message?: string): ServiceException => {
  return new ServiceException(CLIENT_ERROR, message);
};

export const ValidatationErrorException = (
  message?: string,
): ServiceException => {
  return new ServiceException(CLIENT_ERROR, message);
};

export class ServiceException<T = any> extends Error {
  readonly errorCode: ErrorCode;
  readonly data: T = null;

  constructor(errorCode: ErrorCode, message?: string, data?: T) {
    if (!message) {
      message = errorCode.message;
    }
    super(message);

    this.data = data;
    this.errorCode = errorCode;
  }
}
