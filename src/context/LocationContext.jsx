import React, { createContext, useContext, useState, useEffect } from "react";
import { INDIAN_MALLS_DATA, DEFAULT_MALL, getCitiesByState, getMallsByCity } from "@/data/indianMallsData";

const LocationContext = createContext();

export function LocationProvider({ children }) {
  const [selectedState, setSelectedState] = useState("Maharashtra");
  const [selectedCity, setSelectedCity] = useState("Pune");
  const [selectedMall, setSelectedMall] = useState(DEFAULT_MALL);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load initial location from localStorage if present
  useEffect(() => {
    try {
      const saved = localStorage.getItem("mallpark_selected_location");
      if (saved) {
        const parsed = JSON.parse(saved);
        const foundMall = INDIAN_MALLS_DATA.find((m) => m.id === parsed.mallId) || DEFAULT_MALL;
        setSelectedState(foundMall.state);
        setSelectedCity(foundMall.city);
        setSelectedMall(foundMall);
      }
    } catch (e) {
      console.error("Error reading saved location:", e);
    }
  }, []);

  const selectMall = (mall) => {
    if (!mall) return;
    setSelectedState(mall.state);
    setSelectedCity(mall.city);
    setSelectedMall(mall);
    try {
      localStorage.setItem(
        "mallpark_selected_location",
        JSON.stringify({ state: mall.state, city: mall.city, mallId: mall.id })
      );
    } catch (e) {
      console.error("Error saving location:", e);
    }
  };

  const openLocationModal = () => setIsModalOpen(true);
  const closeLocationModal = () => setIsModalOpen(false);

  return (
    <LocationContext.Provider
      value={{
        selectedState,
        setSelectedState,
        selectedCity,
        setSelectedCity,
        selectedMall,
        selectMall,
        isModalOpen,
        openLocationModal,
        closeLocationModal,
        allMalls: INDIAN_MALLS_DATA,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocationContext() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocationContext must be used within a LocationProvider");
  }
  return context;
}
