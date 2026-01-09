import { UNSPLASH_ACCESS_KEY, GEOAPIFY_API_KEY } from '@env';

// --- 1. Type Definitions ---
type Place = {
    fsq_id: string;
    name: string;
    categories: { name: string }[];
    location?: { address?: string };
    geocodes?: {
        main?: {
            latitude: number;
            longitude: number;
        };
    };
    distanceDetail: string;
};

type Coordinates = {
    lat: number | null;
    lon: number | null;
};

// --- 2. Main Search Function ---

export const searchAttractions = async (city: string, limit = 10): Promise<Place[]> => {
    try {
        // Step 1: Get city coordinates (Nominatim)
        const { lat: centerLat, lon: centerLon } = await getCityCoordinates(city);
        
        if (!centerLat || !centerLon) {
            console.warn('Could not find coordinates for city:', city);
            return [];
        }

        // Step 2 & 3: Fetch POIs (Overpass) and Wikipedia articles concurrently
        const [osmPlaces, wikiArticles] = await Promise.all([
            getOSMPlaces(centerLat, centerLon, limit),
            getWikipediaArticles(centerLat, centerLon, limit),
        ]);

        // Step 4: Combine and format results, passing the center coordinates for distance calculation
        return formatAttractionResults(osmPlaces, wikiArticles, centerLat, centerLon);
        
    } catch (error) {
        console.error('Error fetching places from open sources:', error);
        return [];
    }
};

export const searchFoodAndDrinks = async (city: string, limit = 10): Promise<Place[]> => {
    try {
        const { lat: centerLat, lon: centerLon } = await getCityCoordinates(city);
        
        if (!centerLat || !centerLon) return [];

        // Only fetch Geoapify data
        const geoapifyPlaces = await getGeoapifyPlaces(centerLat, centerLon, limit);

        // Format only Geoapify results
        return formatFoodAndDrinkResults(geoapifyPlaces, centerLat, centerLon);

    } catch (error) {
        console.error('Error fetching food and drinks:', error);
        return [];
    }
};

// --- 3. Helper Functions (API Calls) ---

const getCityCoordinates = async (city: string): Promise<Coordinates> => {
    const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
    const params = new URLSearchParams({
        q: city,
        format: 'json',
        limit: '1',
        extratags: '1', // Recommended by Nominatim policy
        addressdetails: '1', // Recommended by Nominatim policy
    });
    const url = `${NOMINATIM_URL}?${params.toString()}`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'TripMateApp/1.0 (elia.cekici@gmail.com)'
      }
    });
    if (!response.ok) {
        console.error('Nominatim API Error:', response.status, await response.text());
        return { lat: null, lon: null };
    }
    const data = await response.json();

    if (data && data.length > 0) {
        return { 
            lat: parseFloat(data[0].lat), 
            lon: parseFloat(data[0].lon) 
        };
    }
    return { lat: null, lon: null };
};


// --- 3. Helper Functions (API Calls) ---
const getOSMPlaces = async (lat: number, lon: number, limit: number): Promise<any[]> => {
    
    // Queries tourist attractions
    const query = `
        [out:json][timeout:60];
        nwr[tourism~"attraction|museum|viewpoint|zoo|theme_park"](around:2000,${lat},${lon});
        out ${limit} center;
    `;
    
    const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';
    
    const response = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        headers: {
            "Content-Type": "text/plain"
        },
        body: query
    });

    if (!response.ok) {
        const error = await response.text();
        console.error("Overpass API Error:", response.status, error);
        return [];
    }

    try {
        const data = await response.json();
        return data.elements || [];
    } catch (e) {
        console.error("Overpass JSON Parse Failed:", e);
        return [];
    }
};

