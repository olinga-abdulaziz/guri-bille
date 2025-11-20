import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-get-random-values"; // Required for uuid on some platforms
import { SafeAreaProvider } from "react-native-safe-area-context";
import { v4 as uuidv4 } from "uuid";

// Key for AsyncStorage
const USER_ID_KEY = "unique_user_id";

export default function RootLayout() {
  
  useEffect(() => {
    // Function to check, generate, and store the unique ID
    const ensureUniqueUserId = async () => {
      try {
        // 1. Check if an ID already exists
        const existingId = await AsyncStorage.getItem(USER_ID_KEY);

        if (existingId) {
          // ID exists, no need to generate or store a new one
          console.log("Existing User ID found:", existingId);
          return;
        }

        // 2. ID does not exist, generate a new unique ID
        const newId = uuidv4(); 

        // 3. Save the new ID to AsyncStorage
        await AsyncStorage.setItem(USER_ID_KEY, newId);
        console.log("New unique User ID generated and saved:", newId);

      } catch (error) {
        // Handle potential errors during AsyncStorage operations
        console.error("Error managing unique User ID:", error);
      }
    };

    // Run the function when the component mounts (the app opens/reloads)
    ensureUniqueUserId();
  }, []); // The empty dependency array [] ensures this runs only ONCE when the component mounts.

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack>
        <Stack.Screen name="index" options={{ title: "Index", headerShown: false }} />
        <Stack.Screen name="home" options={{ title: "Home", headerShown: false }} />
        <Stack.Screen name="properties" options={{ title: "House",headerShown: false}} />
        <Stack.Screen name="propertyDetails" options={{headerShown: false}} />
      </Stack>
    </SafeAreaProvider>
  );
}