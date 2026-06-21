import '@testing-library/jest-dom';
import { TextDecoder, TextEncoder } from 'node:util';

global.TextEncoder = TextEncoder as typeof global.TextEncoder;
global.TextDecoder = TextDecoder as unknown as typeof global.TextDecoder;

class MockHeaders {
  private readonly map = new Map<string, string>();

  append(key: string, value: string) {
    this.map.set(key.toLowerCase(), value);
  }

  get(key: string) {
    return this.map.get(key.toLowerCase()) ?? null;
  }

  set(key: string, value: string) {
    this.map.set(key.toLowerCase(), value);
  }
}

class MockRequest {}
class MockResponse {}

global.Headers = (global.Headers ?? MockHeaders) as typeof global.Headers;
global.Request = (global.Request ?? MockRequest) as typeof global.Request;
global.Response = (global.Response ?? MockResponse) as typeof global.Response;
