import { beforeEach, describe, expect, it, vi } from "vitest";
import { type ServiceDefinition, ServiceMeshClient, ServiceRegistry } from "./communication";

describe("Service Mesh Communication", () => {
  let registry: ServiceRegistry;
  let client: ServiceMeshClient;

  beforeEach(() => {
    registry = new ServiceRegistry();
    client = new ServiceMeshClient(registry);
  });

  describe("Service Registry", () => {
    it("should register and discover services", () => {
      const service: ServiceDefinition = {
        name: "test-service",
        version: "1.0.0",
        endpoints: ["create", "update", "delete"],
        healthCheck: "/health",
        metadata: { domain: "testing" },
      };

      registry.register(service);
      const discovered = registry.discover("test-service");

      expect(discovered).toEqual(service);
    });

    it("should return undefined for non-existent services", () => {
      const discovered = registry.discover("non-existent");
      expect(discovered).toBeUndefined();
    });

    it("should list all registered services", () => {
      const service1: ServiceDefinition = {
        name: "service1",
        version: "1.0.0",
        endpoints: ["test"],
        healthCheck: "/health",
        metadata: {},
      };

      const service2: ServiceDefinition = {
        name: "service2",
        version: "1.0.0",
        endpoints: ["test"],
        healthCheck: "/health",
        metadata: {},
      };

      registry.register(service1);
      registry.register(service2);

      const services = registry.list();
      expect(services).toHaveLength(2);
      expect(services).toContainEqual(service1);
      expect(services).toContainEqual(service2);
    });
  });

  describe("Service Mesh Client", () => {
    beforeEach(() => {
      const testService: ServiceDefinition = {
        name: "test-service",
        version: "1.0.0",
        endpoints: ["create", "update"],
        healthCheck: "/health",
        metadata: { domain: "testing" },
      };
      registry.register(testService);
    });

    it("should make successful service calls", async () => {
      const response = await client.call("test-service", "create", { data: "test" });

      expect(response.success).toBe(true);
      expect(response.requestId).toBeDefined();
      expect(response.metadata.service).toBe("test-service");
      expect(response.metadata.processingTime).toBeGreaterThan(0);
    });

    it("should handle service not found errors", async () => {
      await expect(client.call("non-existent-service", "create", { data: "test" })).rejects.toThrow(
        "Service not found: non-existent-service"
      );
    });

    it("should include correlation ID in requests", async () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      await client.call(
        "test-service",
        "create",
        { data: "test" },
        {
          correlationId: "test-correlation-id",
        }
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Inter-service call: test-service.create"),
        expect.objectContaining({
          correlationId: "test-correlation-id",
        })
      );

      consoleSpy.mockRestore();
    });

    it("should handle service call timeouts", async () => {
      // Mock a slow service call
      const originalMakeRequest = (client as ServiceMeshClient & { makeRequest: unknown })
        .makeRequest;
      (client as ServiceMeshClient & { makeRequest: unknown }).makeRequest = vi
        .fn()
        .mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 200)));

      const response = await client.call(
        "test-service",
        "create",
        { data: "test" },
        {
          timeout: 100,
        }
      );

      expect(response.success).toBe(false);
      expect(response.error).toBe("Service call timeout");

      // Restore original method
      (client as ServiceMeshClient & { makeRequest: unknown }).makeRequest = originalMakeRequest;
    });

    it("should implement circuit breaker pattern", async () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      // Mock failing service calls
      const originalMakeRequest = (client as ServiceMeshClient & { makeRequest: unknown })
        .makeRequest;
      (client as ServiceMeshClient & { makeRequest: unknown }).makeRequest = vi
        .fn()
        .mockRejectedValue(new Error("Service error"));

      // Make multiple calls to trigger circuit breaker
      for (let i = 0; i < 5; i++) {
        await client.call("test-service", "create", { data: "test" });
      }

      // Next call should fail immediately due to circuit breaker
      await expect(client.call("test-service", "create", { data: "test" })).rejects.toThrow(
        "Circuit breaker is OPEN for service: test-service"
      );

      // Restore original method
      (client as ServiceMeshClient & { makeRequest: unknown }).makeRequest = originalMakeRequest;
      consoleSpy.mockRestore();
    });
  });
});
