// Iran Locations API Integration
// This file will handle API calls to https://iran-locations-api.ir/api/v1/fa/states

// API Configuration
const IRAN_LOCATIONS_API = {
  BASE_URL: 'https://www.iran-locations-api.ir/api/v1/fa',
  ENDPOINTS: {
    STATES: '/states',
    CITIES: '/cities'
  }
};

// Cache for API responses
let apiCache = {
  states: null,
  cities: {}
};

// Function to fetch all states from API
async function fetchStatesFromAPI() {
  if (apiCache.states) {
    return apiCache.states;
  }

  try {
    const response = await fetch(`${IRAN_LOCATIONS_API.BASE_URL}${IRAN_LOCATIONS_API.ENDPOINTS.STATES}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const states = await response.json();
    
    // Transform API response to our format
    const formattedStates = states.map((state, index) => ({
      id: state.id || index + 1,
      name: state.name || state,
      original_id: state.id
    }));
    
    // Cache the result
    apiCache.states = formattedStates;
    
    console.log('✅ States loaded from API:', formattedStates.length);
    return formattedStates;
    
  } catch (error) {
    console.error('❌ Error fetching states from API:', error);
    throw error;
  }
}

// Function to fetch cities for a specific state from API
async function fetchCitiesFromAPI(stateId) {
  if (apiCache.cities[stateId]) {
    return apiCache.cities[stateId];
  }

  try {
    const response = await fetch(`${IRAN_LOCATIONS_API.BASE_URL}${IRAN_LOCATIONS_API.ENDPOINTS.CITIES}?state_id=${stateId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const cities = await response.json();
    
    // Transform API response to our format
    const formattedCities = cities.map((city, index) => ({
      id: city.id || index + 1,
      name: city.name || city,
      state_id: stateId,
      original_id: city.id
    }));
    
    // Cache the result
    apiCache.cities[stateId] = formattedCities;
    
    console.log(`✅ Cities loaded for state ${stateId}:`, formattedCities.length);
    return formattedCities;
    
  } catch (error) {
    console.error(`❌ Error fetching cities for state ${stateId}:`, error);
    throw error;
  }
}

// Function to clear cache
function clearLocationsCache() {
  apiCache = {
    states: null,
    cities: {}
  };
  console.log('🔄 Locations cache cleared');
}

// Export functions for use in profile.html
window.IranLocationsAPI = {
  fetchStatesFromAPI,
  fetchCitiesFromAPI,
  clearLocationsCache
};