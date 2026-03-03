import { BaseException } from './base.exception';

class TestException extends BaseException {
  constructor(message: string) {
    super(message, 'TEST_ERROR');
  }
}

describe('BaseException', () => {
  it('should create exception with message and code', () => {
    const exception = new TestException('Test error');
    expect(exception.message).toBe('Test error');
    expect(exception.code).toBe('TEST_ERROR');
    expect(exception.name).toBe('TestException');
  });

  it('should be instance of Error', () => {
    const exception = new TestException('Test error');
    expect(exception).toBeInstanceOf(Error);
    expect(exception).toBeInstanceOf(BaseException);
  });
});
