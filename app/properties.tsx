import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Animated,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { BASE_URL } = Constants.expoConfig?.extra || {};

type RouteParams = {
  locationId?: string;
  bedrooms?: string;
  bName?: string;
};

interface Property {
  id: number;
  unique_id: string;
  name: string;
  display_name: string | null;
  slug: string;
  location: {
    id: number;
    name: string;
    slug: string;
    group: string;
  };
  description: string;
  primary_photo: string;
  created_at: string;
  updated_at: string;
  room_cost?: number;
  room_billing_cycle?: string;
}

const SkeletonLoader = () => {
  const opacity = new Animated.Value(0.3);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={{ padding: 20 }}>
      {[1, 2, 3].map((_, index) => (
        <View
          key={index}
          style={{
            backgroundColor: "white",
            borderRadius: 15,
            marginBottom: 20,
            overflow: "hidden",
          }}
        >
          <Animated.View
            style={{
              height: 200,
              backgroundColor: "#e0e0e0",
              opacity,
            }}
          />
          <View style={{ padding: 15 }}>
            <Animated.View
              style={{
                height: 20,
                backgroundColor: "#e0e0e0",
                borderRadius: 10,
                marginBottom: 10,
                opacity,
              }}
            />
            <Animated.View
              style={{
                height: 15,
                width: "60%",
                backgroundColor: "#e0e0e0",
                borderRadius: 10,
                marginBottom: 15,
                opacity,
              }}
            />
            <Animated.View
              style={{
                height: 15,
                width: "90%",
                backgroundColor: "#e0e0e0",
                borderRadius: 10,
                marginBottom: 10,
                opacity,
              }}
            />
            <Animated.View
              style={{
                height: 40,
                backgroundColor: "#e0e0e0",
                borderRadius: 10,
                opacity,
              }}
            />
          </View>
        </View>
      ))}
    </View>
  );
};

