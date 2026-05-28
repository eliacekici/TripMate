# TripMate System Diagrams

These diagrams are inferred from the current codebase in TripMateApp. They focus on the app shell, the auth and trip-planning flows, and the backend/database boundary.

## UML Class Diagram

```mermaid
classDiagram
class App {
  +RootStackParamList
  +initialRoute
}

class NavigationContainer
class SafeAreaProvider

class DashboardGuides
class SearchScreen
class CityDetailsScreen
class LandmarkDetailsScreen
class LoginScreen
class SignUpScreen
class DashboardMyPlansScreen
class CreatingPlanEmptyScreen
class FlightTicketScannerScreen
class HotelSearchScreen
class HotelDetailsScreen
class MyPlansLoggedOutScreen
class SplashScreen
class OnboardingScreen_1
class OnboardingScreen_2

class apiClient {
  +apiFetch(path, init)
}

class apiBaseUrl {
  +getApiBaseUrls()
  +getApiBaseUrl()
}

class BookingApi {
  +getCityDestId(query)
  +searchHotels(params)
  +getHotelDetails(params)
  +saveHotelPlan(params)
  +getSavedHotelPlans()
  +buildReservationUrl(hotel)
}

class authUtils {
  +getStoredAuth()
  +clearAuth()
}

class BackendServer {
  +express app
  +listen(5000)
}

class AuthRoutes {
  +POST /signup
  +POST /login
}

class TripPlanRoutes {
  +POST /
  +GET /:userId
}

class DBPool {
  +query(sql, params)
}

class users
class trip_plans

App --> NavigationContainer
App --> SafeAreaProvider
App --> SplashScreen
App --> OnboardingScreen_1
App --> OnboardingScreen_2
App --> DashboardGuides
App --> SearchScreen
App --> CityDetailsScreen
App --> LandmarkDetailsScreen
App --> LoginScreen
App --> SignUpScreen
App --> DashboardMyPlansScreen
App --> CreatingPlanEmptyScreen
App --> FlightTicketScannerScreen
App --> HotelSearchScreen
App --> HotelDetailsScreen
App --> MyPlansLoggedOutScreen

LoginScreen --> apiClient
SignUpScreen --> apiClient
DashboardMyPlansScreen --> apiClient
DashboardMyPlansScreen --> authUtils
CreatingPlanEmptyScreen --> BookingApi
HotelSearchScreen --> BookingApi
HotelDetailsScreen --> BookingApi

apiClient --> apiBaseUrl
BackendServer --> AuthRoutes
BackendServer --> TripPlanRoutes
AuthRoutes --> DBPool
TripPlanRoutes --> DBPool
DBPool --> users
DBPool --> trip_plans
```

## Sequence Diagram

```mermaid
sequenceDiagram
autonumber
actor User
participant App as React Native App
participant Login as LoginScreen
participant API as apiFetch/apiClient
participant Server as Express backend
participant Auth as /api/auth
participant Plans as /api/trip-plans
participant DB as PostgreSQL
participant Storage as AsyncStorage

User->>Login: Enter email and password
Login->>API: POST /api/auth/login
API->>Server: HTTP request
Server->>Auth: login route
Auth->>DB: SELECT * FROM users WHERE email = $1
DB-->>Auth: user row
Auth->>Auth: bcrypt.compare(password, hash)
Auth->>Auth: jwt.sign(userId)
Auth-->>Server: 200 token + user
Server-->>API: response
API-->>Login: parsed JSON
Login->>Storage: Save userId and token
Login->>App: navigate to DashboardMyPlansScreen

User->>App: Start trip planning
App->>Plans: GET /api/trip-plans/:userId
Plans->>DB: SELECT * FROM trip_plans WHERE user_id = $1
DB-->>Plans: trip rows
Plans-->>App: trip list
App->>App: Navigate to CreatingPlanEmptyScreen if a trip exists
```

## Trip Planning and Hotel Save Flow

```mermaid
sequenceDiagram
autonumber
actor User
participant Dashboard as DashboardMyPlansScreen
participant TripAPI as /api/trip-plans
participant DB as PostgreSQL
participant PlanView as CreatingPlanEmptyScreen
participant HotelUI as HotelSearchScreen
participant Booking as BookingApi
participant OSM as Nominatim/Overpass
participant Store as AsyncStorage

User->>Dashboard: Enter destination and dates
Dashboard->>Dashboard: Validate destination with Nominatim
Dashboard->>TripAPI: POST /api/trip-plans
TripAPI->>DB: INSERT INTO trip_plans
DB-->>TripAPI: created trip row
TripAPI-->>Dashboard: tripPlan created
Dashboard->>PlanView: navigate(destination, dates)
PlanView->>Booking: getSavedHotelPlans()
Store-->>Booking: saved hotel plans
User->>PlanView: Open Hotel search
PlanView->>HotelUI: navigate(HotelSearchScreen)
HotelUI->>Booking: getCityDestId(query)
Booking->>OSM: Nominatim lookup
OSM-->>Booking: destination coordinates
Booking->>OSM: Overpass hotel search
OSM-->>Booking: hotel results
HotelUI->>Booking: saveHotelPlan(hotel, checkin, checkout)
Booking->>Store: persist hotel plan locally
```

## Entity-Relationship Diagram

```mermaid
erDiagram
  USERS {
    int id PK
    varchar email
    varchar password_hash
  }

  TRIP_PLANS {
    int id PK
    int user_id FK
    varchar destination
    date start_date
    date end_date
    text notes
  }

  USERS ||--o{ TRIP_PLANS : owns
```

## Notes

- The backend currently exposes only auth and trip-plan routes.
- Hotel saving is handled locally through AsyncStorage, not through the backend database.
- City and landmark discovery use public data sources through the `OpenSourcePlacesService` and the embedded map WebView.
