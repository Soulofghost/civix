import { create } from 'zustand';

export const useRegionStore = create((set) => ({
  userRegion: {
    country: 'India',
    state: 'Kerala',
    district: 'Ernakulam',
    city: 'Kochi',
    ward: 'Ward 12'
  },
  availableRegions: [
    {
      country: 'India',
      states: [
        {
          name: 'Kerala',
          districts: [
            { name: 'Ernakulam', cities: [{ name: 'Kochi', wards: ['Ward 10', 'Ward 12', 'Ward 25'] }] },
            { name: 'Trivandrum', cities: [{ name: 'TVM City', wards: ['Ward 1', 'Ward 5'] }] }
          ]
        },
        {
          name: 'Karnataka',
          districts: [
            { name: 'Bangalore Urban', cities: [{ name: 'Bengaluru', wards: ['Indiranagar', 'Koramangala'] }] }
          ]
        }
      ]
    },
    {
      country: 'USA',
      states: [
        {
          name: 'New York',
          districts: [{ name: 'Manhattan', cities: [{ name: 'NYC', wards: ['Lower East Side', 'Midtown'] }] }]
        }
      ]
    }
  ],
  departments: [
    { name: 'PWD', full: 'Public Works Department', regions: ['India'] },
    { name: 'KSEB', full: 'Kerala State Electricity Board', regions: ['India-Kerala'] },
    { name: 'KWA', full: 'Kerala Water Authority', regions: ['India-Kerala'] },
    { name: 'Municipality', full: 'Municipal Corporation', regions: ['Global'] }
  ],
  setUserRegion: (region) => set({ userRegion: region }),
  detectLocation: async () => {
    // Simulate IP-based or GPS detection
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          country: 'India',
          state: 'Kerala',
          district: 'Ernakulam',
          city: 'Kochi',
          ward: 'Ward 12'
        });
      }, 1000);
    });
  }
}));
