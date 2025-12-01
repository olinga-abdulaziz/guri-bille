import { Ionicons } from "@expo/vector-icons";
import Constants from 'expo-constants';
import { ImageBackground } from "expo-image";
import { useRouter } from 'expo-router';
import { useEffect, useState } from "react";
import { Animated, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { BASE_URL } = Constants.expoConfig?.extra || {};

interface Location {
  id: number;
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
}

export default function Home() {
  const [selectedLocation, setSelectedLocation] = useState<{ id: number; name: string } | null>(null);
  const [selectedBedrooms, setSelectedBedrooms] = useState<number | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  interface BedroomOption {
    id: number;
    name: string;
    slug: string;
    type: string;
    group: string | null;
    parent_id: number | null;
    description: string | null;
    created_at: string;
    updated_at: string;
  }

  const [bedrooms, setBedrooms] = useState<BedroomOption[]>([]);

  const fetchBedrooms = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/taxonomies/room`);
      // if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();

      if (data.success && Array.isArray(data.data)) {
        setBedrooms(data.data);
      } else {
        console.warn('Unexpected response format for bedrooms:', data);
      }
    } catch (err) {
      console.error('Error fetching bedroom options:', err);
    }
  };

  const fetchLocations = async () => {
    setLoading(true);
    try {
      // Fetch both locations and bedrooms in parallel
      await Promise.all([
        (async () => {
          const response = await fetch(`${BASE_URL}/api/v1/locations?type=area`);
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          const data = await response.json();
          if (data.success && data.data) {
            const prioritizedId = 29;
            const sortedLocations = [...data.data].sort((a: Location, b: Location) => {
              if (a.id === prioritizedId) return -1;
              if (b.id === prioritizedId) return 1;
              return 0;
            });
            setLocations(sortedLocations);
          } else {
            setError('Failed to fetch locations');
          }
        })(),
        fetchBedrooms()
      ]);
    } catch (err) {
      setError('Error fetching data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  // --- Skeleton Loader Component ---
  const SkeletonLoader = () => {
    const opacity = new Animated.Value(0.3);
    useEffect(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    }, []);

    return (
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 15 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Animated.View
            key={i}
            style={{
              flex: 1,
              minWidth: "47%",
              height: 45,
              borderRadius: 10,
              backgroundColor: "#e0e0e0",
              opacity,
            }}
          />
        ))}
      </View>
    );
  };

  const handleBedroomSelect = (bedroom: BedroomOption) => {
    setSelectedBedrooms(bedroom.id);
  };

  const handleSearch = () => {
    if (!selectedLocation) return;

    const params: Record<string, string> = {
      locationId: selectedLocation.id.toString(),
    };

    if (selectedBedrooms !== null) {
      params.bedrooms = selectedBedrooms.toString();
      const selectedBedroomName = bedrooms.find(b => b.id === selectedBedrooms)?.name;
      if (selectedBedroomName) {
        params.bName = selectedBedroomName;
      }
    }

    router.push({
      pathname: "/properties",
      params: {
        ...params,
        bedrooms: selectedBedrooms?.toString() || ''
      },
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <ScrollView
        style={{
          flex: 1,
        }}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 40, // Add some padding at the bottom
        }}
        showsVerticalScrollIndicator={false}
      >

        {/* top banner */}
        <View style={{ height: 190 }}>
          <ImageBackground
            source={require("../assets/images/home.webp")}
            style={{
              width: "100%",
              height: "100%",
              borderBottomLeftRadius: 20,
              borderBottomRightRadius: 20,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(255, 254, 254, 0.6)",
                borderBottomLeftRadius: 20,
                borderBottomRightRadius: 20,
              }}
            />
            <Text style={{ fontSize: 25, fontWeight: "bold", color: "black", textAlign: "center", padding: 10 }}>
              GURI BILLE
            </Text>
            <Text
              style={{
                fontSize: 20,
                color: "#423938",
                textAlign: "center",
                padding: 15,
                marginTop: -10,
                marginBottom: 30
              }}
            >
              SO DHAWOW - RAADSO GURIGA AAD RABTO SI FUDUD MACAAMIIL
            </Text>
          </ImageBackground>
        </View>

        {/* body */}
        <View
          style={{
            flex: 1,
            backgroundColor: "white",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            width: "95%",
            alignSelf: "center",
            marginTop: -50,
            padding: 20,
          }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "white",
              borderTopLeftRadius: 30,
              borderTopRightRadius: 30,
              padding: 2,
            }}
          >
            <View>
              {/* location header */}
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Ionicons name="location" size={20} color="#109FC6" />
                <Text style={{ fontSize: 20, fontWeight: "bold", color: "rgba(0, 0, 0, 0.7)" }}>
                  Select Location
                </Text>
              </View>

              {/* Locations */}
              {loading ? (
                <SkeletonLoader />
              ) : error ? (
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
                  <Text style={{ color: "red" }}>{error}</Text>
                </View>
              ) : (
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 15 }}>
                  {locations.map((location, index) => (
                    <TouchableOpacity
                      key={location.id}
                      onPress={() => setSelectedLocation(location)}
                      style={{
                        flex: 1,
                        flexBasis: index === 0 ? "100%" : "47%",  // Make first one full width
                        paddingVertical: 12,
                        paddingHorizontal: 16,
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor:
                          selectedLocation?.id === location.id ? "#109FC6" : "rgba(0, 0, 0, 0.2)",
                        backgroundColor:
                          selectedLocation?.id === location.id ? "#109FC6" : "transparent",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: "900",
                          color:
                            selectedLocation?.id === location.id
                              ? "white"
                              : "rgba(0, 0, 0, 0.7)",
                          textAlign: "center",
                        }}
                      >
                        {location.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

              )}
            </View>

            {/* Bedrooms */}
            <View style={{ marginTop: 60 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Ionicons name="bed" size={20} color="#109FC6" />
                <Text style={{ fontSize: 20, fontWeight: "bold", color: "rgba(0, 0, 0, 0.7)" }}>
                  Number of Bedrooms
                </Text>
              </View>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 35 }}>
                {bedrooms.map((bedroom) => (
                  <TouchableOpacity
                    key={bedroom.id}
                    onPress={() => handleBedroomSelect(bedroom)}
                    style={{
                      backgroundColor:
                        selectedBedrooms === bedroom.id ? "#109FC6" : "#f5f5f5",
                      padding: 10,
                      borderRadius: 10,
                      minWidth: 80,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 18,
                        color: selectedBedrooms === bedroom.id ? "white" : "#333",
                        fontWeight: "900",
                      }}
                    >
                      {bedroom.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Search Button */}
            <View style={{ marginTop: 60 }}>
              <TouchableOpacity
                onPress={handleSearch}
                disabled={!selectedLocation || !selectedBedrooms}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  paddingVertical: 16,
                  paddingHorizontal: 20,
                  borderRadius: 10,
                  backgroundColor:
                    selectedLocation && selectedBedrooms ? "#109FC6" : "#cccccc",
                  opacity: selectedLocation && selectedBedrooms ? 1 : 0.7,
                }}
              >
                <Ionicons name="search" size={24} color="white" />
                <Text style={{ fontSize: 18, fontWeight: "bold", color: "white" }}>
                  RAADI GURIGA
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
