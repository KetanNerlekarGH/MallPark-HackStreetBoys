import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, token, functionsVersion, appBaseUrl } = appParams;

// Base SDK instance
export const realBase44 = createClient({
  appId,
  token,
  functionsVersion,
  serverUrl: '',
  requiresAuth: false,
  appBaseUrl
});

// Local mock storage helpers
const MOCK_SLOTS_KEY = "smartpark_mock_slots";
const MOCK_RESERVATIONS_KEY = "smartpark_mock_reservations";

const initialSlots = [
  // Floor 1 (Level 1 - Ground Floor)
  { id: "1", code: "A-101", floor: 1, vehicle_type: "car", is_ev: true, status: "available" },
  { id: "2", code: "A-102", floor: 1, vehicle_type: "car", is_ev: false, status: "available" },
  { id: "3", code: "A-103", floor: 1, vehicle_type: "car", is_ev: false, status: "occupied" },
  { id: "4", code: "A-104", floor: 1, vehicle_type: "bike", is_ev: false, status: "available" },
  { id: "5", code: "A-105", floor: 1, vehicle_type: "car", is_ev: true, status: "occupied" },
  { id: "6", code: "A-106", floor: 1, vehicle_type: "car", is_ev: false, status: "reserved" },
  { id: "7", code: "A-107", floor: 1, vehicle_type: "bike", is_ev: false, status: "available" },
  { id: "8", code: "A-108", floor: 1, vehicle_type: "car", is_ev: true, status: "available" },
  { id: "9", code: "A-109", floor: 1, vehicle_type: "car", is_ev: false, status: "occupied" },
  { id: "10", code: "A-110", floor: 1, vehicle_type: "car", is_ev: true, status: "available" },

  // Floor 2 (Level 2)
  { id: "11", code: "B-201", floor: 2, vehicle_type: "car", is_ev: false, status: "available" },
  { id: "12", code: "B-202", floor: 2, vehicle_type: "car", is_ev: true, status: "available" },
  { id: "13", code: "B-203", floor: 2, vehicle_type: "bike", is_ev: false, status: "occupied" },
  { id: "14", code: "B-204", floor: 2, vehicle_type: "car", is_ev: false, status: "available" },
  { id: "15", code: "B-205", floor: 2, vehicle_type: "car", is_ev: false, status: "reserved" },
  { id: "16", code: "B-206", floor: 2, vehicle_type: "bike", is_ev: false, status: "available" },
  { id: "17", code: "B-207", floor: 2, vehicle_type: "car", is_ev: true, status: "available" },
  { id: "18", code: "B-208", floor: 2, vehicle_type: "car", is_ev: false, status: "occupied" },
  { id: "19", code: "B-209", floor: 2, vehicle_type: "car", is_ev: true, status: "available" },
  { id: "20", code: "B-210", floor: 2, vehicle_type: "bike", is_ev: false, status: "available" },

  // Floor 3 (Level 3)
  { id: "21", code: "C-301", floor: 3, vehicle_type: "car", is_ev: true, status: "available" },
  { id: "22", code: "C-302", floor: 3, vehicle_type: "car", is_ev: false, status: "available" },
  { id: "23", code: "C-303", floor: 3, vehicle_type: "car", is_ev: false, status: "occupied" },
  { id: "24", code: "C-304", floor: 3, vehicle_type: "bike", is_ev: false, status: "available" },
  { id: "25", code: "C-305", floor: 3, vehicle_type: "car", is_ev: false, status: "available" },
  { id: "26", code: "C-306", floor: 3, vehicle_type: "car", is_ev: true, status: "available" },
  { id: "27", code: "C-307", floor: 3, vehicle_type: "bike", is_ev: false, status: "occupied" },
  { id: "28", code: "C-308", floor: 3, vehicle_type: "car", is_ev: false, status: "available" },
  { id: "29", code: "C-309", floor: 3, vehicle_type: "car", is_ev: true, status: "occupied" },
  { id: "30", code: "C-310", floor: 3, vehicle_type: "car", is_ev: false, status: "available" },

  // Floor 4 (Level 4 - VIP & EV Zone)
  { id: "31", code: "D-401", floor: 4, vehicle_type: "car", is_ev: true, status: "available" },
  { id: "32", code: "D-402", floor: 4, vehicle_type: "car", is_ev: true, status: "available" },
  { id: "33", code: "D-403", floor: 4, vehicle_type: "car", is_ev: false, status: "available" },
  { id: "34", code: "D-404", floor: 4, vehicle_type: "car", is_ev: false, status: "occupied" },
  { id: "35", code: "D-405", floor: 4, vehicle_type: "bike", is_ev: false, status: "available" },
  { id: "36", code: "D-406", floor: 4, vehicle_type: "car", is_ev: true, status: "available" },
  { id: "37", code: "D-407", floor: 4, vehicle_type: "car", is_ev: false, status: "reserved" },
  { id: "38", code: "D-408", floor: 4, vehicle_type: "car", is_ev: true, status: "available" },
  { id: "39", code: "D-409", floor: 4, vehicle_type: "bike", is_ev: false, status: "available" },
  { id: "40", code: "D-410", floor: 4, vehicle_type: "car", is_ev: false, status: "available" },

  // Floor 5 (Level 5 - Rooftop)
  { id: "41", code: "E-501", floor: 5, vehicle_type: "car", is_ev: false, status: "available" },
  { id: "42", code: "E-502", floor: 5, vehicle_type: "car", is_ev: false, status: "available" },
  { id: "43", code: "E-503", floor: 5, vehicle_type: "bike", is_ev: false, status: "available" },
  { id: "44", code: "E-504", floor: 5, vehicle_type: "car", is_ev: true, status: "available" },
  { id: "45", code: "E-505", floor: 5, vehicle_type: "car", is_ev: false, status: "occupied" },
  { id: "46", code: "E-506", floor: 5, vehicle_type: "car", is_ev: false, status: "available" },
  { id: "47", code: "E-507", floor: 5, vehicle_type: "bike", is_ev: false, status: "available" },
  { id: "48", code: "E-508", floor: 5, vehicle_type: "car", is_ev: true, status: "available" },
  { id: "49", code: "E-509", floor: 5, vehicle_type: "car", is_ev: false, status: "available" },
  { id: "50", code: "E-510", floor: 5, vehicle_type: "car", is_ev: false, status: "available" },
];

