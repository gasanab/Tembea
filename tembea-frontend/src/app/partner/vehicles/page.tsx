"use client";

import { useState } from "react";
import {
  Car,
  Truck,
  Bus,
  Bike,
  Plus,
  Edit2,
  ToggleLeft,
  ToggleRight,
  UserCheck,
  DollarSign,
  X,
} from "lucide-react";

type VehicleType = "Car" | "Van" | "Bus" | "Minibus" | "Motorbike";
type TransmissionType = "Automatic" | "Manual";
type FuelType = "Petrol" | "Diesel" | "Electric" | "Hybrid";

interface Driver {
  name: string;
  phone: string;
  license: string;
}

interface Vehicle {
  id: number;
  make: string;
  model: string;
  year: number;
  type: VehicleType;
  capacity: number;
  plate: string;
  color: string;
  transmission: TransmissionType;
  fuelType: FuelType;
  pricePerDay: number;
  features: string[];
  available: boolean;
  driver: Driver | null;
}

function VehicleIcon({ type, size = 28 }: { type: VehicleType; size?: number }) {
  switch (type) {
    case "Car":
      return <Car size={size} />;
    case "Motorbike":
      return <Bike size={size} />;
    case "Bus":
      return <Bus size={size} />;
    default:
      return <Truck size={size} />;
  }
}

const VEHICLE_TYPES: VehicleType[] = ["Car", "Van", "Bus", "Minibus", "Motorbike"];
const TRANSMISSIONS: TransmissionType[] = ["Automatic", "Manual"];
const FUEL_TYPES: FuelType[] = ["Petrol", "Diesel", "Electric", "Hybrid"];

const initialVehicles: Vehicle[] = [
  {
    id: 1,
    make: "Toyota",
    model: "Prado",
    year: 2022,
    type: "Car",
    capacity: 6,
    plate: "RAB 234A",
    color: "White",
    transmission: "Automatic",
    fuelType: "Diesel",
    pricePerDay: 80,
    features: ["AC", "GPS", "4WD", "Leather Seats"],
    available: true,
    driver: { name: "Jean-Pierre Uwimana", phone: "+250 788 123 456", license: "DL-2019-001" },
  },
  {
    id: 2,
    make: "Mercedes",
    model: "Sprinter",
    year: 2020,
    type: "Van",
    capacity: 12,
    plate: "RAC 567B",
    color: "Silver",
    transmission: "Manual",
    fuelType: "Diesel",
    pricePerDay: 120,
    features: ["AC", "USB Charging", "Luggage Rack"],
    available: true,
    driver: null,
  },
  {
    id: 3,
    make: "Toyota",
    model: "Coaster",
    year: 2019,
    type: "Minibus",
    capacity: 25,
    plate: "RAD 890C",
    color: "Blue",
    transmission: "Manual",
    fuelType: "Diesel",
    pricePerDay: 200,
    features: ["AC", "Reclining Seats", "PA System", "Emergency Exit"],
    available: false,
    driver: null,
  },
];

