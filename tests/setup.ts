import '@testing-library/jest-dom';
import { beforeEach, vi } from 'vitest';
import { mockDepartments, mockEmployees, mockShiftConfig, mockOtTrendData, mockVesselSchedules, mockLeaveRecords } from './mocks/mockData';

// 1. Polyfill window.matchMedia for responsive testing
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// 2. Polyfill ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
};

// 3. Polyfill IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => []);
  root = null;
  rootMargin = '';
  thresholds = [];
};

// 4. Polyfill URL.createObjectURL & revokeObjectURL (used in CSV exports)
if (typeof window !== 'undefined') {
  if (!window.URL.createObjectURL) {
    window.URL.createObjectURL = vi.fn(() => 'blob:mock-blob-url');
  }
  if (!window.URL.revokeObjectURL) {
    window.URL.revokeObjectURL = vi.fn();
  }
}

// 5. Mock CacheStorage API for PWA Service Worker tests
export class MockCache {
  private store = new Map<string, Response>();

  async match(request: RequestInfo | URL) {
    const url = typeof request === 'string' ? request : (request as Request).url;
    return this.store.get(url)?.clone() || null;
  }

  async put(request: RequestInfo | URL, response: Response) {
    const url = typeof request === 'string' ? request : (request as Request).url;
    this.store.set(url, response.clone());
  }

  async delete(request: RequestInfo | URL) {
    const url = typeof request === 'string' ? request : (request as Request).url;
    return this.store.delete(url);
  }

  async keys() {
    return Array.from(this.store.keys()).map((k) => new Request(k));
  }

  async addAll(requests: (RequestInfo | URL)[]) {
    for (const req of requests) {
      const url = typeof req === 'string' ? req : (req as Request).url;
      this.store.set(url, new Response('mock-cached-content'));
    }
  }
}

export class MockCacheStorage {
  private caches = new Map<string, MockCache>();

  async open(name: string) {
    if (!this.caches.has(name)) {
      this.caches.set(name, new MockCache());
    }
    return this.caches.get(name)!;
  }

  async has(name: string) {
    return this.caches.has(name);
  }

  async delete(name: string) {
    return this.caches.delete(name);
  }

  async keys() {
    return Array.from(this.caches.keys());
  }

  async match(request: RequestInfo | URL) {
    for (const cache of this.caches.values()) {
      const res = await cache.match(request);
      if (res) return res;
    }
    return null;
  }
}

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'caches', {
    writable: true,
    value: new MockCacheStorage(),
  });
}

// 6. Polyfill scrollTo, scrollIntoView
if (typeof Element !== 'undefined' && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = vi.fn();
}
if (typeof window !== 'undefined' && !window.scrollTo) {
  window.scrollTo = vi.fn();
}

// 7. Mock fetch for API calls in App
const mockPortalStatePayload = {
  departments: mockDepartments,
  employees: mockEmployees,
  shiftConfig: mockShiftConfig,
  otTrendData: mockOtTrendData,
  vesselSchedules: mockVesselSchedules,
  leaveRecords: mockLeaveRecords,
  accounts: [
    {
      id: "acc-admin",
      username: "admin",
      name: "คุณสิทธิศักดิ์ พ.",
      role: "ผู้ดูแลระบบ",
      deptId: "all",
      canBackup: true
    }
  ],
  otRequests: []
};

global.fetch = vi.fn().mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === 'string' ? input : input.toString();

  if (url.includes('/api/portal-state')) {
    return new Response(JSON.stringify(mockPortalStatePayload), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (url.includes('/api/leave-records')) {
    return new Response(JSON.stringify(mockLeaveRecords), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (url.includes('/api/ot-records')) {
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (url.includes('/api/vessel-schedules')) {
    return new Response(JSON.stringify(mockVesselSchedules), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (url.includes('/api/job-value')) {
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
});

// 8. Reset localStorage and mocks before each test
beforeEach(() => {
  localStorage.clear();
  localStorage.setItem("adminLoggedIn", "true");
  localStorage.setItem("currentUser", JSON.stringify({
    username: "admin",
    name: "คุณสิทธิศักดิ์ พ.",
    role: "ผู้ดูแลระบบ",
    deptId: "all"
  }));
  vi.clearAllMocks();
});
