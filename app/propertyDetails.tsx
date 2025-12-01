import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Button, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// Get the base URL from environment variables
const { BASE_URL } = Constants.expoConfig?.extra || {};

interface RoomType {
  id: number;
  name: string;
  slug: string;
}

interface BillingCycle {
  id: number;
  name: string;
}

interface Availability {
  id: number;
  name: string;
}

interface Room {
  id: number;
  room_type: RoomType;
  cost: string;
  billing_cycle: BillingCycle;
  availability: Availability;
}

interface HouseDetails {
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
    parent_id: number;
  };
  description: string;
  base_url: string;
  created_at: string;
  updated_at: string;
  rooms: Room[];
  meta: {
    additional_photos: string[];
    amenities: string[];
    children_count: number;
    description: string;
    icon: string | null;
    is_featured: boolean;
    items_count: number;
    primary_photo: string;
  };
  whatsapp_number?: string | null;
  platform?: string | null;
  house_room_url?: string | null;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: HouseDetails;
}

type PropertyDetailsParams = {
propertyId: string;
} & Record<string, string | string[]>;

/**
 * Skeleton Component for the Property Details Screen
 */
const PropertyDetailsSkeleton = ({ width }: { width: number }) => (
    <SafeAreaView style={styles.container}>
        <View style={styles.header}>
            <View style={[styles.skeletonBlock, { width: 24, height: 24, borderRadius: 12 }]} />
            <View style={[styles.skeletonBlock, { width: 120, height: 18, marginLeft: 16 }]} />
        </View>

        <View style={styles.carouselContainer}>
            {/* Large Image Placeholder */}
            <View style={[styles.skeletonBlock, styles.largeCarouselImage, { width: '100%', height: 250, borderRadius: 10 }]} />
            
            {/* Thumbnails Placeholder */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.thumbnailScrollView}
                contentContainerStyle={styles.thumbnailContainer}
            >
                {[...Array(5)].map((_, index) => (
                    <View key={index} style={[styles.skeletonBlock, styles.thumbnailWrapper]} />
                ))}
            </ScrollView>
        </View>

        <View style={styles.detailsContainer}>
            {/* Property Name and Location */}
            <View style={[styles.skeletonBlock, styles.propertyName, { width: '80%', height: 24 }]} />
            <View style={[styles.locationContainer, { marginBottom: 16 }]}>
                <View style={[styles.skeletonBlock, { width: 16, height: 16, borderRadius: 8 }]} />
                <View style={[styles.skeletonBlock, { width: '40%', height: 16, marginLeft: 4 }]} />
            </View>

            <View style={styles.divider} />

            {/* About Section */}
            <View style={[styles.skeletonBlock, styles.sectionTitle, { width: '50%', height: 18 }]} />
            <View style={[styles.skeletonBlock, { width: '100%', height: 14, marginBottom: 8 }]} />
            <View style={[styles.skeletonBlock, { width: '90%', height: 14, marginBottom: 16 }]} />
            
            {/* Amenities Section */}
            <View style={[styles.skeletonBlock, styles.sectionTitle, { width: '40%', height: 18 }]} />
            <View style={styles.amenitiesContainer}>
                <View style={[styles.skeletonBlock, { width: 100, height: 16, marginRight: 16, marginBottom: 8 }]} />
                <View style={[styles.skeletonBlock, { width: 120, height: 16, marginRight: 16, marginBottom: 8 }]} />
                <View style={[styles.skeletonBlock, { width: 80, height: 16, marginBottom: 8 }]} />
            </View>

            <View style={styles.divider} />

            {/* Rooms Section */}
            <View style={[styles.skeletonBlock, styles.sectionTitle, { width: '60%', height: 18 }]} />
            <View style={[styles.skeletonBlock, styles.roomCard, { width: '100%', height: 90 }]} />
        </View>
    </SafeAreaView>
);

