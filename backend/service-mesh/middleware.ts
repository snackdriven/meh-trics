import type { ServiceRequest, ServiceResponse } from "./communication";

// Custom error class to replace Encore APIError
class APIError extends Error {
  constructor(
    public code: number,
    message: string
  ) {
    super(message);
    this.name = "APIError";
  }
}

// Middleware for service mesh communication
export interface ServiceMiddleware {
  name: string;
  priority: number;
  before?: (request: ServiceRequest) => Promise<ServiceRequest>;
  after?: (request: ServiceRequest, response: ServiceResponse) => Promise<ServiceResponse>;
  onError?: (request: ServiceRequest, error: Error) => Promise<void>;
}

// Request correlation middleware
export const correlationMiddleware: ServiceMiddleware = {
  name: "correlation",
  priority: 100,
  before: async (request) => {
    if (!request.metadata.correlationId) {
      request.metadata.correlationId = crypto.randomUUID();
    }
    console.log(
      `[${request.metadata.correlationId}] Service request: ${request.service}.${request.method}`
    );
    return request;
  },
  after: async (request, response) => {
    console.log(
      `[${request.metadata.correlationId}] Service response: ${response.success ? "SUCCESS" : "ERROR"}`
    );
    return response;
  },
};

// Authentication middleware
export const authMiddleware: ServiceMiddleware = {
  name: "auth",
  priority: 90,
  before: async (request) => {
    if (!request.metadata.userId) {
      throw new APIError(401, "User authentication required");
    }

    // Validate user permissions for the service
    const hasPermission = await validateUserPermission(
      request.metadata.userId,
      request.service,
      request.method
    );

    if (!hasPermission) {
      throw new APIError(403, "Insufficient permissions");
    }

    return request;
  },
};

// Rate limiting middleware
export const rateLimitMiddleware: ServiceMiddleware = {
  name: "rateLimit",
  priority: 80,
  before: async (request) => {
    const userId = request.metadata.userId;
    const service = request.service;

    if (userId) {
      const allowed = await checkRateLimit(userId, service);
      if (!allowed) {
        throw new APIError(429, "Rate limit exceeded");
      }
    }

    return request;
  },
};

// Metrics collection middleware
export const metricsMiddleware: ServiceMiddleware = {
  name: "metrics",
  priority: 70,
  before: async (request) => {
    request.metadata.startTime = Date.now();
    return request;
  },
  after: async (request, response) => {
    const duration = Date.now() - (request.metadata.startTime || Date.now());

    // Collect metrics
    await recordServiceMetrics({
      service: request.service,
      method: request.method,
      success: response.success,
      duration,
      userId: request.metadata.userId,
      correlationId: request.metadata.correlationId,
    });

    return response;
  },
  onError: async (request, error) => {
    const duration = Date.now() - (request.metadata.startTime || Date.now());

    await recordServiceMetrics({
      service: request.service,
      method: request.method,
      success: false,
      duration,
      error: error.message,
      userId: request.metadata.userId,
      correlationId: request.metadata.correlationId,
    });
  },
};

// Caching middleware
export const cacheMiddleware: ServiceMiddleware = {
  name: "cache",
  priority: 60,
  before: async (request) => {
    // Check if this is a cacheable read operation
    if (isCacheableRequest(request)) {
      const cacheKey = generateCacheKey(request);
      const cachedResponse = await getCachedResponse(cacheKey);

      if (cachedResponse) {
        console.log(`Cache hit for ${request.service}.${request.method}`);
        // Return cached response directly
        throw new CacheHitResponse(cachedResponse);
      }
    }

    return request;
  },
  after: async (request, response) => {
    // Cache successful responses for cacheable requests
    if (isCacheableRequest(request) && response.success) {
      const cacheKey = generateCacheKey(request);
      const ttl = getCacheTTL(request.service, request.method);
      await setCachedResponse(cacheKey, response, ttl);
    }

    return response;
  },
};

