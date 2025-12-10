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

export const searchPlaces = async (city: string, limit = 10): Promise<Place[]> => {
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
        return formatResults(osmPlaces, wikiArticles, centerLat, centerLon);
        
    } catch (error) {
        console.error('Error fetching places from open sources:', error);
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


const getOSMPlaces = async (lat: number, lon: number, limit: number): Promise<any[]> => {
    const query = `
        [out:json][timeout:20];
        (
          nwr[tourism~"attraction|museum|viewpoint|zoo|theme_park"](around:5000,${lat},${lon});
        );
        out ${limit} center;
    `;
    
    const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';
    
    const response = await fetch(OVERPASS_URL, {
        method: 'POST',
        body: `data=${encodeURIComponent(query)}`,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error('Overpass API Error:', response.status, errorBody);
        return [];
    }

    try {
        const data = await response.json();
        return data.elements || [];
    } catch (e) {
        console.error('Overpass JSON Parse Failed:', e);
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

import { UNSPLASH_ACCESS_KEY } from '@env';
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
            
            // Unsplash provides URLs in different sizes. 'regular' or 'small' is best for mobile
            // Make sure to use the 'hotlinked' URL and keep the ixid parameter.
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
    const R = 6371e3; // Earth's radius in meters
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

const formatResults = (osmPlaces: any[], wikiArticles: any[], centerLat: number, centerLon: number): Place[] => {
    const combinedResults: Place[] = [];

    // Map OSM Places (POI data)
    osmPlaces.forEach((p) => {
        const categoryName = p.tags?.tourism || p.tags?.amenity || 'Landmark';
        const placeName = p.tags?.name;

        // Determine coordinates
        const latitude = p.lat || p.center?.lat;
        const longitude = p.lon || p.center?.lon;
        
        if (placeName && typeof latitude === 'number' && typeof longitude === 'number') {
            
            // Calculate distance from the search center
            const distanceInMeters = calculateDistance(centerLat, centerLon, latitude, longitude);
            
            combinedResults.push({
                fsq_id: `osm-${p.id}`,
                name: placeName,
                categories: [{ name: categoryName.replace(/_/g, ' ') }],
                location: { address: p.tags?.["addr:street"] || `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}` },
                geocodes: {
                    main: {
                        latitude: latitude,
                        longitude: longitude,
                    }
                },
                // Second detail card: Calculated distance
                distanceDetail: formatDistance(distanceInMeters),
            });
        }
    });

    // Map Wikipedia Articles (Content data)
    wikiArticles.forEach((a) => {
        if (a.lat && a.lon) {
            
            // For Wikipedia, use the distance (a.dist) provided by the API if available, or calculate it
            const wikiDistanceInMeters = a.dist ? parseFloat(a.dist) : null;
            
            const distanceInMeters = wikiDistanceInMeters ?? calculateDistance(centerLat, centerLon, a.lat, a.lon);
            
            combinedResults.push({
                fsq_id: `wiki-${a.pageid}`,
                name: a.title,
                categories: [{ name: 'General Interest' }],
                location: { address: 'Wikipedia Article' }, 
                geocodes: {
                    main: {
                        latitude: a.lat,
                        longitude: a.lon,
                    }
                },
                // Second detail card: Calculated/formatted distance
                distanceDetail: formatDistance(distanceInMeters),
            });
        }
    });

    return combinedResults;
};