export default function PropertyDetails() {
const router = useRouter();
const { propertyId, bedrooms } = useLocalSearchParams<{ propertyId: string; bedrooms?: string }>();
const [selectedImage, setSelectedImage] = useState(0);
const thumbnailScrollViewRef = useRef<ScrollView | null>(null);
const { width } = useWindowDimensions();
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [property, setProperty] = useState<HouseDetails | null>(null);

useEffect(() => {
  console.log("propertyId: "+propertyId);
  if (bedrooms) {
    console.log("Selected bedrooms: " + bedrooms);
  }
    const getUniqueId = async () => {
  const stored = await AsyncStorage.getItem("unique_user_id");
  if (stored && typeof stored === 'string') {
    try {
      const parsed = JSON.parse(stored);
      return parsed._j || stored;
    } catch {
      return stored;
    }
  }
  return stored;
};
    
    const fetchPropertyDetails = async () => {
      const unique_id = await getUniqueId();
 try {
  setLoading(true);
  // pass unique_id to the api pass selected bedroom
  const response = await fetch(`${BASE_URL}/api/v1/houses/${propertyId}?bedroom_id=${bedrooms}&uuid=${unique_id}`);
  
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
  const text = await response.text();
  throw new Error(`Expected JSON but got ${contentType}`);
  }
  const data: ApiResponse = await response.json();
  if (!response.ok) {
  console.error('API Error Response:', data);
  throw new Error(data.message || 'Failed to fetch property details');
  }

  if (data.success) {
  setProperty(data.data);
  } else {
  setError(data.message || 'Failed to fetch property details');
  }
 } catch (err) {
  console.error('Error fetching property:', err);
  // setError(err.message || 'An error occurred while loading property details');
 } finally {
  // Optional: Add a small delay to showcase the skeleton effect
  // setTimeout(() => setLoading(false), 1500);
  setLoading(false);
 }
 };

 if (propertyId) {
 fetchPropertyDetails();
 }
}, [propertyId]);
  
const allImages = property ? [
 { uri: `${BASE_URL}/${property.meta.primary_photo}`, id: 'primary' },
 ...(property.meta.additional_photos?.map((photo, index) => ({
  uri: `${BASE_URL}/${photo}`,
  id: `additional-${index}`
 })) || [])
].filter(img => img.uri && !img.uri.endsWith('/undefined') && !img.uri.includes('null')) : [];


useEffect(() => {
 if (thumbnailScrollViewRef.current && allImages.length > 0) {
  const THUMBNAIL_SIZE = 70;
  const SPACING = 10;
  const offset = selectedImage * (THUMBNAIL_SIZE + SPACING) - width / 2 + THUMBNAIL_SIZE / 2;
   
  thumbnailScrollViewRef.current.scrollTo({
   x: offset,
   animated: true,
  });
 }
}, [selectedImage, width, property]);


if (loading) {
 return <PropertyDetailsSkeleton width={width} />;
}

if (error) {
 return (
 <View style={styles.errorContainer}>
  <Text style={styles.errorText}>{error}</Text>
  <Button title="Try Again" onPress={() => router.back()} />
 </View>
 );
}

if (!property) {
 return (
  <View style={styles.errorContainer}>
   <Text>No property found</Text>
  </View>
 );
}

const { meta, rooms } = property;