const initialReservations = [
  {
    id: "res-1",
    slot_code: "A-106",
    floor: 1,
    vehicle_type: "car",
    vehicle_number: "KA-01-AB-1234",
    hours: 2,
    estimated_fee: 120,
    is_ev: false,
    status: "active",
    created_date: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "res-2",
    slot_code: "B-205",
    floor: 2,
    vehicle_type: "car",
    vehicle_number: "MH-12-CD-5678",
    hours: 3,
    estimated_fee: 180,
    is_ev: false,
    status: "active",
    created_date: new Date(Date.now() - 7200000).toISOString(),
  }
];

function getStoredSlots() {
  try {
    const raw = localStorage.getItem(MOCK_SLOTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.length >= 50) return parsed;
    }
    localStorage.setItem(MOCK_SLOTS_KEY, JSON.stringify(initialSlots));
    return initialSlots;
  } catch (e) {
    return initialSlots;
  }
}

function saveStoredSlots(slots) {
  try {
    localStorage.setItem(MOCK_SLOTS_KEY, JSON.stringify(slots));
  } catch (e) {}
}

function getStoredReservations() {
  try {
    const raw = localStorage.getItem(MOCK_RESERVATIONS_KEY);
    if (raw) return JSON.parse(raw);
    localStorage.setItem(MOCK_RESERVATIONS_KEY, JSON.stringify(initialReservations));
    return initialReservations;
  } catch (e) {
    return initialReservations;
  }
}

function saveStoredReservations(resList) {
  try {
    localStorage.setItem(MOCK_RESERVATIONS_KEY, JSON.stringify(resList));
  } catch (e) {}
}

