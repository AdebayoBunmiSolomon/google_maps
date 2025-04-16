import * as TaskManager from "expo-task-manager";
import * as Location from "expo-location";

export const LOCATION_TASK_NAME = "background-location-task";

let updateLocation: ((coords: Location.LocationObjectCoords) => void) | null =
  null;

export const setUpdateLocationHandler = (
  handler: (coords: Location.LocationObjectCoords) => void
) => {
  updateLocation = handler;
};

// ✅ Make the task function async to match the expected return type (Promise)
TaskManager.defineTask(
  LOCATION_TASK_NAME,
  async ({
    data,
    error,
  }: TaskManager.TaskManagerTaskBody<{
    locations: Location.LocationObject[];
  }>) => {
    if (error) {
      console.error("Background location error:", error);
      return;
    }

    if (data?.locations?.length) {
      const latestLocation = data.locations[0];
      const { latitude, longitude } = latestLocation.coords;

      console.log("📍 Background location:", latitude, longitude);

      if (updateLocation) {
        updateLocation(latestLocation.coords); // Push location to app state
      }
    }
  }
);
