import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { apiFetch } from './apiClient';
import { getStoredAuth } from '../utils/auth';
import { haversineDistanceKm } from './foodHelpers';

// Free APIs — no key required
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';
const USER_AGENT = 'TripMateApp/1.0';

const SAVED_HOTELS_KEY = 'bapi_saved_hotels';
const SAVED_TICKETS_KEY = 'bapi_saved_tickets';
const SAVED_FOOD_KEY = 'bapi_saved_food';
const SAVED_SPOTS_KEY = 'bapi_saved_spots';
const DEST_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const HOTEL_CACHE_TTL_MS = 12 * 60 * 60 * 1000;
const AS_DEST_PREFIX = 'osm_dest_';
const AS_HOTEL_PREFIX = 'osm_hotels_';
const AS_FOOD_PREFIX = 'osm_food_';

interface SearchHotelsParams {
  destId: string;
  searchType?: string;
  checkinDate?: string;
  checkoutDate?: string;
  adults?: number;
  locale?: string;
  currency?: string;
}

interface GetHotelDetailsParams {
  hotelId: string;
  checkinDate?: string;
  checkoutDate?: string;
  adults?: number;
  locale?: string;
  currency?: string;
}

interface SaveHotelPlanParams {
  hotel: any;
  checkin: string;
  checkout: string;
}

interface SaveTicketPlanParams {
  ticket: any;
  destination?: string;
  tripStartDate?: string;
  tripEndDate?: string;
}

type PlanItemType = 'hotel' | 'ticket' | 'food' | 'other';

interface SaveFoodPlanParams {
  place: any;
  destination?: string;
}

interface PlanItemPayload {
  [key: string]: any;
}

interface CacheEntry<T> {
  value: T;
  timestamp: number;
}

// In-memory caches
const memDestCache = new Map<string, any>();
const memHotelCache = new Map<string, any[]>();
const memHotelById = new Map<string, any>();
const memFoodCache = new Map<string, any[]>();
const memSpotCache = new Map<string, any[]>();
const pendingDestRequests = new Map<string, Promise<any>>();
const pendingHotelRequests = new Map<string, Promise<any[]>>();
const pendingFoodRequests = new Map<string, Promise<any[]>>();
const pendingSpotRequests = new Map<string, Promise<any[]>>();

const BACKEND_PLAN_ITEMS_PATH = '/api/plan-items';

async function l2Get<T>(key: string, ttl: number): Promise<{ value: T; stale: boolean } | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    return { value: entry.value, stale: Date.now() - entry.timestamp > ttl };
  } catch {
    return null;
  }
}

async function l2Set<T>(key: string, value: T): Promise<void> {
  try {
    const entry: CacheEntry<T> = { value, timestamp: Date.now() };
    await AsyncStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // non-fatal
  }
}

const normalizeOsmElement = (element: any, fallbackCity?: string): any => {
  const tags = element.tags || {};
  const lat = element.lat ?? element.center?.lat;
  const lon = element.lon ?? element.center?.lon;
  const id = String(element.id || `${lat}_${lon}`);

  const streetParts = [tags['addr:housenumber'], tags['addr:street']].filter(Boolean);
  const address = streetParts.join(' ') || tags['addr:full'] || undefined;
  const city = tags['addr:city'] || tags['addr:town'] || fallbackCity;
  const website = tags.website || tags['contact:website'];

  return {
    hotel_id: id,
    hotel_name: tags.name || 'Unnamed Hotel',
    address,
    city,
    review_score: undefined,
    min_total_price: undefined,
    currency: undefined,
    url: website || undefined,
    phone: tags.phone || tags['contact:phone'] || undefined,
    lat,
    lon,
    stars: tags.stars || tags['tourism:stars'] || undefined,
    tourism_type: tags.tourism,
  };
};

export const buildReservationUrl = (hotel: any): string => {
  if (hotel?.url) return hotel.url;

  const hotelName = hotel?.hotel_name || hotel?.name || '';
  const city = hotel?.city || '';
  const searchText = city ? `${hotelName}, ${city}` : hotelName;

  if (searchText.trim()) {
    return `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(searchText)}`;
  }

  return 'https://www.booking.com';
};

