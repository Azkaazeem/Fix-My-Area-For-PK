import { FaBolt, FaFireAlt, FaRoad } from "react-icons/fa";
import { GiWaterDrop } from "react-icons/gi";
import { IoTrashOutline } from "react-icons/io5";
import { MdLocalGasStation } from "react-icons/md";
import { RiAlarmWarningFill, RiPoliceCarFill } from "react-icons/ri";

export const CATEGORY_OPTIONS = [
  { id: "Water", label: "Water", description: "Pipe bursts, low pressure, tanker delays", tone: "normal", icon: GiWaterDrop },
  { id: "Gas", label: "Gas", description: "Leaks, line faults, unsafe meter clusters", tone: "normal", icon: MdLocalGasStation },
  { id: "Electricity", label: "Electricity", description: "Sparks, outages, overloaded transformers", tone: "normal", icon: FaBolt },
  { id: "Road", label: "Road", description: "Potholes, broken curbs, dangerous crossings", tone: "normal", icon: FaRoad },
  { id: "Garbage", label: "Garbage", description: "Overflowing points, debris, hazardous waste", tone: "normal", icon: IoTrashOutline },
  { id: "Fire", label: "Fire", description: "Active blaze, smoke, critical fire-risk scene", tone: "emergency", icon: FaFireAlt },
  { id: "Severe Accident", label: "Severe Accident", description: "Major collision, blocked route, injury risk", tone: "emergency", icon: RiAlarmWarningFill },
  { id: "Theft", label: "Theft", description: "Theft, burglary, suspicious coordinated incident", tone: "emergency", icon: RiPoliceCarFill }
];

export const HOME_STATS = [
  { label: "Issues resolved today", value: "1,284", delta: "+18% vs yesterday" },
  { label: "Emergency cases escalated", value: "143", delta: "under 7 min avg routing" },
  { label: "Cities actively reporting", value: "42", delta: "Karachi, Lahore, Islamabad lead" },
  { label: "Active citizen reporters", value: "18.6k", delta: "verified civic profiles" }
];

export const CITY_SIGNALS = [
  { city: "Karachi", tone: "High traffic", value: "219 live reports" },
  { city: "Lahore", tone: "Fastest cleanup", value: "81 resolved today" },
  { city: "Islamabad", tone: "Emergency-ready", value: "12 critical cases cleared" }
];

export const MOCK_ISSUES = [];
