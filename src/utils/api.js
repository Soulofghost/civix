/**
 * Civix "presentation-ready" API Persistence & Fail-Safe Utility
 * ALWAYS returns mock data if the backend node (MCP/Supabase) is unavailable.
 */

// Global Demo Mode Flag - Forced on if API URL is missing
const getApiUrl = () => {
  const url = 
    (typeof process !== 'undefined' && process?.env?.NEXT_PUBLIC_MCP_API_URL) || 
    (import.meta.env && import.meta.env.VITE_MCP_API_URL) || 
    (import.meta.env && import.meta.env.NEXT_PUBLIC_MCP_API_URL);

  return url || '';
};

export const API_URL = getApiUrl();
export const IS_DEMO_MODE = !API_URL;

if (typeof window !== 'undefined') {
  if (IS_DEMO_MODE) {
    console.log("%c🛡️ CIVIX DEMO PROTOCOL ACTIVE: All systems are operating on synchronized local mock ledgers.", "color: #8B5CF6; font-weight: bold; font-size: 12px;");
  } else {
    console.log(`🌐 API_CORE: Interrogating regional node at ${API_URL}`);
  }
}

/**
 * Safe fetch wrapper with automatic mock-fallback and presentation-ready error handling.
 */
export const safeFetch = async (endpoint, options = {}, mockData = null) => {
  // If in demo mode, return mock data immediately to skip network overhead
  if (IS_DEMO_MODE) {
    if (mockData) return mockData;
    return null;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s network timeout

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) return mockData;
    return await response.json();
  } catch (err) {
    console.warn(`🛡️ FAIL_SAFE: Node unreachable. Invoking fallback for [${endpoint}]`);
    return mockData;
  }
};
