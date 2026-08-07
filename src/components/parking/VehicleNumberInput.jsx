import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, AlertCircle } from "lucide-react";

// State names dictionary for popular state codes
const STATE_NAMES = {
  DL: "Delhi",
  MH: "Maharashtra",
  KA: "Karnataka",
  TN: "Tamil Nadu",
  HR: "Haryana",
  UP: "Uttar Pradesh",
  GJ: "Gujarat",
  RJ: "Rajasthan",
  TS: "Telangana",
  AP: "Andhra Pradesh",
  WB: "West Bengal",
  KL: "Kerala",
  PB: "Punjab",
  MP: "Madhya Pradesh",
  BR: "Bihar",
  OR: "Odisha",
  OD: "Odisha",
  GA: "Goa",
  UT: "Uttarakhand",
  UK: "Uttarakhand",
  HP: "Himachal Pradesh",
  JK: "Jammu & Kashmir",
  PY: "Puducherry",
  CH: "Chandigarh",
};

/**
 * Enforces Indian Vehicle Registration Format:
 * [State Code (2 letters)] [RTO Code (1-2 digits)] [Series (1-2 letters, excluding I & O)] [Number (4 digits)]
 * Example: KA 01 AB 1234
 */
export function formatVehicleNumber(input) {
  if (!input) return "";
  // Strip non-alphanumeric and uppercase
  const raw = input.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

  // Extract components
  // 1. State Code: 2 letters
  let state = raw.slice(0, 2).replace(/[^A-Z]/g, "");

  // 2. RTO Code: 1-2 digits after state
  let rest1 = raw.slice(state.length);
  let rtoMatch = rest1.match(/^([0-9]{1,2})/);
  let rto = rtoMatch ? rtoMatch[1] : "";

  // 3. Series: 1-2 letters (skipping I and O) after RTO
  let rest2 = rest1.slice(rto.length);
  let seriesMatch = rest2.match(/^([A-Z]{1,2})/);
  let series = "";
  if (seriesMatch) {
    // Filter out 'I' and 'O'
    series = seriesMatch[1].replace(/[IO]/g, "");
  }

  // 4. Number: up to 4 digits after series
  let rest3 = rest2.slice(series.length);
  let numberMatch = rest3.match(/([0-9]{1,4})/);
  let number = numberMatch ? numberMatch[1] : "";

  // Assemble formatted string with spaces
  let parts = [state, rto, series, number].filter(Boolean);
  return parts.join(" ");
}

export function isValidVehicleNumber(value) {
  if (!value) return false;
  // Regex: 2 Letters, Space, 1-2 Digits, Space, 1-2 Letters (excluding I, O), Space, 4 Digits
  const regex = /^[A-Z]{2}\s[0-9]{1,2}\s[A-HJ-NPR-Z]{1,2}\s[0-9]{4}$/;
  return regex.test(value.trim());
}

export default function VehicleNumberInput({ value, onChange, label = "Vehicle registration number", required = true }) {
  const formattedValue = formatVehicleNumber(value);
  const isValid = isValidVehicleNumber(formattedValue);

  const stateCode = formattedValue.slice(0, 2);
  const stateName = STATE_NAMES[stateCode];

  const handleChange = (e) => {
    const formatted = formatVehicleNumber(e.target.value);
    onChange(formatted);
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        {isValid && (
          <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Valid Indian Format {stateName ? `(${stateName})` : ""}
          </span>
        )}
      </div>

      <div className="relative">
        <Input
          value={value}
          onChange={handleChange}
          placeholder="KA 01 AB 1234"
          className={`h-11 font-mono tracking-wider font-semibold uppercase ${
            value && !isValid ? "border-amber-500/80 focus-visible:ring-amber-500/50" : isValid ? "border-emerald-500/80 focus-visible:ring-emerald-500/50" : ""
          }`}
          maxLength={13}
          required={required}
        />
      </div>

      <p className="text-[11px] text-muted-foreground leading-snug">
        Format: <span className="font-semibold text-foreground">State</span> (2L) &nbsp;•&nbsp; <span className="font-semibold text-foreground font-mono">RTO</span> (1-2D) &nbsp;•&nbsp; <span className="font-semibold text-foreground font-mono">Series</span> (1-2L, no I/O) &nbsp;•&nbsp; <span className="font-semibold text-foreground font-mono">Number</span> (4D)
      </p>
    </div>
  );
}
