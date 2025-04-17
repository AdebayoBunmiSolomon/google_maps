import React, { useEffect, useRef, useState } from "react";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as Location from "expo-location";
import { LOCATION_TASK_NAME, setUpdateLocationHandler } from "./LocationTask";
import MapViewDirections from "react-native-maps-directions";

export default function App() {
  const mapRef = useRef<MapView | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [userLocation, setUserLocation] =
    useState<Location.LocationObjectCoords | null>(null);

  const destination = { latitude: 6.597631, longitude: 3.354084 }; // Allen, Ikeja-Lagos

  const startTracking = async () => {
    setLoading(true);
    try {
      const foreGround = await Location.requestForegroundPermissionsAsync();
      if (foreGround.status !== "granted") {
        Alert.alert(
          "Foreground Permission required",
          "Enable background location tracking."
        );
        return;
      }
      const { status } = await Location.requestBackgroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "Enable background location tracking."
        );
        return;
      }

      const hasStarted = await Location.hasStartedLocationUpdatesAsync(
        LOCATION_TASK_NAME
      );

      if (!hasStarted) {
        await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000, // every 5 seconds
          distanceInterval: 5, // every 5 meters
          showsBackgroundLocationIndicator: true, // iOS only
          foregroundService: {
            notificationTitle: "Tracking location",
            notificationBody:
              "Your location is being tracked in the background.",
          },
        });
        console.log("Background location tracking started");
      } else {
        console.log("Background location tracking already active");
        setLoading(false);
      }
    } catch (err) {
      console.error("Error starting background location tracking:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    setUpdateLocationHandler((coords) => {
      setUserLocation(coords);
    });

    startTracking();
  }, []);

  const focusMap = () => {
    if (userLocation) {
      mapRef?.current?.animateCamera(
        {
          center: {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
          },
          zoom: 15,
        },
        { duration: 1000 }
      );
    }
  };

  const initialRegion = {
    latitude: userLocation?.latitude ?? 37.33,
    longitude: userLocation?.longitude ?? -122,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        provider={PROVIDER_GOOGLE}
        showsUserLocation
        ref={mapRef}
        followsUserLocation={false}
        mapType='hybrid'>
        {userLocation && destination && (
          <>
            <Marker
              coordinate={{
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
              }}
              title='Location'
            />
            <Marker
              coordinate={{
                latitude: destination?.latitude,
                longitude: destination?.longitude,
              }}
              title='Destination'
            />
            <MapViewDirections
              origin={userLocation}
              destination={destination}
              apikey={""}
              strokeWidth={4}
              strokeColor='hotpink'
              onError={(err) => {
                console.error("Map directions error:", err);
              }}
              onReady={(result) => {
                console.log("Route distance:", result.distance, "km");
              }}
            />
          </>
        )}
      </MapView>
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={focusMap} style={styles.refocusBtn}>
          {loading ? (
            <ActivityIndicator size={"small"} color={"white"} />
          ) : (
            <Text style={styles.btnText}>Refocus</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {}}
          style={[
            styles.refocusBtn,
            {
              backgroundColor: "blue",
            },
          ]}>
          <Text style={styles.btnText}>Get Directions</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 10,
    paddingHorizontal: 10,
    width: "100%",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexDirection: "row",
  },
  refocusBtn: {
    backgroundColor: "red",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 15,
    width: "45%",
    justifyContent: "center",
    alignItems: "center",
  },
  btnText: {
    color: "white",
    fontSize: 15,
  },
});
