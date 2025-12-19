// Jest setup file
// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

<<<<<<< Current (Your changes)
// Set up environment variables for tests
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-purposes-only';
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
=======
// Set up test environment variables before any imports
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.JWT_SECRET = 'test-jwt-secret-for-testing-only-32chars';
process.env.NODE_ENV = 'test';
>>>>>>> Incoming (Background Agent changes)

// Polyfill for Web APIs needed by Next.js
if (typeof Request === 'undefined') {
  global.Request = class Request {
    constructor(input, init) {
      this.url = input;
      this.method = init?.method || 'GET';
      this.headers = new Headers(init?.headers);
      this.body = init?.body;
    }
  };
}

if (typeof Response === 'undefined') {
  global.Response = class Response {
    constructor(body, init) {
      this._body = body;
      this.status = init?.status || 200;
      this.headers = new Headers(init?.headers);
    }
    async json() {
      return JSON.parse(this._body);
    }
  };
}

if (typeof Headers === 'undefined') {
  global.Headers = class Headers {
    constructor(init) {
      this._headers = {};
      if (init) {
        Object.entries(init).forEach(([key, value]) => {
          this._headers[key.toLowerCase()] = value;
        });
      }
    }
    get(name) {
      return this._headers[name.toLowerCase()];
    }
    set(name, value) {
      this._headers[name.toLowerCase()] = value;
    }
  };
}

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return '';
  },
}));

// Mock Next.js headers
jest.mock('next/headers', () => ({
  cookies() {
    return {
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
    };
  },
  headers() {
    return new Headers();
  },
}));

