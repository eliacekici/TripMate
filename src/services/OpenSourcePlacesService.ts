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
};

type Coordinates = {
    lat: number | null;
    lon: number | null;
};

// --- 2. Main Search Function ---

export const searchPlaces = async (city: string, limit = 10): Promise<Place[]> => {
    try {
        // Step 1: Get coordinates (Nominatim)
        const { lat, lon } = await getCityCoordinates(city);
        if (!lat || !lon) {
            console.warn('Could not find coordinates for city:', city);
            return [];
        }

        // Step 2 & 3: Fetch POIs (Overpass) and Wikipedia articles concurrently
        const [osmPlaces, wikiArticles] = await Promise.all([
            getOSMPlaces(lat, lon, limit),
            getWikipediaArticles(lat, lon, limit),
        ]);

        // Step 4: Combine the results
        return formatResults(osmPlaces, wikiArticles);
        
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

    // --- FIX START: Check status and parse safely ---
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
    // --- FIX END ---
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
        origin: '*' // Required for cross-domain requests
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

export const getPlacePhotoUrl = async (placeName: string): Promise<string | null> => {
    const WIKI_API_URL = 'https://en.wikipedia.org/w/api.php';
    
    // Clean up the name
    const searchQuery = placeName.split(/[\r\n,]/)[0].trim(); 

    // API query to get the primary image (thumbnail) for a page title
    const params = new URLSearchParams({
        action: 'query',
        titles: searchQuery,
        prop: 'pageimages', 
        pithumbsize: '400', 
        format: 'json',
        origin: '*', 
    });
    const url = `${WIKI_API_URL}?${params.toString()}`;

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'TripMateApp/1.0 (elia.cekici@gmail.com)' 
            }
        });
        
        if (!response.ok) {
            console.warn('Wikipedia PageImages API Error:', response.status, await response.text());
            return null;
        }

        const data = await response.json();
        
        if (data.query && data.query.pages) {
            const pages = Object.values(data.query.pages) as any[]; 
            
            // Check for the thumbnail URL
            if (pages.length > 0 && pages[0].thumbnail && pages[0].thumbnail.source) {
                return pages[0].thumbnail.source;
            }
        }
        return null;

    } catch (error) {
        console.error('Error fetching Wikipedia photo:', error);
        return null;
    }
};

// --- 4. Result Formatting ---

const formatResults = (osmPlaces: any[], wikiArticles: any[]): Place[] => {
    const combinedResults: Place[] = [];

    // Map OSM Places (POI data)
    osmPlaces.forEach((p, index) => {
        const categoryName = p.tags?.tourism || p.tags?.amenity || 'Landmark';
        let placeName = p.tags?.name;

        // Determine coordinates: Nodes use 'lat'/'lon'. Ways/Relations use 'center.lat'/'center.lon'
        const latitude = p.lat || p.center?.lat;
        const longitude = p.lon || p.center?.lon;
        
        // Only include the result if we have a name AND coordinates
        if (placeName && typeof latitude === 'number' && typeof longitude === 'number') {
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
                }
            });
        }
    });

    // Map Wikipedia Articles (Content data)
    wikiArticles.forEach((a, index) => {
        if (a.lat && a.lon) {
            combinedResults.push({
                fsq_id: `wiki-${a.pageid}`,
                name: a.title,
                categories: [{ name: 'Wikipedia Article' }],
                location: { address: `Distance: ${a.dist?.toFixed(0) || 'N/A'}m from center` },
                geocodes: {
                    main: {
                        latitude: a.lat,
                        longitude: a.lon,
                    }
                }
            });
        }
    });

    return combinedResults;
};