// Middleware chain processor
export class MiddlewareChain {
  private middlewares: ServiceMiddleware[] = [];

  use(middleware: ServiceMiddleware): void {
    this.middlewares.push(middleware);
    this.middlewares.sort((a, b) => b.priority - a.priority);
  }

  async process<T, R>(
    request: ServiceRequest<T>,
    operation: (req: ServiceRequest<T>) => Promise<ServiceResponse<R>>
  ): Promise<ServiceResponse<R>> {
    let processedRequest = request;

    try {
      // Execute before middleware
      for (const middleware of this.middlewares) {
        if (middleware.before) {
          processedRequest = await middleware.before(processedRequest);
        }
      }

      // Execute the main operation
      let response = await operation(processedRequest);

      // Execute after middleware
      for (const middleware of this.middlewares.reverse()) {
        if (middleware.after) {
          response = await middleware.after(processedRequest, response);
        }
      }

      return response;
    } catch (error) {
      // Handle special cache hit case
      if (error instanceof CacheHitResponse) {
        return error.response;
      }

      // Execute error middleware
      for (const middleware of this.middlewares) {
        if (middleware.onError) {
          await middleware.onError(processedRequest, error as Error);
        }
      }

      throw error;
    }
  }
}

// Special exception for cache hits
class CacheHitResponse<T> extends Error {
  constructor(public response: ServiceResponse<T>) {
    super("Cache hit");
  }
}

// Utility functions
async function validateUserPermission(
  userId: string,
  service: string,
  method: string
): Promise<boolean> {
  // Mock permission validation
  console.log(`Validating permission for user ${userId} on ${service}.${method}`);
  return true; // Allow all for now
}

async function checkRateLimit(userId: string, service: string): Promise<boolean> {
  // Mock rate limiting (would use Redis or similar in production)
  const key = `rate_limit:${userId}:${service}`;
  console.log(`Checking rate limit for ${key}`);
  return Math.random() > 0.01; // 1% chance of rate limit hit
}

async function recordServiceMetrics(metrics: {
  service: string;
  method: string;
  success: boolean;
  duration: number;
  error?: string;
  userId?: string;
  correlationId?: string;
}): Promise<void> {
  console.log("Service metrics:", metrics);
  // Would send to metrics collection service
}

function isCacheableRequest(request: ServiceRequest): boolean {
  // Only cache read operations
  const readMethods = ["get", "list", "query", "search"];
  return readMethods.includes(request.method.toLowerCase());
}

function generateCacheKey(request: ServiceRequest): string {
  return `${request.service}:${request.method}:${JSON.stringify(request.payload)}`;
}

async function getCachedResponse<T>(key: string): Promise<ServiceResponse<T> | null> {
  // Mock cache lookup
  console.log(`Cache lookup: ${key}`);
  return null; // No cache hit for now
}

async function setCachedResponse<T>(
  key: string,
  _response: ServiceResponse<T>,
  ttl: number
): Promise<void> {
  console.log(`Caching response: ${key} (TTL: ${ttl}s)`);
  // Would store in Redis or similar
}

function getCacheTTL(service: string, method: string): number {
  // Default TTL configurations by service/method
  const ttlConfig: Record<string, Record<string, number>> = {
    analytics: { query: 300 }, // 5 minutes
    insights: { get: 1800 }, // 30 minutes
    habits: { list: 60 }, // 1 minute
    task: { list: 30 }, // 30 seconds
  };

  return ttlConfig[service]?.[method] || 60; // Default 1 minute
}

// Create and configure the global middleware chain
export const globalMiddlewareChain = new MiddlewareChain();
globalMiddlewareChain.use(correlationMiddleware);
globalMiddlewareChain.use(authMiddleware);
globalMiddlewareChain.use(rateLimitMiddleware);
globalMiddlewareChain.use(metricsMiddleware);
globalMiddlewareChain.use(cacheMiddleware);
