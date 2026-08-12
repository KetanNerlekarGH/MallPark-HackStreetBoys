// Standalone fallback data generator when Base44 cloud backend is not connected
const MOCK_SLOTS_KEY = "base44_mock_parking_slots";
const MOCK_RESERVATIONS_KEY = "base44_mock_reservations";
const MOCK_USER_KEY = "base44_mock_user";

// Safe helper to read environment parameters
const appParams = typeof window !== "undefined" && window.__BASE44_PARAMS__
  ? window.__BASE44_PARAMS__
  : { appBaseUrl: "", appId: "" };

// 3 Floors, 3 Zones per floor (Zone A, B, C), 10 slots per zone = 30 slots per floor (90 slots total)
function generateSlotsDataset(mallId = "default") {
  const slots = [];
  let idCounter = 1;

  const floorsList = [1, 2, 3];
  const zones = ["A", "B", "C"];

  floorsList.forEach((floor) => {
    zones.forEach((zone, zoneIdx) => {
      for (let i = 1; i <= 10; i++) {
        const slotNum = zoneIdx * 10 + i; // 1..10, 11..20, 21..30
        const code = `${zone}-${floor}${slotNum < 10 ? "0" + slotNum : slotNum}`;
        const isHandicapped = (zone === "C" && (i === 1 || i === 2)); // C-121, C-122 near Mall Entrance
        const isEv = !isHandicapped && (i % 3 === 0);
        const isBike = !isHandicapped && (i === 4 || i === 7);
        
        const status = "available";

        slots.push({
          id: `${mallId}_${idCounter++}`,
          code,
          floor,
          zone,
          vehicle_type: isBike ? "bike" : "car",
          is_ev: isEv,
          is_handicapped: isHandicapped,
          hourly_rate: isHandicapped ? 40 : isBike ? 20 : isEv ? 80 : 60,
          status,
          mall_id: mallId,
        });
      }
    });
  });

  return slots;
}

function getStoredSlots(mallId = "default") {
  try {
    const key = `${MOCK_SLOTS_KEY}_${mallId}`;
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.length >= 90) {
        return parsed.map((s) => {
          if (s.code === "A-101" || s.code === "A-102") {
            return { ...s, status: s.status === "occupied" ? "occupied" : "available", is_handicapped: false };
          }
          return s;
        });
      }
    }
    const freshDataset = generateSlotsDataset(mallId);
    localStorage.setItem(key, JSON.stringify(freshDataset));
    return freshDataset;
  } catch (e) {
    return generateSlotsDataset(mallId);
  }
}

function saveStoredSlots(slots, mallId = "default") {
  try {
    const key = `${MOCK_SLOTS_KEY}_${mallId}`;
    localStorage.setItem(key, JSON.stringify(slots));
  } catch (e) {}
}

