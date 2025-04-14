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

export default function App() {
  const mapRef = useRef<MapView | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [userLocation, setUserLocation] =
    useState<Location.LocationObjectCoords | null>(null);
  const locationSubscription = useRef<Location.LocationSubscription | null>(
    null
  );

  const getCurrentLocation = async () => {
    setLoading(true);
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Allow Location", "Please grant location permission");
        return;
      }

      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 2000, // update every 2 seconds
          distanceInterval: 5, // or every 5 meters moved
        },
        (location) => {
          console.log(location?.coords);
          setUserLocation(location.coords);
        }
      );

      locationSubscription.current = subscription;
    } catch (err: any) {
      console.log("Error", err);
      setLoading(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCurrentLocation();
    // Cleanup on unmount
    return () => {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
    };
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
        {userLocation && (
          <Marker
            coordinate={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            }}
          />
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
    bottom: 20,
    paddingRight: 20,
    width: "100%",
    justifyContent: "center",
    alignItems: "flex-end",
  },
  refocusBtn: {
    backgroundColor: "red",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 15,
    width: "60%",
    justifyContent: "center",
    alignItems: "center",
  },
  btnText: {
    color: "white",
    fontSize: 15,
  },
});