const savePlanItemToBackend = async (params: {
  itemType: PlanItemType;
  destination?: string;
  tripStartDate?: string;
  tripEndDate?: string;
  payload: PlanItemPayload;
}): Promise<{ id: string } | null> => {
  const stored = await getStoredAuth();
  if (!stored?.userId) return null;

  try {
    const response = await apiFetch(BACKEND_PLAN_ITEMS_PATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: stored.userId,
        itemType: params.itemType,
        destination: params.destination,
        tripStartDate: params.tripStartDate,
        tripEndDate: params.tripEndDate,
        payload: params.payload,
      }),
    });

    if (!response.ok) return null;
    const data = await response.json();
    return { id: String(data.planItem?.id || '') };
  } catch {
    return null;
  }
};

export const saveHotelPlan = async ({ hotel, checkin, checkout }: SaveHotelPlanParams): Promise<void> => {
  const existingRaw = await AsyncStorage.getItem(SAVED_HOTELS_KEY);
  const existing = existingRaw ? JSON.parse(existingRaw) : [];

  const localId = `${hotel?.hotel_id || 'hotel'}-${Date.now()}`;
  const item = {
    id: localId,
    createdAt: Date.now(),
    checkin,
    checkout,
    hotel: {
      hotel_id: String(hotel?.hotel_id || ''),
      hotel_name: hotel?.hotel_name || 'Unknown hotel',
      address: hotel?.address,
      city: hotel?.city,
      currency: hotel?.currency,
      min_total_price: hotel?.min_total_price,
      review_score: hotel?.review_score,
      url: buildReservationUrl(hotel),
    },
  };

  const next = [item, ...existing];
  await AsyncStorage.setItem(SAVED_HOTELS_KEY, JSON.stringify(next));

  const backendResult = await savePlanItemToBackend({
    itemType: 'hotel',
    destination: hotel?.city,
    tripStartDate: checkin,
    tripEndDate: checkout,
    payload: item,
  });

  if (backendResult?.id) {
    const updated = [{ ...item, id: backendResult.id }, ...existing];
    await AsyncStorage.setItem(SAVED_HOTELS_KEY, JSON.stringify(updated));
  }
};