function getStoredReservations(mallId = null) {
  try {
    const raw = localStorage.getItem(MOCK_RESERVATIONS_KEY);
    if (raw) {
      const list = JSON.parse(raw);
      if (mallId) {
        return list.filter((r) => !r.mall_id || r.mall_id === mallId);
      }
      return list;
    }
    localStorage.setItem(MOCK_RESERVATIONS_KEY, JSON.stringify([]));
    return [];
  } catch (e) {
    return [];
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
      const rawUser = localStorage.getItem("auth_user");
      if (rawUser) return JSON.parse(rawUser);
      const err = new Error("Not authenticated");
      err.status = 401;
      throw err;
    },
    setToken: (token) => {
      try {
        localStorage.setItem("accessToken", token);
      } catch (e) {}
    },
    logout: (redirectUrl) => {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("auth_user");
      localStorage.removeItem("base44_mock_user");
      if (redirectUrl) window.location.href = redirectUrl;
    },
    redirectToLogin: (returnTo) => {
      window.location.href = returnTo ? `/login?returnTo=${encodeURIComponent(returnTo)}` : "/login";
    }
  },
  entities: {
    ParkingSlot: {
      list: async (sortBy, limit, mallId = "default") => {
        return getStoredSlots(mallId);
      },
      filter: async (query, mallId = "default") => {
        const slots = getStoredSlots(mallId);
        return slots.filter((s) => {
          return Object.entries(query).every(([k, v]) => s[k] === v);
        });
      },
      update: async (id, updates, mallId = "default") => {
        const slots = getStoredSlots(mallId);
        const strId = String(id).toUpperCase();
        let foundMatch = false;
        const updated = slots.map((s) => {
          const matchId = s.id ? String(s.id).toUpperCase() === strId : false;
          const matchCode = s.code ? String(s.code).toUpperCase() === strId : false;
          if (matchId || matchCode) {
            foundMatch = true;
            return { ...s, ...updates };
          }
          return s;
        });

        if (!foundMatch && id) {
          const floorNum = parseInt(String(id).match(/-\d/)?.[0]?.replace("-", "") || "1", 10);
          updated.push({
            id: String(id),
            code: String(id),
            floor: floorNum,
            zone: String(id).charAt(0),
            vehicle_type: "car",
            hourly_rate: 40,
            ...updates,
            mall_id: mallId,
          });
        }

        saveStoredSlots(updated, mallId);
        return updated.find((s) => (s.id && String(s.id).toUpperCase() === strId) || (s.code && String(s.code).toUpperCase() === strId)) || updates;
      }
    },
    Reservation: {
      list: async (sortBy, limit, mallId = null) => {
        return getStoredReservations(mallId);
      },
      filter: async (query, mallId = null) => {
        const list = getStoredReservations(mallId);
        return list.filter((r) => {
          return Object.entries(query).every(([k, v]) => r[k] === v);
        });
      },
      create: async (data) => {
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
        const list = getStoredReservations();
        const updated = list.map((r) => (r.id === String(id) ? { ...r, ...updates } : r));
        saveStoredReservations(updated);
        return updated.find((r) => r.id === String(id)) || updates;
      }
    }
  },
  functions: {
    invoke: async (name, payload = {}) => {
      if (name === "parkingAssistant") {
        const q = (payload.question || "").toLowerCase();
        let answer = "";

        if (q.includes("cancel") || q.includes("refund")) {
          answer = "To cancel your reservation, go to the 'My Bookings' tab, locate your active reservation, and click 'Cancel booking'. Cancellations within the first 5 minutes are 100% free!";
        } else if (q.includes("ev") || q.includes("charge") || q.includes("electric")) {
          answer = "EV charging bays are marked with ⚡ sky-blue icons located in Zone A and Zone B. You can use the 'EV Only' toggle switch on the Dashboard to highlight them!";
        } else if (q.includes("handicapped") || q.includes("disabled") || q.includes("wheelchair")) {
          answer = "Accessible handicapped parking spots are conveniently located directly at the Mall Entrance and Elevator Lobby at spots C-121 and C-122 (marked with ♿ icons).";
        } else if (q.includes("fee") || q.includes("price") || q.includes("cost") || q.includes("rate") || q.includes("pay") || q.includes("calculate")) {
          answer = "Parking fees are calculated at a standard rate of ₹40/hour per level. You can view your current running total in real time under the 'My Bookings' page.";
        } else if (q.includes("extend") || q.includes("more time") || q.includes("duration")) {
          answer = "You can extend your parking duration at any time! Navigate to 'My Bookings', tap your active session, and select 'Extend Time' to add extra hours.";
        } else if (q.includes("valet") || q.includes("pickup") || q.includes("dispatch")) {
          answer = "To request valet pickup, click the 'Valet Service' button in the top navigation bar, enter your car registration number, and click 'Request Pickup'. Your car will be dispatched straight to the Elevator Lobby!";
        } else if (q.includes("color") || q.includes("green") || q.includes("red") || q.includes("yellow") || q.includes("spot")) {
          answer = "🟢 Emerald Green = Free & Available for booking\n🟡 Vibrant Yellow = Reserved by user\n🔴 Neon Red = Vehicle physically parked inside spot";
        } else if (q.includes("hi") || q.includes("hello") || q.includes("hey")) {
          answer = "Hello! 🚗 I'm Parky, your smart parking assistant. Ask me anything about finding spots, rates, EV charging, or valet pickup!";
        } else {
          answer = "I'm here to help! You can ask me about finding available spots, EV charging bays, handicapped parking (C-121 & C-122), parking rates (₹40/hr), extending time, or requesting valet pickup.";
        }

        return { data: { answer } };
      }
      return { data: { answer: "Assistant service active." } };
    }
  }
};
