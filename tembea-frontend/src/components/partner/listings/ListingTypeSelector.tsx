"use client";

import { 
  Hotel, 
  TreePine, 
  Ticket, 
  ShoppingBag, 
  Utensils, 
  Compass, 
  Car,
  Landmark,
  Church,
  UserRound
} from "lucide-react";
import type { ListingType } from "@/types/listing.types";

type ListingTypeOption = {
  type: ListingType;
  icon: typeof Hotel;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
};

const listingTypes: ListingTypeOption[] = [
  {
    type: "accommodation",
    icon: Hotel,
    label: "Accommodation",
    description: "Hotels, apartments, lodges, guest houses",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200"
  },
  {
    type: "parks",
    icon: TreePine,
    label: "National Parks",
    description: "Safari tours, wildlife experiences, nature reserves",
    color: "text-green-700",
    bgColor: "bg-green-50",
    borderColor: "border-green-200"
  },
  {
    type: "events",
    icon: Ticket,
    label: "Events & Tickets",
    description: "Concerts, festivals, conferences, cultural events",
    color: "text-purple-700",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200"
  },
  {
    type: "marketplace",
    icon: ShoppingBag,
    label: "Made in Rwanda",
    description: "Crafts, fashion, coffee, tea, local products",
    color: "text-amber-700",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200"
  },
  {
    type: "restaurants",
    icon: Utensils,
    label: "Restaurants",
    description: "Dining, cafes, local cuisine, fine dining",
    color: "text-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-red-200"
  },
  {
    type: "tours",
    icon: Compass,
    label: "Tours & Experiences",
    description: "Guided tours, adventures, cultural experiences",
    color: "text-teal-700",
    bgColor: "bg-teal-50",
    borderColor: "border-teal-200"
  },
  {
    type: "transport",
    icon: Car,
    label: "Transportation",
    description: "Car rental, transfers, airport services",
    color: "text-gray-700",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200"
  },
  {
    type: "museums",
    icon: Landmark,
    label: "Museums",
    description: "Historical museums, cultural exhibits, art galleries",
    color: "text-rose-700",
    bgColor: "bg-rose-50",
    borderColor: "border-rose-200"
  },
  {
    type: "memorial-sites",
    icon: Church,
    label: "Memorial Sites",
    description: "Genocide memorials, war memorials, heritage sites",
    color: "text-indigo-700",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200"
  },
  {
    type: "guides",
    icon: UserRound,
    label: "Tour Guides",
    description: "Professional guides for trekking, city tours, safaris",
    color: "text-cyan-700",
    bgColor: "bg-cyan-50",
    borderColor: "border-cyan-200"
  }
];

type Props = {
  onSelectType: (type: ListingType) => void;
};

export function ListingTypeSelector({ onSelectType }: Props) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {listingTypes.map((option) => {
        const Icon = option.icon;
        return (
          <button
            key={option.type}
            onClick={() => onSelectType(option.type)}
            className={`
              group relative overflow-hidden
              rounded-3xl border-2 ${option.borderColor}
              ${option.bgColor} backdrop-blur-sm
              p-6 text-left
              transition-all duration-300
              hover:scale-105 hover:shadow-xl hover:-translate-y-2
              focus:outline-none focus:ring-4 focus:ring-emerald-500/30
            `}
          >
            {/* Background gradient on hover */}
            <div className={`
              absolute inset-0 bg-gradient-to-br from-white/50 to-transparent
              opacity-0 group-hover:opacity-100 transition-opacity duration-300
            `} />
            
            {/* Content */}
            <div className="relative z-10">
              <div className={`
                ${option.color} mb-4
                transform transition-transform duration-300
                group-hover:scale-110 group-hover:rotate-3
              `}>
                <Icon size={36} strokeWidth={2} />
              </div>
              
              <h3 className="text-xl font-black text-gray-800 mb-2">
                {option.label}
              </h3>
              
              <p className="text-sm font-semibold text-gray-600 leading-relaxed">
                {option.description}
              </p>

              {/* Arrow indicator */}
              <div className={`
                mt-4 flex items-center gap-2 text-sm font-bold ${option.color}
                transform translate-x-0 group-hover:translate-x-2 transition-transform
              `}>
                <span>Select</span>
                <span>→</span>
              </div>
            </div>

            {/* Decorative corner */}
            <div className={`
              absolute -top-8 -right-8 w-24 h-24 ${option.bgColor}
              rounded-full opacity-50 blur-2xl
              transform scale-0 group-hover:scale-100 transition-transform duration-500
            `} />
          </button>
        );
      })}
    </div>
  );
}