const getWikipediaArticles = async (lat: number, lon: number, limit: number): Promise<any[]> => {
    const WIKI_URL = 'https://en.wikipedia.org/w/api.php';
    const params = new URLSearchParams({
        action: 'query',
        list: 'geosearch',
        gscoord: `${lat}|${lon}`,
        gsradius: '10000', // 10km radius
        gslimit: String(limit),
        format: 'json',
        origin: '*' 
    });
    const url = `${WIKI_URL}?${params.toString()}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'TripMateApp/1.0 (elia.cekici@gmail.com)'
      }
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error('Wikimedia API Error:', response.status, errorBody);
        return [];
    }
    
    try {
        const data = await response.json();
        return data.query?.geosearch || [];
    } catch (e) {
        console.error('Wikimedia JSON Parse Failed:', e);
        return [];
    }
};

const getGeoapifyPlaces = async (lat: number, lon: number, limit: number): Promise<any[]> => {
    if (!GEOAPIFY_API_KEY) {
        console.error("GEOAPIFY_API_KEY is missing from environment variables.");
        return [];
    }
    
    const GEOAPIFY_URL = 'https://api.geoapify.com/v2/places';
    
    // Categories for food and drink
    const categories = 'catering.restaurant,catering.cafe,catering.fast_food,catering.pub'; 

    const RADIUS_IN_METERS = 5000; // Search within 5km
    
    const params = new URLSearchParams({
        // Filter by circle: longitude, latitude, radius (meters)
        filter: `circle:${lon},${lat},${RADIUS_IN_METERS}`, 
        categories: categories,
        limit: String(limit),
        apiKey: GEOAPIFY_API_KEY, 
    });

    const url = `${GEOAPIFY_URL}?${params.toString()}`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            const error = await response.text();
            console.error("Geoapify API Error:", response.status, error);
            return [];
        }

        const data = await response.json();
        return data.features || [];
    } catch (e) {
        console.error("Geoapify Fetch Failed:", e);
        return [];
    }
};

// --- Helper Utilities (Photo, Distance) ---
export const getPlacePhotoUrl = async (placeName: string): Promise<string | null> => {
    const unsplashApiUrl = 'https://api.unsplash.com/search/photos';
    
    // 2. Set the parameters: query (the city name), and optional parameters
    const params = new URLSearchParams({
        query: placeName, 
        orientation: 'landscape', // Better for a header image
        per_page: '1', // We only need the first result
    });

    const url = `${unsplashApiUrl}?${params.toString()}`;

    try {
        const response = await fetch(url, {
            headers: {
                // Pass the Access Key as a Client-ID in the Authorization header
                Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
            },
        });

        if (!response.ok) {
            console.error('Unsplash API failed:', response.status);
            return null;
        }

        const data = await response.json();
        
        // Unsplash search returns an array of results. We want the first one.
        if (data.results && data.results.length > 0) {
            const photo = data.results[0];
            
            return photo.urls.regular; 
        }

        return null;

    } catch (error) {
        console.error('Error fetching Unsplash photo:', error);
        return null;
    }
};

/**
 * Calculates distance in meters between two coordinates using the Haversine formula.
 */
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; 
    const φ1 = lat1 * Math.PI / 180; 
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c; 
    return distance;
};

/**
 * Formats distance in meters to a readable string (e.g., "1.2 km from center" or "500 m from center").
 */
const formatDistance = (meters: number): string => {
    if (meters >= 1000) {
        return `${(meters / 1000).toFixed(1)} km from center`;
    }
    return `${meters.toFixed(0)} m from center`;
};


// --- 4. Result Formatting ---

const formatAttractionResults = (
    osmPlaces: any[], 
    wikiArticles: any[], 
    centerLat: number, 
    centerLon: number
): Place[] => {
    const combinedResults: Place[] = [];

    // 1. Map OSM Places (POI data) - Existing logic
    osmPlaces.forEach((p) => {
        const categoryName = p.tags?.tourism || p.tags?.amenity || 'Landmark';
        const placeName = p.tags?.name;
        const latitude = p.lat || p.center?.lat;
        const longitude = p.lon || p.center?.lon;
        
        if (placeName && typeof latitude === 'number' && typeof longitude === 'number') {
            const distanceInMeters = calculateDistance(centerLat, centerLon, latitude, longitude);
            
            combinedResults.push({
                fsq_id: `osm-${p.id}`,
                name: placeName,
                categories: [{ name: categoryName.replace(/_/g, ' ') }],
                location: { address: p.tags?.["addr:street"] || `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}` },
                geocodes: { main: { latitude, longitude } },
                distanceDetail: formatDistance(distanceInMeters),
            });
        }
    });

    // 2. Map Wikipedia Articles (Content data) - Existing logic
    wikiArticles.forEach((a) => {
        if (a.lat && a.lon) {
            const wikiDistanceInMeters = a.dist ? parseFloat(a.dist) : null;
            const distanceInMeters = wikiDistanceInMeters ?? calculateDistance(centerLat, centerLon, a.lat, a.lon);
            
            combinedResults.push({
                fsq_id: `wiki-${a.pageid}`,
                name: a.title,
                categories: [{ name: 'General Interest' }],
                location: { address: 'Wikipedia Article' }, 
                geocodes: { main: { latitude: a.lat, longitude: a.lon } },
                distanceDetail: formatDistance(distanceInMeters),
            });
        }
    });

    return combinedResults;
};

const formatFoodAndDrinkResults = (
    geoapifyPlaces: any[], 
    centerLat: number, 
    centerLon: number
): Place[] => {
    const combinedResults: Place[] = [];

    // 1. Map Geoapify Places (Food & Restaurants) - Existing logic
    geoapifyPlaces.forEach((feature) => {
        const p = feature.properties;
        const geometry = feature.geometry;
        
        const longitude = geometry.coordinates[0];
        const latitude = geometry.coordinates[1]; 
        
        if (p.name && typeof latitude === 'number' && typeof longitude === 'number') {
            
            const distanceInMeters = calculateDistance(centerLat, centerLon, latitude, longitude);
            const primaryCategory = p.categories?.[0] || 'Food & Drink'; 
            
            combinedResults.push({
                fsq_id: `geoapify-${p.place_id}`,
                name: p.name,
                categories: [{ name: primaryCategory.replace('catering.', '').replace(/_/g, ' ') }],
                location: { address: p.address_line2 || p.address_line1 || `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}` },
                geocodes: { main: { latitude, longitude } },
                distanceDetail: formatDistance(distanceInMeters),
            });
        }
    });

    return combinedResults;
};