export default function Properties() {
  const params = useLocalSearchParams<RouteParams>();
  const router = useRouter();
  const { locationId, bedrooms, bName } = params;

  const [properties, setProperties] = useState<Property[]>([]);
  const [zones, setZones] = useState<Array<{ id: number; name: string; slug: string }>>([]);

  // FIX: store full zone object, not just id
  const [selectedZone, setSelectedZone] = useState<{ id: number; name: string; slug: string } | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProperties = useCallback(
    async (zoneId?: number) => {
      const locationIdToUse = zoneId || locationId;
      if (!locationIdToUse) return;

      try {
        setLoading(true);
        setError(null);
        setProperties([]);

        const apiUrl = `${BASE_URL}/api/v1/houses?location_id=${locationIdToUse}${bedrooms ? `&bedroom_id=${bedrooms}` : ""
          }`;

        const response = await fetch(apiUrl);
        const responseText = await response.text();

        let data;
        try {
          data = JSON.parse(responseText);
        } catch (e) {
          console.error("Failed to parse API response:", responseText);
          throw new Error("Invalid response from server");
        }

        if (data?.success && data?.data) {
          if (data.data.houses) {
            setProperties(Array.isArray(data.data.houses) ? data.data.houses : []);
          }

          if (data.data.zones) {
            setZones(data.data.zones || []);
          }
        } else if (Array.isArray(data)) {
          setProperties(data);
        } else if (data?.data && Array.isArray(data.data)) {
          setProperties(data.data);
        } else {
          console.warn("Unexpected API response format:", data);
          setProperties([]);
        }
      } catch (err) {
        console.error("Error fetching properties:", err);
        setError(err instanceof Error ? err.message : "Failed to load properties");
        setProperties([]);
      } finally {
        setLoading(false);
      }
    },
    [locationId, bedrooms]
  );

  useEffect(() => {
    if (params.locationId) {
      fetchProperties();
    }
  }, [locationId, bedrooms, fetchProperties]);

  if (error) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <Text style={{ color: "red", marginBottom: 10, textAlign: "center" }}>
          {error}
        </Text>
        <TouchableOpacity
          onPress={() => fetchProperties()}
          style={{
            backgroundColor: "#109FC6",
            padding: 12,
            borderRadius: 8,
            paddingHorizontal: 20,
          }}
        >
          <Text style={{ color: "white", fontWeight: "600" }}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 20,
          paddingVertical: 15,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="#109FC6" />
          <Text style={{ fontSize: 18, fontWeight: "600", color: "#109FC6" }}>
            Houses
          </Text>
        </TouchableOpacity>
      </View>

      {/* Categories Section */}
      <View style={{ paddingVertical: 1, paddingLeft: 20 }}>
        <Text
          style={{
            fontSize: 18,
            fontWeight: "600",
            marginBottom: 10,
            color: "#333",
            marginLeft: 10,
          }}
        >
          Areas
        </Text>

        {/* Wrapped Buttons */}
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            paddingRight: 20,
            paddingBottom: 8,
          }}
        >
          {zones.map((zone) => {
            const isSelected = selectedZone?.id === zone.id;
            return (
              <TouchableOpacity
                key={zone.id}
                onPress={() => {
                  setSelectedZone(zone);
                  fetchProperties(zone.id);
                }}
                style={{
                  backgroundColor: isSelected ? "#109FC6" : "#e3f2fd",
                  paddingVertical: 6,
                  paddingHorizontal: 16,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: isSelected ? "#109FC6" : "#bbdefb",
                  marginRight: 8,
                  marginBottom: 8,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 1.5,
                  elevation: 2,
                }}
              >
                <Text
                  style={{
                    color: isSelected ? "white" : "black",
                    fontWeight: isSelected ? "900" : "500",
                    fontSize: 18,
                  }}
                >
                  {zone.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Body */}
      <ScrollView style={{ flex: 1 }}>
        {loading ? (
          <SkeletonLoader />
        ) : (
          <View
            style={{
              marginTop: 20,
              paddingHorizontal: 20,
            }}
          >
            {properties.length === 0 ? (
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  padding: 30,
                  backgroundColor: "#fff",
                  borderRadius: 15,
                  marginTop: 50,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                  marginHorizontal: 20,
                }}
              >
                <Ionicons
                  name="home-outline"
                  size={60}
                  color="#999"
                  style={{ marginBottom: 15 }}
                />
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "600",
                    color: "#333",
                    textAlign: "center",
                    marginBottom: 10,
                  }}
                >
                  No Properties Found
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: "#666",
                    textAlign: "center",
                    lineHeight: 20,
                  }}
                >
                  We couldn't find any properties matching your search.
                </Text>
                <TouchableOpacity
                  onPress={() => router.back()}
                  style={{
                    marginTop: 20,
                    backgroundColor: "#109FC6",
                    paddingVertical: 12,
                    paddingHorizontal: 24,
                    borderRadius: 8,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Ionicons name="arrow-back" size={18} color="#fff" />
                  <Text style={{ color: "#fff", fontWeight: "600" }}>
                    Back to Search
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                  rowGap: 20,
                }}
              >
                {properties.map((property) => (
                  <View
                    key={property.id}
                    style={{
                      width: "48%",
                      backgroundColor: "white",
                      borderRadius: 15,
                      overflow: "hidden",
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 3,
                    }}
                  >
                    {/* Image */}
                    <View style={{ height: 150, width: "100%" }}>
                      {property.primary_photo ? (
                        <Image
                          source={{
                            uri: `${BASE_URL}/${property.primary_photo}`,
                          }}
                          style={{
                            width: "100%",
                            height: "100%",
                            borderTopLeftRadius: 15,
                            borderTopRightRadius: 15,
                          }}
                          contentFit="cover"
                        />
                      ) : (
                        <View
                          style={{
                            flex: 1,
                            backgroundColor: "#f5f5f5",
                            justifyContent: "center",
                            alignItems: "center",
                            borderTopLeftRadius: 15,
                            borderTopRightRadius: 15,
                          }}
                        >
                          <Ionicons name="home" size={50} color="#ccc" />
                        </View>
                      )}
                    </View>

                    {/* Details */}
                    <View style={{ padding: 15 }}>
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: "600",
                          marginBottom: 8,
                          color: 'gray'
                        }}
                      >
                        {property.unique_id}
                      </Text>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 8,
                        }}
                      >
                        <Ionicons name="location" size={16} color="#109FC6" />
                        <Text style={{ fontSize: 14, }}>
                          {property.location?.name || "Location not specified"}
                        </Text>
                      </View>
                      {/* 
                    {property.description && (
                      <Text
                        style={{
                          fontSize: 14,
                          color: "#666",
                          marginBottom: 12,
                          lineHeight: 20,
                        }}
                        numberOfLines={2}
                      >
                        {property.description}
                      </Text>
                    )} */}
                      <View
                        style={{
                          // flexDirection: "row",
                          // alignItems: "center",
                          gap: 6,
                          marginBottom: 12,
                          backgroundColor: "#f8f9fa",
                          paddingVertical: 8,
                          paddingHorizontal: 12,
                          borderRadius: 8,
                          alignSelf: "flex-start",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 18,
                            fontWeight: "700",
                            color: "#2c3e50",
                          }}
                        >
                          Ksh. {property.room_cost?.toLocaleString()}
                        </Text>
                        <Text
                          style={{
                            fontSize: 14,
                            color: "#7f8c8d",
                            backgroundColor: "#e9ecef",
                            paddingHorizontal: 8,
                            paddingVertical: 2,
                            borderRadius: 4,
                          }}
                        >
                          {property.room_billing_cycle?.toLowerCase()}{" "}
                        </Text>
                      </View>

                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "bold",
                          color: "#109FC6",
                          marginBottom: 12,
                        }}
                      >
                        {bName}
                      </Text>

                      <TouchableOpacity
                        style={{
                          backgroundColor: "#109FC6",
                          paddingVertical: 12,
                          borderRadius: 10,
                          alignItems: "center",
                        }}
                        onPress={() => {
                          const params: any = { propertyId: property.id };
                          if (bedrooms) {
                            params.bedrooms = bedrooms;
                          }
                          router.push({
                            pathname: "/propertyDetails",
                            params,
                          });
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: "600",
                            color: "white",
                          }}
                        >
                          View Details
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
