import backend from "~backend/client";
import type { CreateTaskRequest, Task } from "~backend/task/types";
import { createOfflineQueue } from "./useOfflineQueue";

interface TaskQueueItem {
  type: "create";
  data: CreateTaskRequest;
}

const useTaskQueue = createOfflineQueue<TaskQueueItem>("offlineTasks", async (item) => {
  if (item.type === "create") {
    await backend.task.createTask(item.data);
  }
});

export function useOfflineTasks() {
  const { enqueue, pending, syncing, syncQueue } = useTaskQueue();

  const createTask = async (data: CreateTaskRequest): Promise<Task | undefined> => {
    if (navigator.onLine) {
      try {
        const task = await backend.task.createTask(data);
        return task;
      } catch {
        // fall back to queue
      }
    }
    await enqueue({ type: "create", data });
    return undefined;
  };

  return { createTask, pending, syncing, syncQueue };
}