return (
 <SafeAreaView style={styles.container}>
 <ScrollView>
  {/* Header with back button */}
  <View style={styles.header}>
  <TouchableOpacity onPress={() => router.back()}>
   <Ionicons name="arrow-back" size={24} color="#000" />
  </TouchableOpacity>
  <Text style={styles.headerTitle}>House details</Text>
  </View>

  {/* Image Carousel Structure */}
  <View style={styles.carouselContainer}>
  {/* 1. Large Image Display */}
  {allImages.length > 0 && (
   <Image 
   source={{ uri: allImages[selectedImage].uri }} 
   style={styles.largeCarouselImage}
   contentFit="cover"
   transition={200}
   onError={(error) => {
    console.error('Image load error:', { uri: allImages[selectedImage].uri, error });
   }}
   />
  )}
  
  {/* 2. Horizontally Scrolling Thumbnails */}
  {allImages.length > 1 && (
   <ScrollView
   ref={thumbnailScrollViewRef}
   horizontal
   showsHorizontalScrollIndicator={false}
   style={styles.thumbnailScrollView}
   contentContainerStyle={styles.thumbnailContainer}
   >
   {allImages.map((image, index) => (
    <TouchableOpacity
    key={image.id}
    style={[
     styles.thumbnailWrapper,
     selectedImage === index && styles.thumbnailWrapperActive
    ]}
    onPress={() => setSelectedImage(index)}
    >
    <Image 
     source={{ uri: image.uri }} 
     style={styles.thumbnailImage}
     contentFit="cover"
    />
    </TouchableOpacity>
   ))}
   </ScrollView>
  )}
  </View>

  {/* Property Details */}
  <View style={styles.detailsContainer}>
  <Text style={styles.propertyName}>{property.unique_id}</Text>
  
  {/* Price Display - Moved to top */}
  {rooms.length > 0 && (
   <View style={styles.priceContainer}>
    <Text style={styles.priceText}>
     KES {parseFloat(rooms[0].cost).toLocaleString()} / {rooms[0].billing_cycle.name}
    </Text>
   </View>
  )}
  
  <View style={styles.locationContainer}>
   <Ionicons name="location" size={16} color="#666" />
   <Text style={styles.locationText}>{property.location.name}</Text>
  </View>
  <View style={styles.divider} />

  <Text style={styles.sectionTitle}>About this house</Text>
  <Text style={styles.descriptionText}>
   {property.description || 'No description available.'}
  </Text>

  {meta.amenities && meta.amenities.length > 0 && (
   <>
   <Text style={styles.sectionTitle}>Amenities</Text>
   <View style={styles.amenitiesContainer}>
    {meta.amenities.map((amenity, index) => (
    <View key={index} style={styles.amenityItem}>
     <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
     <Text style={styles.amenityText}>{amenity}</Text>
    </View>
    ))}
   </View>
   </>
  )}

  {rooms.length > 0 && (
   <>
   <View style={styles.divider} />
   {/* <Text style={styles.sectionTitle}>Available Rooms</Text> */}
   {/* <Text style={styles.sectionTitle}>ROOMS</Text> */}

   {rooms.map((room, index) => (
    <View key={index} style={styles.roomCard}>
    <Text style={styles.roomType}>{room.room_type.name}</Text>
    {rooms.length > 1 && (
     <Text style={styles.roomPrice}>
      KES {parseFloat(room.cost).toLocaleString()} / {room.billing_cycle.name}
     </Text>
    )}
    <Text style={styles.roomAvailability}>
     Status: {room.availability.name}
    </Text>
    </View>
   ))}
   </>
  )}
  <View style={styles.contactButtonsContainer}>
   <TouchableOpacity 
   style={styles.whatsappButton}
   onPress={async () => {
    if (!property) return;
    
    const whatsapp_number = property.whatsapp_number || '+254769210601';
    const platform =  'Guri Bille'; //property.platform ||
    const room_type_slug = property.rooms[0]?.room_type?.slug || 'room';
    const property_url = property.house_room_url || `${BASE_URL}/houses/${property.slug}`;
    const unique_id = await AsyncStorage.getItem("unique_user_id").then(stored => 
      stored
    ) || '';

    const message = `Hello, ${platform} I'm interested to know more about the availability of this apartment ${property_url}?b=${room_type_slug}&uid=${unique_id}`;
    const url = `whatsapp://send?phone=${whatsapp_number}&text=${encodeURIComponent(message)}`;
    Linking.openURL(url).catch(() => {
      Linking.openURL(`https://wa.me/${whatsapp_number}?text=${encodeURIComponent(message)}`);
    });
   }}
   >
   <Ionicons name="logo-whatsapp" size={20} color="#fff" />
   <Text style={styles.buttonText}>Contact on WhatsApp</Text>
   </TouchableOpacity>

   <TouchableOpacity
   style={styles.callButton}
   onPress={() => {
    if (!property) return;
    const call_number = property.whatsapp_number ?? '2547116733496';
    const phoneNumber = `tel:${call_number.startsWith('+') ? '' : '+'}${call_number}`;
    Linking.openURL(phoneNumber);
   }}
   >
   <Ionicons name="call" size={20} color="#fff" />
   <Text style={styles.buttonText}>Call Now</Text>
   </TouchableOpacity>
  </View>
  </View>
 </ScrollView>
 </SafeAreaView>
);
}