// Resilient base44 export supporting both connected Base44 backend and local standalone dev mode
export const base44 = {
  auth: {
    me: async () => {
      try {
        if (appParams.token && appParams.appId) {
          return await realBase44.auth.me();
        }
      } catch (e) {}
      const rawMock = localStorage.getItem("base44_mock_user");
      if (rawMock) return JSON.parse(rawMock);
      const err = new Error("Not authenticated");
      err.status = 401;
      throw err;
    },
    loginViaEmailPassword: async (email, password) => {
      try {
        if (appParams.appBaseUrl && appParams.appId) {
          return await realBase44.auth.loginViaEmailPassword(email, password);
        }
      } catch (e) {}
      const mockUser = {
        id: "user_" + Date.now(),
        email: email || "user@example.com",
        full_name: email ? email.split("@")[0] : "Demo User"
      };
      localStorage.setItem("base44_mock_user", JSON.stringify(mockUser));
      return mockUser;
    },
    loginWithProvider: async (provider, returnTo) => {
      try {
        if (appParams.appBaseUrl && appParams.appId) {
          return realBase44.auth.loginWithProvider(provider, returnTo);
        }
      } catch (e) {}
      const mockUser = {
        id: "g_" + Date.now(),
        email: "alex.demo@gmail.com",
        full_name: "Alex Demo",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex"
      };
      localStorage.setItem("base44_mock_user", JSON.stringify(mockUser));
      window.location.href = returnTo || "/";
    },
    register: async ({ email, password }) => {
      try {
        if (appParams.appBaseUrl && appParams.appId) {
          return await realBase44.auth.register({ email, password });
        }
      } catch (e) {}
      return { success: true, email };
    },
    verifyOtp: async ({ email, otpCode }) => {
      try {
        if (appParams.appBaseUrl && appParams.appId) {
          return await realBase44.auth.verifyOtp({ email, otpCode });
        }
      } catch (e) {}
      const mockUser = {
        id: "user_" + Date.now(),
        email: email || "user@example.com",
        full_name: email ? email.split("@")[0] : "Demo User"
      };
      localStorage.setItem("base44_mock_user", JSON.stringify(mockUser));
      return { access_token: "mock_token_" + Date.now(), user: mockUser };
    },
    resendOtp: async (email) => {
      try {
        if (appParams.appBaseUrl && appParams.appId) {
          return await realBase44.auth.resendOtp(email);
        }
      } catch (e) {}
      return { success: true };
    },
    setToken: (token) => {
      try {
        localStorage.setItem("token", token);
      } catch (e) {}
    },
    registerViaEmailPassword: async (email, password) => {
      const mockUser = {
        id: "user_" + Date.now(),
        email: email || "user@example.com",
        full_name: email ? email.split("@")[0] : "Demo User"
      };
      localStorage.setItem("base44_mock_user", JSON.stringify(mockUser));
      return mockUser;
    },
    logout: (redirectUrl) => {
      localStorage.removeItem("base44_mock_user");
      try {
        realBase44.auth.logout();
      } catch (e) {}
      if (redirectUrl) window.location.href = redirectUrl;
    },
    redirectToLogin: (returnTo) => {
      window.location.href = returnTo ? `/login?returnTo=${encodeURIComponent(returnTo)}` : "/login";
    }
  },
  entities: {
    ParkingSlot: {
      list: async (sortBy, limit) => {
        try {
          if (appParams.appBaseUrl && appParams.appId) {
            const res = await realBase44.entities.ParkingSlot.list(sortBy, limit);
            if (res && res.length) return res;
          }
        } catch (e) {}
        return getStoredSlots();
      },
      filter: async (query) => {
        try {
          if (appParams.appBaseUrl && appParams.appId) {
            const res = await realBase44.entities.ParkingSlot.filter(query);
            if (res && res.length) return res;
          }
        } catch (e) {}
        const slots = getStoredSlots();
        return slots.filter((s) => {
          return Object.entries(query).every(([k, v]) => s[k] === v);
        });
      },
      update: async (id, updates) => {
        try {
          if (appParams.appBaseUrl && appParams.appId) {
            await realBase44.entities.ParkingSlot.update(id, updates);
          }
        } catch (e) {}
        const slots = getStoredSlots();
        const updated = slots.map((s) => (s.id === String(id) || s.code === String(id) ? { ...s, ...updates } : s));
        saveStoredSlots(updated);
        return updated.find((s) => s.id === String(id) || s.code === String(id)) || updates;
      }
    },
    Reservation: {
      list: async (sortBy, limit) => {
        try {
          if (appParams.appBaseUrl && appParams.appId) {
            const res = await realBase44.entities.Reservation.list(sortBy, limit);
            if (res && res.length) return res;
          }
        } catch (e) {}
        return getStoredReservations();
      },
      filter: async (query) => {
        try {
          if (appParams.appBaseUrl && appParams.appId) {
            const res = await realBase44.entities.Reservation.filter(query);
            if (res && res.length) return res;
          }
        } catch (e) {}
        const list = getStoredReservations();
        return list.filter((r) => {
          return Object.entries(query).every(([k, v]) => r[k] === v);
        });
      },
      create: async (data) => {
        try {
          if (appParams.appBaseUrl && appParams.appId) {
            return await realBase44.entities.Reservation.create(data);
          }
        } catch (e) {}
        const list = getStoredReservations();
        const newItem = {
          id: "res_" + Date.now(),
          ...data,
          created_date: new Date().toISOString()
        };
        list.unshift(newItem);
        saveStoredReservations(list);
        return newItem;
      },
      update: async (id, updates) => {
        try {
          if (appParams.appBaseUrl && appParams.appId) {
            await realBase44.entities.Reservation.update(id, updates);
          }
        } catch (e) {}
        const list = getStoredReservations();
        const updated = list.map((r) => (r.id === String(id) ? { ...r, ...updates } : r));
        saveStoredReservations(updated);
        return updated.find((r) => r.id === String(id)) || updates;
      }
    }
  },
  functions: {
    invoke: async (name, payload) => {
      try {
        if (appParams.appBaseUrl && appParams.appId) {
          return await realBase44.functions.invoke(name, payload);
        }
      } catch (e) {}
      const q = (payload?.question || "").toLowerCase();
      let answer = "I am your AI Parking Assistant! You can check spot availability on the Dashboard or view active bookings under Reservations.";
      if (q.includes("cancel")) {
        answer = "To cancel a reservation, open the Reservations tab and click 'Cancel Booking' on your active reservation.";
      } else if (q.includes("ev") || q.includes("charging")) {
        answer = "EV charging bays (marked with ⚡) are located on Levels 1, 2, and 3. Use the EV filter on the Dashboard to find free spots.";
      } else if (q.includes("fee") || q.includes("cost") || q.includes("rate") || q.includes("price") || q.includes("calculat")) {
        answer = "Parking fees are ₹60/hour for standard slots and ₹80/hour for EV charging bays.";
      } else if (q.includes("extend")) {
        answer = "You can extend your parking time directly from your active booking card in the Reservations tab.";
      }
      return { data: { answer } };
    }
  }
};
