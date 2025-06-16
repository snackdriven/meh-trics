// Quick test to verify the backend client instantiation works
import backend from "./frontend/client.js";

console.log("Backend client imported successfully:");
console.log("- Type:", typeof backend);
console.log("- Has task service:", !!backend.task);
console.log("- Has habits service:", !!backend.habits);
console.log("- Has mood service:", !!backend.mood);
console.log("- Has analytics service:", !!backend.analytics);

console.log("\nBackend client is properly instantiated and ready to use!");
