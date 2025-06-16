// Service mesh communication - standalone implementation

// Service mesh communication layer for inter-service communication
export interface ServiceRequest<T = unknown> {
  requestId: string;
  service: string;
  method: string;
  payload: T;
  metadata: {
    userId?: string;
    correlationId?: string;
    timestamp: Date;
    retryCount: number;
  };
}

export interface ServiceResponse<T = unknown> {
  requestId: string;
  success: boolean;
  data?: T;
  error?: string;
  metadata: {
    processingTime: number;
    service: string;
    timestamp: Date;
  };
}

// Service registry for discovering available services
export class ServiceRegistry {
  private services = new Map<string, ServiceDefinition>();

  register(service: ServiceDefinition): void {
    this.services.set(service.name, service);
    console.log(`Service registered: ${service.name}`);
  }

  discover(serviceName: string): ServiceDefinition | undefined {
    return this.services.get(serviceName);
  }

  list(): ServiceDefinition[] {
    return Array.from(this.services.values());
  }
}

export interface ServiceDefinition {
  name: string;
  version: string;
  endpoints: string[];
  healthCheck: string;
  metadata: Record<string, unknown>;
}

// Service mesh client for making inter-service calls
export class ServiceMeshClient {
  constructor(private registry: ServiceRegistry) {}

  async call<TRequest, TResponse>(
    serviceName: string,
    method: string,
    payload: TRequest,
    options: {
      userId?: string;
      correlationId?: string;
      timeout?: number;
      retries?: number;
    } = {}
  ): Promise<ServiceResponse<TResponse>> {
    const service = this.registry.discover(serviceName);
    if (!service) {
      throw new Error(`Service not found: ${serviceName}`);
    }

    const request: ServiceRequest<TRequest> = {
      requestId: crypto.randomUUID(),
      service: serviceName,
      method,
      payload,
      metadata: {
        userId: options.userId,
        correlationId: options.correlationId || crypto.randomUUID(),
        timestamp: new Date(),
        retryCount: 0,
      },
    };

    const startTime = Date.now();

    try {
      // Simulate service call with circuit breaker pattern
      const response = await this.executeWithCircuitBreaker(
        serviceName,
        () => this.makeRequest<TRequest, TResponse>(request),
        options.timeout || 5000
      );

      const processingTime = Date.now() - startTime;

      return {
        requestId: request.requestId,
        success: true,
        data: response,
        metadata: {
          processingTime,
          service: serviceName,
          timestamp: new Date(),
        },
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;

      return {
        requestId: request.requestId,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        metadata: {
          processingTime,
          service: serviceName,
          timestamp: new Date(),
        },
      };
    }
  }

  private async executeWithCircuitBreaker<T>(
    serviceName: string,
    operation: () => Promise<T>,
    timeout: number
  ): Promise<T> {
    // Simple circuit breaker implementation
    const circuitState = this.getCircuitState(serviceName);

    if (circuitState === "OPEN") {
      throw new Error(`Circuit breaker is OPEN for service: ${serviceName}`);
    }

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("Service call timeout")), timeout);
    });

    try {
      const result = await Promise.race([operation(), timeoutPromise]);
      this.recordSuccess(serviceName);
      return result;
    } catch (error) {
      this.recordFailure(serviceName);
      throw error;
    }
  }

  private async makeRequest<TRequest, TResponse>(
    request: ServiceRequest<TRequest>
  ): Promise<TResponse> {
    // Simulate network call with random delay
    await new Promise((resolve) => setTimeout(resolve, 100 + Math.random() * 200));

    // Simulate occasional failures
    if (Math.random() < 0.05) {
      throw new Error("Service temporarily unavailable");
    }

    console.log(`Inter-service call: ${request.service}.${request.method}`, {
      requestId: request.requestId,
      correlationId: request.metadata.correlationId,
    });

    // Mock response
    return {} as TResponse;
  }

  private circuitStates = new Map<
    string,
    { state: "CLOSED" | "OPEN" | "HALF_OPEN"; failures: number; lastFailure?: Date }
  >();

  private getCircuitState(serviceName: string): "CLOSED" | "OPEN" | "HALF_OPEN" {
    const circuit = this.circuitStates.get(serviceName);
    if (!circuit) {
      this.circuitStates.set(serviceName, { state: "CLOSED", failures: 0 });
      return "CLOSED";
    }

    // Auto-recovery logic
    if (circuit.state === "OPEN" && circuit.lastFailure) {
      const timeSinceLastFailure = Date.now() - circuit.lastFailure.getTime();
      if (timeSinceLastFailure > 60000) {
        // 1 minute recovery window
        circuit.state = "HALF_OPEN";
      }
    }

    return circuit.state;
  }

  private recordSuccess(serviceName: string): void {
    const circuit = this.circuitStates.get(serviceName);
    if (circuit) {
      circuit.failures = 0;
      circuit.state = "CLOSED";
    }
  }

  private recordFailure(serviceName: string): void {
    const circuit = this.circuitStates.get(serviceName) || {
      state: "CLOSED" as const,
      failures: 0,
    };
    circuit.failures++;
    circuit.lastFailure = new Date();

    // Open circuit after 5 failures
    if (circuit.failures >= 5) {
      circuit.state = "OPEN";
    }

    this.circuitStates.set(serviceName, circuit);
  }
}

// Global service registry and mesh client
export const serviceRegistry = new ServiceRegistry();
export const serviceMeshClient = new ServiceMeshClient(serviceRegistry);

// Register core services
serviceRegistry.register({
  name: "task",
  version: "1.0.0",
  endpoints: ["create", "update", "complete", "delete", "list"],
  healthCheck: "/health",
  metadata: { domain: "task-management" },
});

serviceRegistry.register({
  name: "mood",
  version: "1.0.0",
  endpoints: ["create", "list", "delete"],
  healthCheck: "/health",
  metadata: { domain: "mood-tracking" },
});

serviceRegistry.register({
  name: "habits",
  version: "1.0.0",
  endpoints: ["create", "update", "delete", "list", "addEntry"],
  healthCheck: "/health",
  metadata: { domain: "habit-tracking" },
});

serviceRegistry.register({
  name: "analytics",
  version: "1.0.0",
  endpoints: ["track", "query", "insights"],
  healthCheck: "/health",
  metadata: { domain: "analytics" },
});

serviceRegistry.register({
  name: "tagging",
  version: "1.0.0",
  endpoints: ["apply", "suggest", "remove"],
  healthCheck: "/health",
  metadata: { domain: "tagging" },
});

serviceRegistry.register({
  name: "insights",
  version: "1.0.0",
  endpoints: ["compute", "get", "schedule"],
  healthCheck: "/health",
  metadata: { domain: "insights" },
});