const emptyForm: Omit<Vehicle, "id" | "driver"> = {
  make: "",
  model: "",
  year: new Date().getFullYear(),
  type: "Car",
  capacity: 4,
  plate: "",
  color: "",
  transmission: "Automatic",
  fuelType: "Diesel",
  pricePerDay: 0,
  features: [],
  available: true,
};

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState<Omit<Vehicle, "id" | "driver">>(emptyForm);
  const [featuresInput, setFeaturesInput] = useState("");
  const [assignDriverId, setAssignDriverId] = useState<number | null>(null);
  const [driverForm, setDriverForm] = useState<Driver>({ name: "", phone: "", license: "" });

  const totalVehicles = vehicles.length;
  const availableVehicles = vehicles.filter((v) => v.available).length;
  const withDriver = vehicles.filter((v) => v.driver !== null).length;
  const totalDailyValue = vehicles.filter((v) => v.available).reduce((s, v) => s + v.pricePerDay, 0);

  function openAdd() {
    setFormData(emptyForm);
    setFeaturesInput("");
    setEditMode(null);
    setModalOpen(true);
  }

  function openEdit(vehicle: Vehicle) {
    setFormData({
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      type: vehicle.type,
      capacity: vehicle.capacity,
      plate: vehicle.plate,
      color: vehicle.color,
      transmission: vehicle.transmission,
      fuelType: vehicle.fuelType,
      pricePerDay: vehicle.pricePerDay,
      features: vehicle.features,
      available: vehicle.available,
    });
    setFeaturesInput(vehicle.features.join(", "));
    setEditMode(vehicle);
    setModalOpen(true);
  }

  function handleSave() {
    const features = featuresInput
      .split(",")
      .map((f) => f.trim())
      .filter(Boolean);
    const data = { ...formData, features };

    if (editMode) {
      setVehicles((prev) =>
        prev.map((v) =>
          v.id === editMode.id ? { ...data, id: editMode.id, driver: editMode.driver } : v
        )
      );
    } else {
      setVehicles((prev) => [...prev, { ...data, id: Date.now(), driver: null }]);
    }
    setModalOpen(false);
  }

  function toggleAvailability(id: number) {
    setVehicles((prev) => prev.map((v) => (v.id === id ? { ...v, available: !v.available } : v)));
  }

  function saveDriver(vehicleId: number) {
    setVehicles((prev) =>
      prev.map((v) => (v.id === vehicleId ? { ...v, driver: { ...driverForm } } : v))
    );
    setAssignDriverId(null);
  }

  function removeDriver(vehicleId: number) {
    setVehicles((prev) => prev.map((v) => (v.id === vehicleId ? { ...v, driver: null } : v)));
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D5F5E3]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-[#111827]">Vehicle Fleet</h1>
            <p className="text-[#6B7280] mt-1">Manage your transport vehicles and drivers</p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#145A32] text-white font-bold text-sm hover:bg-[#0e3d22] transition"
          >
            <Plus size={16} />
            Add Vehicle
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Vehicles", value: totalVehicles, icon: Car },
          { label: "Available", value: availableVehicles, icon: ToggleRight },
          { label: "With Driver", value: withDriver, icon: UserCheck },
          { label: "Available Daily Value", value: `$${totalDailyValue}`, icon: DollarSign },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-[#D5F5E3]">
            <div className="flex items-center gap-3 mb-2">
              <span className="w-9 h-9 rounded-xl bg-[#D5F5E3] flex items-center justify-center">
                <Icon size={18} className="text-[#145A32]" />
              </span>
              <p className="text-xs font-bold text-[#6B7280]">{label}</p>
            </div>
            <p className="text-3xl font-black text-[#111827]">{value}</p>
          </div>
        ))}
      </div>

      {/* Vehicle cards */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {vehicles.map((vehicle) => (
          <div
            key={vehicle.id}
            className="bg-white rounded-2xl shadow-sm border border-[#D5F5E3] p-5 flex flex-col gap-4"
          >
            {/* Top */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="w-12 h-12 rounded-2xl bg-[#D5F5E3] flex items-center justify-center text-[#145A32]">
                  <VehicleIcon type={vehicle.type} size={24} />
                </span>
                <div>
                  <h3 className="font-black text-[#111827]">
                    {vehicle.make} {vehicle.model}
                  </h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#f5fbf7] border border-[#D5F5E3] text-[#145A32] text-xs font-bold">
                    {vehicle.type} · {vehicle.year}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-black text-[#145A32]">${vehicle.pricePerDay}</p>
                <p className="text-xs text-[#6B7280]">/day</p>
              </div>
            </div>

            {/* Specs */}
            <div className="grid grid-cols-2 gap-2 text-sm">
              {[
                { label: "Capacity", value: `${vehicle.capacity} seats` },
                { label: "Plate", value: vehicle.plate },
                { label: "Transmission", value: vehicle.transmission },
                { label: "Fuel", value: vehicle.fuelType },
              ].map(({ label, value }) => (
                <div key={label} className="bg-[#f5fbf7] rounded-xl p-2.5">
                  <p className="text-[#6B7280] text-xs font-bold">{label}</p>
                  <p className="font-bold text-[#111827] text-xs mt-0.5">{value}</p>
                </div>
              ))}
            </div>

            {/* Features */}
            {vehicle.features.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {vehicle.features.map((f) => (
                  <span
                    key={f}
                    className="px-2 py-0.5 rounded-full bg-[#D5F5E3] text-[#145A32] text-xs font-semibold"
                  >
                    {f}
                  </span>
                ))}
              </div>
            )}

            {/* Driver section */}
            <div className="bg-[#f5fbf7] rounded-xl p-3 border border-[#D5F5E3]">
              {vehicle.driver ? (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-black text-[#145A32] uppercase tracking-wide">Driver</p>
                    <button
                      onClick={() => removeDriver(vehicle.id)}
                      className="text-xs text-red-500 font-bold hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                  <p className="font-bold text-[#111827] text-sm">{vehicle.driver.name}</p>
                  <p className="text-[#6B7280] text-xs">{vehicle.driver.phone}</p>
                  <p className="text-[#6B7280] text-xs">License: {vehicle.driver.license}</p>
                </div>
              ) : assignDriverId === vehicle.id ? (
                <div className="space-y-2">
                  <p className="text-xs font-black text-[#145A32] uppercase tracking-wide mb-2">
                    Assign Driver
                  </p>
                  {[
                    { label: "Full Name", key: "name" },
                    { label: "Phone", key: "phone" },
                    { label: "License No.", key: "license" },
                  ].map(({ label, key }) => (
                    <input
                      key={key}
                      type="text"
                      placeholder={label}
                      value={(driverForm as any)[key]}
                      onChange={(e) =>
                        setDriverForm((prev) => ({ ...prev, [key]: e.target.value }))
                      }
                      className="w-full px-2.5 py-1.5 text-xs border border-[#D5F5E3] rounded-lg focus:outline-none focus:border-[#2ECC71]"
                    />
                  ))}
                  <div className="flex gap-2 mt-1">
                    <button
                      onClick={() => saveDriver(vehicle.id)}
                      className="flex-1 py-1.5 bg-[#145A32] text-white text-xs font-bold rounded-lg"
                    >
                      Save Driver
                    </button>
                    <button
                      onClick={() => setAssignDriverId(null)}
                      className="flex-1 py-1.5 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-xs text-[#6B7280] font-semibold">No driver assigned</p>
                  <button
                    onClick={() => {
                      setAssignDriverId(vehicle.id);
                      setDriverForm({ name: "", phone: "", license: "" });
                    }}
                    className="text-xs font-bold text-[#2ECC71] hover:underline"
                  >
                    + Assign Driver
                  </button>
                </div>
              )}
            </div>

            {/* Availability toggle + Edit */}
            <div className="flex items-center justify-between pt-2 border-t border-[#D5F5E3]">
              <button
                onClick={() => toggleAvailability(vehicle.id)}
                className="flex items-center gap-2 text-sm font-bold transition"
              >
                {vehicle.available ? (
                  <>
                    <ToggleRight size={24} className="text-[#2ECC71]" />
                    <span className="text-[#2ECC71]">Available</span>
                  </>
                ) : (
                  <>
                    <ToggleLeft size={24} className="text-[#9CA3AF]" />
                    <span className="text-[#9CA3AF]">Unavailable</span>
                  </>
                )}
              </button>
              <button
                onClick={() => openEdit(vehicle)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#145A32] text-[#145A32] font-bold text-sm hover:bg-[#D5F5E3] transition"
              >
                <Edit2 size={14} />
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-[#D5F5E3]">
              <h2 className="text-xl font-black text-[#111827]">
                {editMode ? "Edit Vehicle" : "Add Vehicle"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-xl hover:bg-[#D5F5E3] transition"
              >
                <X size={18} className="text-[#145A32]" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Make", key: "make", type: "text" },
                  { label: "Model", key: "model", type: "text" },
                  { label: "Year", key: "year", type: "number" },
                  { label: "Capacity (seats)", key: "capacity", type: "number" },
                  { label: "Plate Number", key: "plate", type: "text" },
                  { label: "Color", key: "color", type: "text" },
                  { label: "Price per Day ($)", key: "pricePerDay", type: "number" },
                ].map(({ label, key, type }) => (
                  <div key={key} className={key === "pricePerDay" ? "col-span-2" : ""}>
                    <label className="block text-sm font-bold text-[#374151] mb-1">{label}</label>
                    <input
                      type={type}
                      value={(formData as Record<string, unknown>)[key] as string | number}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          [key]: type === "number" ? Number(e.target.value) : e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2.5 rounded-xl border border-[#D5F5E3] focus:outline-none focus:border-[#2ECC71] text-sm"
                    />
                  </div>
                ))}
              </div>

              {/* Dropdowns */}
              {[
                { label: "Vehicle Type", key: "type", options: VEHICLE_TYPES },
                { label: "Transmission", key: "transmission", options: TRANSMISSIONS },
                { label: "Fuel Type", key: "fuelType", options: FUEL_TYPES },
              ].map(({ label, key, options }) => (
                <div key={key}>
                  <label className="block text-sm font-bold text-[#374151] mb-1">{label}</label>
                  <select
                    value={(formData as Record<string, unknown>)[key] as string}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, [key]: e.target.value }))
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-[#D5F5E3] focus:outline-none focus:border-[#2ECC71] text-sm bg-white"
                  >
                    {options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              ))}

              <div>
                <label className="block text-sm font-bold text-[#374151] mb-1">
                  Features (comma-separated)
                </label>
                <input
                  type="text"
                  value={featuresInput}
                  onChange={(e) => setFeaturesInput(e.target.value)}
                  placeholder="AC, GPS, 4WD"
                  className="w-full px-3 py-2.5 rounded-xl border border-[#D5F5E3] focus:outline-none focus:border-[#2ECC71] text-sm"
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="text-sm font-bold text-[#374151]">Available</label>
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, available: !prev.available }))}
                >
                  {formData.available ? (
                    <ToggleRight size={28} className="text-[#2ECC71]" />
                  ) : (
                    <ToggleLeft size={28} className="text-[#9CA3AF]" />
                  )}
                </button>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-[#D5F5E3]">
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-[#D5F5E3] text-[#6B7280] font-bold text-sm hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-2.5 rounded-xl bg-[#145A32] text-white font-bold text-sm hover:bg-[#0e3d22] transition"
              >
                {editMode ? "Save Changes" : "Add Vehicle"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