const styles = StyleSheet.create({
container: {
 flex: 1,
 backgroundColor: '#fff',
},
loadingContainer: {
 flex: 1,
 justifyContent: 'center',
 alignItems: 'center',
},
errorContainer: {
 flex: 1,
 justifyContent: 'center',
 alignItems: 'center',
 padding: 20,
},
errorText: {
 color: 'red',
 marginBottom: 20,
 textAlign: 'center',
},
header: {
 padding: 16,
 flexDirection: 'row',
 alignItems: 'center',
},
headerTitle: {
 marginLeft: 16,
 fontSize: 18,
 fontWeight: 'bold',
},
carouselContainer: {
 height: 350, 
 position: 'relative',
 marginBottom: 20,
 paddingHorizontal: 20,
},

largeCarouselImage: {
 width: '100%',
 height: 250,
 borderRadius: 10
},

thumbnailScrollView: {
 height: 80,
 paddingVertical: 10,
 backgroundColor: 'white',
},
thumbnailContainer: {
 paddingHorizontal: 16,
 gap: 10,
 alignItems: 'center',
},
thumbnailWrapper: {
 width: 70,
 height: 70,
 borderRadius: 8,
 overflow: 'hidden',
 borderWidth: 2,
 borderColor: 'transparent',
},
thumbnailWrapperActive: {
 borderColor: '#007AFF',
 borderWidth: 3,
},
thumbnailImage: {
 width: '100%',
 height: '100%',
 opacity: 0.7,
},

detailsContainer: {
 padding: 16,
},
propertyName: {
 fontSize: 24,
 fontWeight: 'bold',
 marginBottom: 8,
},
locationContainer: {
 flexDirection: 'row',
 alignItems: 'center',
 marginBottom: 8,
},
locationText: {
 marginLeft: 4,
 color: '#666',
},
divider: {
 height: 1,
 backgroundColor: '#eee',
 marginVertical: 16,
},
sectionTitle: {
 fontSize: 18,
 fontWeight: '600',
 marginBottom: 12,
},
descriptionText: {
 color: '#666',
 lineHeight: 22,
 marginBottom: 16,
},
amenitiesContainer: {
 flexDirection: 'row',
 flexWrap: 'wrap',
 marginBottom: 16,
},
amenityItem: {
 flexDirection: 'row',
 alignItems: 'center',
 marginRight: 16,
 marginBottom: 8,
},
amenityText: {
 marginLeft: 4,
},
roomCard: {
 backgroundColor: '#f9f9f9',
 borderRadius: 8,
 padding: 16,
 marginBottom: 16,
},
roomType: {
 fontSize: 16,
 fontWeight: '600',
 marginBottom: 8,
},
roomPrice: {
 fontSize: 14,
 fontWeight: '500',
 color: '#2E3A59',
 marginTop: 4,
 opacity: 0.8,
},
priceContainer: {
 backgroundColor: '#f8f9fa',
 padding: 12,
 borderRadius: 8,
 marginVertical: 12,
 borderLeftWidth: 4,
 borderLeftColor: '#4CAF50',
},
priceText: {
 fontSize: 20,
 fontWeight: 'bold',
 color: '#2E3A59',
},
roomAvailability: {
 color: '#666',
},
contactButtonsContainer: {
 marginTop: 16,
 gap: 12,
},
whatsappButton: {
 flexDirection: 'row',
 alignItems: 'center',
 justifyContent: 'center',
 backgroundColor: '#25D366',
 paddingVertical: 12,
 borderRadius: 8,
},
callButton: {
 flexDirection: 'row',
 alignItems: 'center',
 justifyContent: 'center',
 backgroundColor: '#f97316',
 paddingVertical: 12,
 borderRadius: 8,
},
buttonText: {
 color: '#fff',
 fontSize: 16,
 marginLeft: 8,
 fontWeight: '500',
},
    // **NEW SKELETON STYLE**
    skeletonBlock: {
        backgroundColor: '#e0e0e0', // Light grey color for the skeleton effect
        borderRadius: 4,
        marginBottom: 8,
    }
});