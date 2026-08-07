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

// Local mock storage keys
const MOCK_SLOTS_KEY = "smartpark_mock_slots_v5";
const MOCK_RESERVATIONS_KEY = "smartpark_mock_reservations_v5";

// 3 Floors, 3 Zones per floor (Zone A, B, C), 10 slots per zone = 30 slots per floor (90 slots total)
function generateSlotsDataset() {
  const slots = [];
  let idCounter = 1;

  const floorConfigs = [
    { floor: 1, prefix: "A" },
    { floor: 2, prefix: "B" },
    { floor: 3, prefix: "C" },
  ];

  const zones = ["A", "B", "C"];

  floorConfigs.forEach(({ floor, prefix }) => {
    zones.forEach((zone, zoneIdx) => {
      for (let i = 1; i <= 10; i++) {
        const slotNum = zoneIdx * 10 + i; // 1..10, 11..20, 21..30
        const code = `${prefix}-${floor}${slotNum < 10 ? "0" + slotNum : slotNum}`;
        const isHandicapped = (zone === "A" && (i === 1 || i === 2)); // 1-2 bays near Mall Entrance per floor
        const isEv = !isHandicapped && (i % 3 === 0);
        const isBike = !isHandicapped && (i === 4 || i === 7);
        const isOccupied = !isHandicapped && (i === 3 || i === 8);
        const isReserved = isHandicapped || (i === 6);
        
        let status = "available";
        if (isOccupied) status = "occupied";
        else if (isReserved) status = "reserved";

        slots.push({
          id: String(idCounter++),
          code,
          floor,
          zone,
          vehicle_type: isBike ? "bike" : "car",
          is_ev: isEv,
          is_handicapped: isHandicapped,
          hourly_rate: isHandicapped ? 40 : isBike ? 20 : isEv ? 80 : 60,
          status,
        });
      }
    });
  });

  return slots;
}

const initialSlots = generateSlotsDataset();

const initialReservations = [
  {
    id: "res-1",
    slot_code: "A-106",
    floor: 1,
    zone: "A",
    vehicle_type: "car",
    vehicle_number: "KA 01 AB 1234",
    hours: 2,
    estimated_fee: 120,
    is_ev: false,
    status: "active",
    created_date: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "res-2",
    slot_code: "B-216",
    floor: 2,
    zone: "B",
    vehicle_type: "car",
    vehicle_number: "MH 12 CD 5678",
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
      if (parsed.length >= 90) return parsed;
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

// Helper to dispatch real verification email via HTTP fetch API
async function sendGmailCode(email, code) {
  try {
    fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: "service_smartpark",
        template_id: "template_otp",
        user_id: "smartpark_public_app",
        template_params: {
          to_email: email,
          recipient: email,
          otp_code: code,
          message: `Your SmartPark Gmail verification code is: ${code}`
        }
      })
    }).catch(() => {});
  } catch (e) {}
}

// Resilient base44 export supporting both connected Base44 backend and local standalone dev mode
// Legacy auth methods - replaced by DummyJSON auth (src/api/authApi.js)
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
      let answer = "I am your AI Parking Assistant! You can check spot availability across 3 Floors (Zones A, B, C with 30 slots per floor) on the Dashboard or view active bookings under Reservations.";
      if (q.includes("cancel")) {
        answer = "To cancel a reservation, open the Reservations tab and click 'Cancel Booking' on your active reservation.";
      } else if (q.includes("ev") || q.includes("charging")) {
        answer = "EV charging bays (marked with ⚡) are located in Zones A, B, & C across Levels 1, 2, and 3. Use the EV filter on the Dashboard to find free spots.";
      } else if (q.includes("fee") || q.includes("cost") || q.includes("rate") || q.includes("price") || q.includes("calculat")) {
        answer = "Parking fees are ₹60/hour for standard slots, ₹20/hr for bikes, and ₹80/hour for EV charging bays.";
      } else if (q.includes("extend")) {
        answer = "You can extend your parking time directly from your active booking card in the Reservations tab.";
      }
      return { data: { answer } };
    }
  }
};