export const getSavedHotelPlans = async (): Promise<any[]> => {
  const stored = await getStoredAuth();
  if (stored?.userId) {
    try {
      const response = await apiFetch(`${BACKEND_PLAN_ITEMS_PATH}/${stored.userId}?type=hotel`);
      if (response.ok) {
        const data = await response.json();
        return Array.isArray(data.planItems) ? data.planItems : [];
      }
    } catch {
      // fallback to local
    }
  }

  try {
    const raw = await AsyncStorage.getItem(SAVED_HOTELS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveFoodPlan = async ({ place, destination }: SaveFoodPlanParams): Promise<void> => {
  const existingRaw = await AsyncStorage.getItem(SAVED_FOOD_KEY);
  const existing = existingRaw ? JSON.parse(existingRaw) : [];

  const localId = `food-${Date.now()}`;
  const item = {
    id: localId,
    createdAt: Date.now(),
    destination: destination || '',
    name: place.name || 'Unnamed place',
    address: place.address,
    city: place.city,
    lat: place.lat,
    lon: place.lon,
    tags: place.tags,
  };

  const next = [item, ...existing];
  await AsyncStorage.setItem(SAVED_FOOD_KEY, JSON.stringify(next));

  const backendResult = await savePlanItemToBackend({
    itemType: 'food',
    destination,
    payload: item,
  });

  if (backendResult?.id) {
    const updated = [{ ...item, id: backendResult.id }, ...existing];
    await AsyncStorage.setItem(SAVED_FOOD_KEY, JSON.stringify(updated));
  }
};

export const saveSpotPlan = async ({ place, destination }: SaveFoodPlanParams): Promise<void> => {
  const existingRaw = await AsyncStorage.getItem(SAVED_SPOTS_KEY);
  const existing = existingRaw ? JSON.parse(existingRaw) : [];

  const localId = `spot-${Date.now()}`;
  const item = {
    id: localId,
    createdAt: Date.now(),
    destination: destination || '',
    name: place.name || 'Unnamed place',
    address: place.address,
    city: place.city,
    lat: place.lat,
    lon: place.lon,
    tags: place.tags,
  };

  const next = [item, ...existing];
  await AsyncStorage.setItem(SAVED_SPOTS_KEY, JSON.stringify(next));

  const backendResult = await savePlanItemToBackend({
    itemType: 'spot',
    destination,
    payload: item,
  });

  if (backendResult?.id) {
    const updated = [{ ...item, id: backendResult.id }, ...existing];
    await AsyncStorage.setItem(SAVED_SPOTS_KEY, JSON.stringify(updated));
  }
};

export const getSavedSpotPlans = async (): Promise<any[]> => {
  const stored = await getStoredAuth();
  if (stored?.userId) {
    try {
      const response = await apiFetch(`${BACKEND_PLAN_ITEMS_PATH}/${stored.userId}?type=spot`);
      if (response.ok) {
        const data = await response.json();
        return Array.isArray(data.planItems) ? data.planItems : [];
      }
    } catch {
      // fallback to local
    }
  }

  try {
    const raw = await AsyncStorage.getItem(SAVED_SPOTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const deleteSavedSpotPlan = async (spotId: string): Promise<void> => {
  try {
    await deletePlanItemFromBackend(spotId);
    const raw = await AsyncStorage.getItem(SAVED_SPOTS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    const next = Array.isArray(parsed) ? parsed.filter((s: any) => s.id !== spotId) : [];
    await AsyncStorage.setItem(SAVED_SPOTS_KEY, JSON.stringify(next));
  } catch {
    // ignore errors
  }
};

export const getSavedFoodPlans = async (): Promise<any[]> => {
  const stored = await getStoredAuth();
  if (stored?.userId) {
    try {
      const response = await apiFetch(`${BACKEND_PLAN_ITEMS_PATH}/${stored.userId}?type=food`);
      if (response.ok) {
        const data = await response.json();
        return Array.isArray(data.planItems) ? data.planItems : [];
      }
    } catch {
      // fallback to local
    }
  }

  try {
    const raw = await AsyncStorage.getItem(SAVED_FOOD_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveTicketPlan = async ({
  ticket,
  destination,
  tripStartDate,
  tripEndDate,
}: SaveTicketPlanParams): Promise<void> => {
  const existingRaw = await AsyncStorage.getItem(SAVED_TICKETS_KEY);
  const existing = existingRaw ? JSON.parse(existingRaw) : [];

  const localId = `ticket-${Date.now()}`;
  const item = {
    id: localId,
    createdAt: Date.now(),
    destination,
    tripStartDate,
    tripEndDate,
    ...ticket,
  };

  const next = [item, ...existing];
  await AsyncStorage.setItem(SAVED_TICKETS_KEY, JSON.stringify(next));

  const backendResult = await savePlanItemToBackend({
    itemType: 'ticket',
    destination,
    tripStartDate,
    tripEndDate,
    payload: item,
  });

  if (backendResult?.id) {
    const updated = [{ ...item, id: backendResult.id }, ...existing];
    await AsyncStorage.setItem(SAVED_TICKETS_KEY, JSON.stringify(updated));
  }
};

export const getSavedTicketPlans = async (): Promise<any[]> => {
  const stored = await getStoredAuth();
  if (stored?.userId) {
    try {
      const response = await apiFetch(`${BACKEND_PLAN_ITEMS_PATH}/${stored.userId}?type=ticket`);
      if (response.ok) {
        const data = await response.json();
        return Array.isArray(data.planItems) ? data.planItems : [];
      }
    } catch {
      // fallback to local
    }
  }

  try {
    const raw = await AsyncStorage.getItem(SAVED_TICKETS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const deletePlanItemFromBackend = async (itemId: string): Promise<void> => {
  const stored = await getStoredAuth();
  if (!stored?.userId) return;
  try {
    await apiFetch(`${BACKEND_PLAN_ITEMS_PATH}/${itemId}`, { method: 'DELETE' });
  } catch {
    // ignore backend delete failure
  }
};

export const deleteSavedTicketPlan = async (ticketId: string): Promise<void> => {
  try {
    await deletePlanItemFromBackend(ticketId);
    const raw = await AsyncStorage.getItem(SAVED_TICKETS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    const next = Array.isArray(parsed) ? parsed.filter((ticket: any) => ticket.id !== ticketId) : [];
    await AsyncStorage.setItem(SAVED_TICKETS_KEY, JSON.stringify(next));
  } catch {
    // ignore errors silently
  }
};

export const deleteSavedHotelPlan = async (hotelId: string): Promise<void> => {
  try {
    await deletePlanItemFromBackend(hotelId);
    const raw = await AsyncStorage.getItem(SAVED_HOTELS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    const next = Array.isArray(parsed) ? parsed.filter((h: any) => h.id !== hotelId) : [];
    await AsyncStorage.setItem(SAVED_HOTELS_KEY, JSON.stringify(next));
  } catch {
    // ignore errors silently
  }
};

export const deleteSavedFoodPlan = async (foodId: string): Promise<void> => {
  try {
    const raw = await AsyncStorage.getItem(SAVED_FOOD_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    const next = Array.isArray(parsed) ? parsed.filter((f: any) => f.id !== foodId) : [];
    await AsyncStorage.setItem(SAVED_FOOD_KEY, JSON.stringify(next));
  } catch {
    // ignore errors silently
  }
};

export const getCityDestId = async (query: string): Promise<{ dest_id: string; search_type: string } | undefined> => {
  const memKey = query.trim().toLowerCase();
  const asKey = AS_DEST_PREFIX + memKey;

  if (memDestCache.has(memKey)) return memDestCache.get(memKey);
  const pending = pendingDestRequests.get(memKey);
  if (pending) return pending;

  const l2 = await l2Get<any>(asKey, DEST_CACHE_TTL_MS);
  if (l2 && !l2.stale) {
    memDestCache.set(memKey, l2.value);
    return l2.value;
  }

  const request = (async () => {
    try {
      const res = await axios.get(NOMINATIM_URL, {
        params: { q: query, format: 'json', limit: 5, addressdetails: 1 },
        headers: { 'User-Agent': USER_AGENT, 'Accept-Language': 'en' },
        timeout: 10000,
      });

      const results: any[] = Array.isArray(res.data) ? res.data : [];
      if (results.length === 0) {
        memDestCache.set(memKey, undefined);
        await l2Set(asKey, undefined);
        return undefined;
      }

      // Prefer city/place results over specific venues
      const cityResult = results.find(r =>
        ['city', 'town', 'village', 'municipality', 'administrative'].includes(r.type) ||
        r.class === 'place'
      );
      const best = cityResult || results[0];
      const bb = best.boundingbox; // [south, north, west, east]
      const cityName = best.display_name?.split(',')[0]?.trim() || query;

      // Store as "south,west,north,east" for Overpass
      const dest_id = bb
        ? `${bb[0]},${bb[2]},${bb[1]},${bb[3]},${encodeURIComponent(cityName)}`
        : `${best.lat},${best.lon},,, ${encodeURIComponent(cityName)}`;

      const destination = { dest_id, search_type: 'city' };
      memDestCache.set(memKey, destination);
      await l2Set(asKey, destination);
      return destination;
    } catch (error) {
      if (l2) return l2.value;
      throw new Error('Could not find this location. Check your internet connection and try again.');
    } finally {
      pendingDestRequests.delete(memKey);
    }
  })();

  pendingDestRequests.set(memKey, request);
  return request;
};

export const searchHotels = async ({ destId }: SearchHotelsParams): Promise<any[]> => {
  const memKey = destId;
  const asKey = AS_HOTEL_PREFIX + memKey;

  if (memHotelCache.has(memKey)) return memHotelCache.get(memKey)!;
  const pending = pendingHotelRequests.get(memKey);
  if (pending) return pending;

  const l2 = await l2Get<any[]>(asKey, HOTEL_CACHE_TTL_MS);
  if (l2 && !l2.stale) {
    memHotelCache.set(memKey, l2.value);
    l2.value.forEach(h => memHotelById.set(h.hotel_id, h));
    return l2.value;
  }

  // Parse dest_id: "south,west,north,east,cityName"
  const parts = destId.split(',');
  const south = parseFloat(parts[0]);
  const west = parseFloat(parts[1]);
  const north = parseFloat(parts[2]);
  const east = parseFloat(parts[3]);
  const cityName = parts[4] ? decodeURIComponent(parts[4]) : undefined;

  let overpassQuery: string;
  if ([south, west, north, east].every(isFinite)) {
    overpassQuery =
      `[out:json][timeout:25];` +
      `(node["tourism"~"^(hotel|hostel|motel|guest_house|apartment)$"](${south},${west},${north},${east});` +
      `way["tourism"~"^(hotel|hostel|motel|guest_house|apartment)$"](${south},${west},${north},${east}););` +
      `out center 50;`;
  } else {
    // Fallback: point with 10 km radius
    const lat = south;
    const lon = west;
    overpassQuery =
      `[out:json][timeout:25];` +
      `(node["tourism"~"^(hotel|hostel|motel|guest_house|apartment)$"](around:10000,${lat},${lon});` +
      `way["tourism"~"^(hotel|hostel|motel|guest_house|apartment)$"](around:10000,${lat},${lon}););` +
      `out center 50;`;
  }

  const request = (async () => {
    try {
      const res = await axios.post(
        OVERPASS_URL,
        `data=${encodeURIComponent(overpassQuery)}`,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': USER_AGENT,
          },
          timeout: 30000,
        }
      );

      const elements: any[] = res.data?.elements || [];
      const hotels = elements
        .map(el => normalizeOsmElement(el, cityName))
        .filter(h => h.hotel_name && h.hotel_name !== 'Unnamed Hotel');

      memHotelCache.set(memKey, hotels);
      hotels.forEach(h => memHotelById.set(h.hotel_id, h));
      await l2Set(asKey, hotels);
      return hotels;
    } catch (error) {
      if (l2) {
        memHotelCache.set(memKey, l2.value);
        l2.value.forEach(h => memHotelById.set(h.hotel_id, h));
        return l2.value;
      }
      throw new Error('Could not load hotels. Check your internet connection and try again.');
    } finally {
      pendingHotelRequests.delete(memKey);
    }
  })();

  pendingHotelRequests.set(memKey, request);
  return request;
};

export const searchFoodPlaces = async ({ destId }: { destId: string }): Promise<any[]> => {
  const memKey = destId;
  const asKey = AS_FOOD_PREFIX + memKey;

  if (memFoodCache.has(memKey)) return memFoodCache.get(memKey)!;
  const pending = pendingFoodRequests.get(memKey);
  if (pending) return pending;

  const l2 = await l2Get<any[]>(asKey, HOTEL_CACHE_TTL_MS);
  if (l2 && !l2.stale) {
    memFoodCache.set(memKey, l2.value);
    return l2.value;
  }

  // Parse dest_id: "south,west,north,east,cityName"
  const parts = destId.split(',');
  const south = parseFloat(parts[0]);
  const west = parseFloat(parts[1]);
  const north = parseFloat(parts[2]);
  const east = parseFloat(parts[3]);
  const cityName = parts[4] ? decodeURIComponent(parts[4]) : undefined;

  // compute center
  let centerLat: number | null = null;
  let centerLon: number | null = null;
  if ([south, west, north, east].every(isFinite)) {
    centerLat = (south + north) / 2;
    centerLon = (west + east) / 2;
  } else if (isFinite(south) && isFinite(west)) {
    centerLat = south;
    centerLon = west;
  }

  const amenityRegex = '^(restaurant|cafe|bar|fast_food|food_court|ice_cream|biergarten)$';

  let overpassQuery: string;
  if ([south, west, north, east].every(isFinite)) {
    overpassQuery =
      `[out:json][timeout:25];` +
      `(node["amenity"~"${amenityRegex}"](${south},${west},${north},${east});` +
      `way["amenity"~"${amenityRegex}"](${south},${west},${north},${east}););` +
      `out center 100;`;
  } else {
    const lat = centerLat || 0;
    const lon = centerLon || 0;
    overpassQuery =
      `[out:json][timeout:25];` +
      `(node["amenity"~"${amenityRegex}"](around:15000,${lat},${lon});` +
      `way["amenity"~"${amenityRegex}"](around:15000,${lat},${lon}););` +
      `out center 100;`;
  }

  const request = (async () => {
    try {
      const res = await axios.post(
        OVERPASS_URL,
        `data=${encodeURIComponent(overpassQuery)}`,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': USER_AGENT,
          },
          timeout: 30000,
        }
      );

      const elements: any[] = res.data?.elements || [];

      const places = elements
        .map(el => {
          const tags = el.tags || {};
          const lat = el.lat ?? el.center?.lat;
          const lon = el.lon ?? el.center?.lon;
          const id = String(el.id || `${lat}_${lon}`);
          const streetParts = [tags['addr:housenumber'], tags['addr:street']].filter(Boolean);
          const address = streetParts.join(' ') || tags['addr:full'] || undefined;
          const city = tags['addr:city'] || tags['addr:town'] || cityName;
          const name = tags.name || 'Unnamed place';

          const distance_km = centerLat != null && centerLon != null && isFinite(lat) && isFinite(lon)
            ? haversineDistanceKm(centerLat, centerLon, lat, lon)
            : null;

          return {
            id,
            name,
            address,
            city,
            lat,
            lon,
            tags,
            distance_km,
          };
        })
        .filter(p => p.name && p.name !== 'Unnamed place');

      // sort by distance if available
      places.sort((a, b) => {
        const aa = a.distance_km ?? Number.POSITIVE_INFINITY;
        const bb = b.distance_km ?? Number.POSITIVE_INFINITY;
        return aa - bb;
      });

      memFoodCache.set(memKey, places);
      await l2Set(asKey, places);
      return places;
    } catch (error) {
      if (l2) {
        memFoodCache.set(memKey, l2.value);
        return l2.value;
      }
      throw new Error('Could not load food places. Check your internet connection and try again.');
    } finally {
      pendingFoodRequests.delete(memKey);
    }
  })();

  pendingFoodRequests.set(memKey, request);
  return request;
};

export const searchSpots = async ({ destId }: { destId: string }): Promise<any[]> => {
  const memKey = destId;
  const asKey = 'osm_spots_' + memKey;

  if (memSpotCache.has(memKey)) return memSpotCache.get(memKey)!;
  const pending = pendingSpotRequests.get(memKey);
  if (pending) return pending;

  const l2 = await l2Get<any[]>(asKey, HOTEL_CACHE_TTL_MS);
  if (l2 && !l2.stale) {
    memSpotCache.set(memKey, l2.value);
    return l2.value;
  }

  // Parse dest_id: "south,west,north,east,cityName"
  const parts = destId.split(',');
  const south = parseFloat(parts[0]);
  const west = parseFloat(parts[1]);
  const north = parseFloat(parts[2]);
  const east = parseFloat(parts[3]);
  const cityName = parts[4] ? decodeURIComponent(parts[4]) : undefined;

  // compute center
  let centerLat: number | null = null;
  let centerLon: number | null = null;
  if ([south, west, north, east].every(isFinite)) {
    centerLat = (south + north) / 2;
    centerLon = (west + east) / 2;
  } else if (isFinite(south) && isFinite(west)) {
    centerLat = south;
    centerLon = west;
  }

  // attractions: tourism=attraction/museum/viewpoint, historic=*, leisure=park, natural=beach
  const tourismRegex = '^(attraction|museum|viewpoint)$';
  const historicRegex = '^(monument|archaeological_site|ruins|historic)$';

  let overpassQuery: string;
  if ([south, west, north, east].every(isFinite)) {
    overpassQuery =
      `[out:json][timeout:25];` +
      `(node["tourism"~"${tourismRegex}"](${south},${west},${north},${east});` +
      `way["tourism"~"${tourismRegex}"](${south},${west},${north},${east});` +
      `node["historic"](${south},${west},${north},${east});` +
      `way["historic"](${south},${west},${north},${east});` +
      `node["leisure"="park"](${south},${west},${north},${east});` +
      `way["leisure"="park"](${south},${west},${north},${east});` +
      `node["natural"="beach"](${south},${west},${north},${east});` +
      `way["natural"="beach"](${south},${west},${north},${east}););` +
      `out center 100;`;
  } else {
    const lat = centerLat || 0;
    const lon = centerLon || 0;
    overpassQuery =
      `[out:json][timeout:25];` +
      `(node["tourism"~"${tourismRegex}"](around:20000,${lat},${lon});` +
      `way["tourism"~"${tourismRegex}"](around:20000,${lat},${lon});` +
      `node["historic"](around:20000,${lat},${lon});` +
      `way["historic"](around:20000,${lat},${lon});` +
      `node["leisure"="park"](around:20000,${lat},${lon});` +
      `way["leisure"="park"](around:20000,${lat},${lon});` +
      `node["natural"="beach"](around:20000,${lat},${lon});` +
      `way["natural"="beach"](around:20000,${lat},${lon}););` +
      `out center 100;`;
  }

  const request = (async () => {
    try {
      const res = await axios.post(
        OVERPASS_URL,
        `data=${encodeURIComponent(overpassQuery)}`,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': USER_AGENT,
          },
          timeout: 30000,
        }
      );

      const elements: any[] = res.data?.elements || [];

      const places = elements
        .map(el => {
          const tags = el.tags || {};
          const lat = el.lat ?? el.center?.lat;
          const lon = el.lon ?? el.center?.lon;
          const id = String(el.id || `${lat}_${lon}`);
          const streetParts = [tags['addr:housenumber'], tags['addr:street']].filter(Boolean);
          const address = streetParts.join(' ') || tags['addr:full'] || undefined;
          const city = tags['addr:city'] || tags['addr:town'] || cityName;
          const name = tags.name || tags['historic'] || tags['tourism'] || 'Unnamed place';

          const distance_km = centerLat != null && centerLon != null && isFinite(lat) && isFinite(lon)
            ? haversineDistanceKm(centerLat, centerLon, lat, lon)
            : null;

          return {
            id,
            name,
            address,
            city,
            lat,
            lon,
            tags,
            distance_km,
          };
        })
        .filter(p => p.name && p.name !== 'Unnamed place');

      // sort by distance if available
      places.sort((a, b) => {
        const aa = a.distance_km ?? Number.POSITIVE_INFINITY;
        const bb = b.distance_km ?? Number.POSITIVE_INFINITY;
        return aa - bb;
      });

      memSpotCache.set(memKey, places);
      await l2Set(asKey, places);
      return places;
    } catch (error) {
      if (l2) {
        memSpotCache.set(memKey, l2.value);
        return l2.value;
      }
      throw new Error('Could not load spots. Check your internet connection and try again.');
    } finally {
      pendingSpotRequests.delete(memKey);
    }
  })();

  pendingSpotRequests.set(memKey, request);
  return request;
};

export const getHotelDetails = async ({ hotelId }: GetHotelDetailsParams): Promise<any> => {
  // OSM hotels already have all available info from the search result
  const cached = memHotelById.get(hotelId);
  if (cached) return cached;
  // Not in memory (e.g. after app restart) — return minimal so screen shows base data
  return { hotel_id: hotelId };
};
