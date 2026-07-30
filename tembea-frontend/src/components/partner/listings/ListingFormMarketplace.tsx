"use client";

import { useState, useRef } from "react";
import {
  Plus, Trash2, X, Upload, Package, MapPin, DollarSign,
  Tag, Truck, ImageIcon, FileText, Globe, PlusCircle,
  CheckSquare, Star, Users, Mail, Phone, Link2, BarChart
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

export type MarketplaceCategory =
  | "arts-crafts" | "fashion" | "jewelry" | "home-decor"
  | "coffee" | "tea" | "food-products" | "beauty"
  | "leather" | "textiles" | "books" | "furniture"
  | "electronics" | "other";

export interface ProductVariant {
  id: string;
  attributes: { [key: string]: string }; // e.g. { size: "M", color: "Black" }
  price: number;
  stock: number;
}

export interface MarketplaceFormData {
  // 1. Product Information
  productName: string;
  category: MarketplaceCategory | "";
  subcategory: string;
  brand: string;
  sku: string;
  condition: string;

  // 2. Seller Info (auto-filled)
  businessName: string;
  sellerName: string;
  sellerPhone: string;
  sellerEmail: string;
  businessRegNumber: string;
  tin: string;

  // 3. Location
  province: string;
  district: string;
  sector: string;
  village: string;
  pickupAddress: string;
  gpsLocation: string;

  // 4. Pricing & Inventory
  currency: string;
  sellingPrice: number;
  discountPrice: number;
  stockQuantity: number;
  minimumOrderQuantity: number;
  maximumOrderQuantity: number;
  unit: string;

  // 5. Product Details
  shortDescription: string;
  fullDescription: string;
  productFeatures: string[];
  materialsUsed: string[];
  colors: string[];
  availableSizes: string[];
  weight: string;
  length: string;
  width: string;
  height: string;

  // Category-dynamic fields
  // Fashion
  fabric: string;
  gender: string;
  season: string;
  // Coffee
  roastLevel: string;
  coffeeOrigin: string;
  coffeeWeight: string;
  organic: boolean;
  processingMethod: string;
  // Tea
  teaType: string;
  teaFlavor: string;
  // Jewelry
  gemstone: string;
  jewelryMaterial: string;
  jewelryWeight: string;
  // Furniture
  assemblyRequired: boolean;
  // Food
  expiryDate: string;
  ingredients: string;
  nutritionFacts: string;
  storageInstructions: string;
  // Beauty
  skinType: string;
  beautyExpiryDate: string;
  usageInstructions: string;
  // Crafts
  artisanName: string;

  // 6. Variants
  variants: ProductVariant[];

  // 7. Shipping
  deliveryAvailable: boolean;
  deliveryMethods: string[];
  deliveryFee: number;
  freeDelivery: boolean;
  deliveryAreas: string[];
  estimatedDeliveryTime: string;

  // 8. Images
  coverImage: string;
  galleryImages: string[];

  // 9. Video
  promoVideo: string;

  // 10. SEO
  productSlug: string;
  metaDescription: string;
  keywords: string;

  // 11. Status
  madeInRwanda: boolean;
}

const CATEGORIES: { value: MarketplaceCategory; label: string; icon: string }[] = [
  { value: "arts-crafts", label: "Arts & Crafts", icon: "🧶" },
  { value: "fashion", label: "Fashion & Clothing", icon: "👗" },
  { value: "jewelry", label: "Jewelry", icon: "💍" },
  { value: "home-decor", label: "Home Decor", icon: "🏡" },
  { value: "coffee", label: "Coffee", icon: "☕" },
  { value: "tea", label: "Tea", icon: "🍵" },
  { value: "food-products", label: "Food Products", icon: "🍎" },
  { value: "beauty", label: "Beauty & Cosmetics", icon: "💄" },
  { value: "leather", label: "Leather Products", icon: "👜" },
  { value: "textiles", label: "Textiles", icon: "🧵" },
  { value: "books", label: "Books", icon: "📚" },
  { value: "furniture", label: "Furniture", icon: "🪑" },
  { value: "electronics", label: "Electronics", icon: "💡" },
  { value: "other", label: "Other", icon: "📦" },
];

const SUBCATEGORIES: Record<string, string[]> = {
  fashion: ["Shirts", "Dresses", "Shoes", "Bags", "Accessories", "Trousers", "Jackets"],
  coffee: ["Coffee Beans", "Ground Coffee", "Instant Coffee", "Gift Pack"],
  tea: ["Black Tea", "Green Tea", "Herbal Tea", "Fruit Tea"],
  "arts-crafts": ["Basket", "Pottery", "Wood Carving", "Painting", "Decoration"],
  jewelry: ["Necklace", "Bracelet", "Ring", "Earrings", "Anklet"],
  furniture: ["Chair", "Table", "Bed", "Shelf", "Cabinet"],
  "food-products": ["Fruits", "Vegetables", "Grains", "Spices", "Sauces"],
  beauty: ["Skincare", "Hair Care", "Body Care", "Makeup"],
};

const CONDITIONS = ["New", "Handmade", "Refurbished", "Vintage"];
const UNITS = ["Piece", "Set", "Kilogram", "Gram", "Liter", "Pack", "Bottle", "Box", "Bag", "Dozen"];
const CURRENCIES = ["RWF", "USD", "EUR"];
const FEATURES = ["Handmade", "Organic", "Eco-friendly", "Fair Trade", "Recyclable", "Traditional", "Export Quality", "Food Grade", "Waterproof"];
const MATERIALS = ["Natural Sisal", "Banana Fiber", "Leather", "Cotton", "Wool", "Wood", "Clay", "Bamboo", "Raffia", "Silk"];
const DELIVERY_METHODS = ["Pickup", "Home Delivery", "Courier", "Motorbike Delivery", "Bus Delivery"];
const DELIVERY_AREAS = ["Kigali", "Northern Province", "Southern Province", "Eastern Province", "Western Province", "Nationwide", "International"];
const DELIVERY_TIMES = ["Same Day", "1 Day", "2–3 Days", "1 Week", "2 Weeks"];
const COLORS = ["Black", "Brown", "White", "Green", "Blue", "Red", "Yellow", "Orange", "Purple", "Pink", "Grey", "Natural"];

type Props = {
  data: Partial<MarketplaceFormData>;
  updateField: (field: string, value: any) => void;
};

export function MarketplaceForm({ data, updateField }: Props) {
  const [activeTab, setActiveTab] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTarget, setUploadTarget] = useState<string | null>(null);

  const form = data as MarketplaceFormData;
  const category = form.category || "";

  const toggleArrayItem = (field: string, item: string) => {
    const current = (form[field as keyof MarketplaceFormData] as string[]) || [];
    if (current.includes(item)) {
      updateField(field, current.filter(i => i !== item));
    } else {
      updateField(field, [...current, item]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadTarget) return;
    const url = URL.createObjectURL(file);
    if (uploadTarget === "galleryImages") {
      const current = form.galleryImages || [];
      updateField("galleryImages", [...current, url]);
    } else {
      updateField(uploadTarget, url);
    }
    setUploadTarget(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const triggerUpload = (target: string) => {
    setUploadTarget(target);
    fileInputRef.current?.click();
  };

  // Variant helpers
  const addVariant = () => {
    const variants = form.variants || [];
    updateField("variants", [...variants, { id: Date.now().toString(), attributes: {}, price: form.sellingPrice || 0, stock: 0 }]);
  };
  const updateVariant = (id: string, field: string, value: any) => {
    updateField("variants", (form.variants || []).map(v => v.id === id ? { ...v, [field]: value } : v));
  };
  const removeVariant = (id: string) => {
    updateField("variants", (form.variants || []).filter(v => v.id !== id));
  };

  const tabs = [
    { id: 1, label: "Product Info", icon: Package },
    { id: 2, label: "Pricing", icon: DollarSign },
    { id: 3, label: "Details", icon: FileText },
    { id: 4, label: "Variants", icon: BarChart },
    { id: 5, label: "Shipping", icon: Truck },
    { id: 6, label: "Images", icon: ImageIcon },
    { id: 7, label: "SEO", icon: Globe },
  ];

  return (
    <div className="bg-white rounded-3xl shadow-xl border-2 border-amber-100 overflow-hidden">
      <input type="file" ref={fileInputRef} className="hidden" accept={uploadTarget === "promoVideo" ? "video/*" : "image/*"} onChange={handleFileUpload} />

      {/* Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto bg-amber-50/30">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3.5 px-4 font-bold text-xs border-b-4 transition-colors whitespace-nowrap ${
                activeTab === tab.id ? "border-amber-600 text-amber-800 bg-white" : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-amber-50"
              }`}>
              <Icon size={15} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="p-8">

        {/* ── TAB 1: Product Info ───────────────────────────────────── */}
        {activeTab === 1 && (
          <div className="space-y-8">
            <div className="flex items-center gap-4 border-b border-gray-100 pb-5">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <Package className="text-amber-700" size={22} />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900">Product Information</h3>
                <p className="text-sm text-gray-500 font-semibold">Basic info about what you are selling</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-1">Product Name *</label>
                <input type="text" value={form.productName || ""} onChange={e => updateField("productName", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-amber-500 outline-none font-semibold text-lg"
                  placeholder="e.g. Handmade Agaseke Basket" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Product Category *</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {CATEGORIES.map(cat => (
                    <button key={cat.value} type="button" onClick={() => { updateField("category", cat.value); updateField("subcategory", ""); }}
                      className={`p-2.5 rounded-xl border-2 font-bold text-xs flex items-center gap-2 transition-all ${
                        category === cat.value ? "border-amber-600 bg-amber-600 text-white" : "border-gray-200 text-gray-700 hover:border-amber-400"
                      }`}>
                      <span>{cat.icon}</span> {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subcategory (dynamic) */}
              {category && SUBCATEGORIES[category] && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Subcategory</label>
                  <div className="flex flex-wrap gap-2">
                    {SUBCATEGORIES[category].map(sub => (
                      <button key={sub} type="button" onClick={() => updateField("subcategory", sub)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${form.subcategory === sub ? "bg-amber-500 text-white border-amber-500" : "border-gray-200 text-gray-700 hover:border-amber-300"}`}>
                        {sub}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Brand <span className="text-xs text-gray-400 font-normal">(Optional)</span></label>
                <input type="text" value={form.brand || ""} onChange={e => updateField("brand", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-amber-500 outline-none font-semibold"
                  placeholder="e.g. Rwanda Crafts Co." />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Product SKU</label>
                <input type="text" value={form.sku || ""} onChange={e => updateField("sku", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-amber-500 outline-none font-semibold font-mono"
                  placeholder="e.g. MRW-000123" />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Product Condition</label>
                <div className="flex flex-wrap gap-2">
                  {CONDITIONS.map(c => (
                    <button key={c} type="button" onClick={() => updateField("condition", c)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${form.condition === c ? "bg-amber-500 text-white border-amber-500" : "border-gray-200 text-gray-700 hover:border-amber-300"}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="pt-6 border-t border-gray-100">
              <h4 className="font-black text-gray-900 mb-4 flex items-center gap-2"><MapPin size={16} /> Product Location</h4>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { field: "province", label: "Province", ph: "e.g. Kigali City" },
                  { field: "district", label: "District", ph: "e.g. Gasabo" },
                  { field: "sector", label: "Sector", ph: "e.g. Kimironko" },
                  { field: "village", label: "Village", ph: "e.g. Kagarama" },
                  { field: "pickupAddress", label: "Pickup Address", ph: "e.g. KG 15 Ave" },
                  { field: "gpsLocation", label: "GPS Location (Optional)", ph: "https://goo.gl/maps/..." },
                ].map(f => (
                  <div key={f.field}>
                    <label className="block text-xs font-bold text-gray-600 mb-1">{f.label}</label>
                    <input type="text" value={(form as any)[f.field] || ""} onChange={e => updateField(f.field, e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-amber-500 outline-none font-semibold text-sm"
                      placeholder={f.ph} />
                  </div>
                ))}
              </div>
            </div>

            {/* Made in Rwanda */}
            <div className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${form.madeInRwanda ? "border-green-400 bg-green-50" : "border-gray-200"}`}
              onClick={() => updateField("madeInRwanda", !form.madeInRwanda)}>
              <div className={`w-7 h-7 rounded border-2 flex items-center justify-center text-lg font-bold ${form.madeInRwanda ? "bg-green-500 border-green-500 text-white" : "border-gray-300"}`}>
                {form.madeInRwanda ? "✓" : ""}
              </div>
              <div>
                <span className="font-black text-gray-900">🇷🇼 Made in Rwanda</span>
                <p className="text-xs text-gray-500 font-semibold">Check this if the product is made locally in Rwanda</p>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: Pricing & Inventory ───────────────────────────── */}
        {activeTab === 2 && (
          <div className="space-y-8">
            <div className="flex items-center gap-4 border-b border-gray-100 pb-5">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <DollarSign className="text-green-700" size={22} />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900">Pricing & Inventory</h3>
                <p className="text-sm text-gray-500 font-semibold">Set your price, stock, and currency</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Currency</label>
              <div className="flex gap-3">
                {CURRENCIES.map(c => (
                  <button key={c} type="button" onClick={() => updateField("currency", c)}
                    className={`px-6 py-2.5 rounded-xl font-black border-2 transition-all ${form.currency === c ? "bg-green-600 text-white border-green-600" : "border-gray-200 text-gray-700 hover:border-green-400"}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Selling Price *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400 font-bold">{form.currency || "$"}</div>
                  <input type="number" value={form.sellingPrice || ""} onChange={e => updateField("sellingPrice", Number(e.target.value))}
                    className="w-full pl-14 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 outline-none font-black text-xl"
                    placeholder="0" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Discount Price <span className="text-xs text-gray-400 font-normal">(Optional)</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400 font-bold">{form.currency || "$"}</div>
                  <input type="number" value={form.discountPrice || ""} onChange={e => updateField("discountPrice", Number(e.target.value))}
                    className="w-full pl-14 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 outline-none font-semibold"
                    placeholder="0" />
                </div>
                {form.discountPrice > 0 && form.sellingPrice > 0 && (
                  <div className="mt-1 text-xs font-bold text-green-600">
                    {Math.round(((form.sellingPrice - form.discountPrice) / form.sellingPrice) * 100)}% off
                  </div>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Stock Quantity *</label>
                <input type="number" value={form.stockQuantity || ""} onChange={e => updateField("stockQuantity", Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 outline-none font-semibold" placeholder="e.g. 50" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Min Order Qty</label>
                <input type="number" value={form.minimumOrderQuantity || ""} onChange={e => updateField("minimumOrderQuantity", Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 outline-none font-semibold" placeholder="e.g. 1" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Max Order Qty</label>
                <input type="number" value={form.maximumOrderQuantity || ""} onChange={e => updateField("maximumOrderQuantity", Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 outline-none font-semibold" placeholder="Optional" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Unit of Measure</label>
              <div className="flex flex-wrap gap-2">
                {UNITS.map(u => (
                  <button key={u} type="button" onClick={() => updateField("unit", u)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ${form.unit === u ? "bg-green-500 text-white border-green-500" : "border-gray-200 text-gray-700 hover:border-green-300"}`}>
                    {u}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: Product Details ───────────────────────────────── */}
        {activeTab === 3 && (
          <div className="space-y-8">
            <div className="flex items-center gap-4 border-b border-gray-100 pb-5">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <FileText className="text-blue-700" size={22} />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900">Product Details</h3>
                <p className="text-sm text-gray-500 font-semibold">Description, features, and specifications</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Short Description <span className="text-xs font-normal text-gray-400">(max 150 chars)</span></label>
              <input type="text" maxLength={150} value={form.shortDescription || ""} onChange={e => updateField("shortDescription", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none font-semibold"
                placeholder="e.g. Handmade basket woven by women cooperatives in Rwanda." />
              <div className="text-xs text-right text-gray-400 mt-1">{(form.shortDescription || "").length}/150</div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Full Description</label>
              <textarea value={form.fullDescription || ""} onChange={e => updateField("fullDescription", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none font-semibold min-h-[150px]"
                placeholder="Explain material, usage, manufacturing process, care instructions..." />
            </div>

            {/* Product Features */}
            <div>
              <label className="block text-sm font-black text-gray-900 mb-2 uppercase">Product Features</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {FEATURES.map(f => {
                  const isSelected = (form.productFeatures || []).includes(f);
                  return (
                    <label key={f} className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-200"}`}
                      onClick={() => toggleArrayItem("productFeatures", f)}>
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${isSelected ? "bg-blue-600 border-blue-600 text-white" : "border-gray-300"}`}>
                        {isSelected && <CheckSquare size={13} />}
                      </div>
                      <span className={`text-sm font-bold ${isSelected ? "text-blue-900" : "text-gray-700"}`}>{f}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Materials */}
              <div>
                <label className="block text-sm font-black text-gray-900 mb-2 uppercase">Materials Used</label>
                <div className="flex flex-wrap gap-2">
                  {MATERIALS.map(m => {
                    const isSelected = (form.materialsUsed || []).includes(m);
                    return (
                      <button key={m} type="button" onClick={() => toggleArrayItem("materialsUsed", m)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ${isSelected ? "bg-blue-500 text-white border-blue-500" : "border-gray-200 text-gray-700 hover:border-blue-300"}`}>
                        {m}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Colors */}
              <div>
                <label className="block text-sm font-black text-gray-900 mb-2 uppercase">Available Colors</label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map(c => {
                    const isSelected = (form.colors || []).includes(c);
                    return (
                      <button key={c} type="button" onClick={() => toggleArrayItem("colors", c)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ${isSelected ? "bg-blue-500 text-white border-blue-500" : "border-gray-200 text-gray-700 hover:border-blue-300"}`}>
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Dimensions & Weight */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
              {[
                { field: "weight", label: "Weight", ph: "e.g. 0.5 kg" },
                { field: "length", label: "Length", ph: "e.g. 30 cm" },
                { field: "width", label: "Width", ph: "e.g. 20 cm" },
                { field: "height", label: "Height", ph: "e.g. 15 cm" },
              ].map(f => (
                <div key={f.field}>
                  <label className="block text-xs font-bold text-gray-600 mb-1">{f.label}</label>
                  <input type="text" value={(form as any)[f.field] || ""} onChange={e => updateField(f.field, e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none font-semibold text-sm"
                    placeholder={f.ph} />
                </div>
              ))}
            </div>

            {/* Category-specific dynamic fields */}
            {category === "fashion" && (
              <div className="pt-4 border-t border-gray-100 space-y-4">
                <h4 className="text-sm font-black text-gray-800 uppercase">Fashion Details</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { field: "fabric", label: "Fabric", ph: "e.g. Cotton" },
                    { field: "gender", label: "Gender", ph: "Men / Women / Unisex" },
                    { field: "season", label: "Season", ph: "e.g. All Season" },
                  ].map(f => (
                    <div key={f.field}>
                      <label className="block text-xs font-bold text-gray-600 mb-1">{f.label}</label>
                      <input type="text" value={(form as any)[f.field] || ""} onChange={e => updateField(f.field, e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none font-semibold text-sm" placeholder={f.ph} />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Available Sizes</label>
                  <div className="flex flex-wrap gap-2">
                    {["XS","S","M","L","XL","XXL","XXXL","38","39","40","41","42","43","44"].map(s => {
                      const isSelected = (form.availableSizes || []).includes(s);
                      return (
                        <button key={s} type="button" onClick={() => toggleArrayItem("availableSizes", s)}
                          className={`w-12 h-10 rounded-xl text-sm font-bold border-2 transition-all ${isSelected ? "bg-blue-500 text-white border-blue-500" : "border-gray-200 text-gray-700 hover:border-blue-300"}`}>
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {category === "coffee" && (
              <div className="pt-4 border-t border-gray-100 space-y-4">
                <h4 className="text-sm font-black text-gray-800 uppercase">Coffee Details</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { field: "roastLevel", label: "Roast Level", ph: "Light / Medium / Dark" },
                    { field: "coffeeOrigin", label: "Origin", ph: "e.g. Western Rwanda" },
                    { field: "coffeeWeight", label: "Weight", ph: "e.g. 500g" },
                    { field: "processingMethod", label: "Processing Method", ph: "Washed / Natural" },
                  ].map(f => (
                    <div key={f.field}>
                      <label className="block text-xs font-bold text-gray-600 mb-1">{f.label}</label>
                      <input type="text" value={(form as any)[f.field] || ""} onChange={e => updateField(f.field, e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-amber-500 outline-none font-semibold text-sm" placeholder={f.ph} />
                    </div>
                  ))}
                </div>
                <label className="flex items-center gap-3 cursor-pointer" onClick={() => updateField("organic", !form.organic)}>
                  <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${form.organic ? "bg-green-500 border-green-500 text-white" : "border-gray-300"}`}>
                    {form.organic && <CheckSquare size={14} />}
                  </div>
                  <span className="font-bold text-gray-800">Organic Certified</span>
                </label>
              </div>
            )}

            {category === "food-products" && (
              <div className="pt-4 border-t border-gray-100 space-y-4">
                <h4 className="text-sm font-black text-gray-800 uppercase">Food Details</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { field: "expiryDate", label: "Expiry Date", ph: "e.g. 12/2026" },
                    { field: "storageInstructions", label: "Storage Instructions", ph: "e.g. Keep refrigerated" },
                  ].map(f => (
                    <div key={f.field}>
                      <label className="block text-xs font-bold text-gray-600 mb-1">{f.label}</label>
                      <input type="text" value={(form as any)[f.field] || ""} onChange={e => updateField(f.field, e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 outline-none font-semibold text-sm" placeholder={f.ph} />
                    </div>
                  ))}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-600 mb-1">Ingredients</label>
                    <textarea value={form.ingredients || ""} onChange={e => updateField("ingredients", e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 outline-none font-semibold text-sm min-h-[80px]" placeholder="List key ingredients..." />
                  </div>
                </div>
              </div>
            )}

            {category === "jewelry" && (
              <div className="pt-4 border-t border-gray-100 space-y-4">
                <h4 className="text-sm font-black text-gray-800 uppercase">Jewelry Details</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { field: "jewelryMaterial", label: "Material", ph: "e.g. Sterling Silver" },
                    { field: "gemstone", label: "Gemstone", ph: "e.g. Ruby" },
                    { field: "jewelryWeight", label: "Weight (grams)", ph: "e.g. 12g" },
                  ].map(f => (
                    <div key={f.field}>
                      <label className="block text-xs font-bold text-gray-600 mb-1">{f.label}</label>
                      <input type="text" value={(form as any)[f.field] || ""} onChange={e => updateField(f.field, e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 outline-none font-semibold text-sm" placeholder={f.ph} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {category === "arts-crafts" && (
              <div className="pt-4 border-t border-gray-100">
                <label className="block text-sm font-bold text-gray-700 mb-1">Artisan Name</label>
                <input type="text" value={form.artisanName || ""} onChange={e => updateField("artisanName", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-amber-500 outline-none font-semibold"
                  placeholder="e.g. Marie Mutesi" />
              </div>
            )}

            {category === "beauty" && (
              <div className="pt-4 border-t border-gray-100 space-y-4">
                <h4 className="text-sm font-black text-gray-800 uppercase">Beauty Details</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { field: "skinType", label: "Skin Type", ph: "Oily / Dry / Combination / All" },
                    { field: "beautyExpiryDate", label: "Expiry Date", ph: "e.g. 06/2027" },
                  ].map(f => (
                    <div key={f.field}>
                      <label className="block text-xs font-bold text-gray-600 mb-1">{f.label}</label>
                      <input type="text" value={(form as any)[f.field] || ""} onChange={e => updateField(f.field, e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 outline-none font-semibold text-sm" placeholder={f.ph} />
                    </div>
                  ))}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-600 mb-1">Usage Instructions</label>
                    <textarea value={form.usageInstructions || ""} onChange={e => updateField("usageInstructions", e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 outline-none font-semibold text-sm min-h-[80px]" placeholder="How to use this product..." />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 4: Product Variants ─────────────────────────────── */}
        {activeTab === 4 && (
          <div className="space-y-8">
            <div className="flex items-center justify-between border-b border-gray-100 pb-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center">
                  <BarChart className="text-violet-700" size={22} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900">Product Variants</h3>
                  <p className="text-sm text-gray-500 font-semibold">Sizes, colors, weights — each with their own price</p>
                </div>
              </div>
              <button onClick={addVariant}
                className="px-4 py-2 bg-violet-600 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-violet-700 transition-all shadow-md">
                <PlusCircle size={18} /> Add Variant
              </button>
            </div>

            {(!form.variants || form.variants.length === 0) ? (
              <div className="p-10 bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl text-center">
                <BarChart size={40} className="text-gray-300 mb-3 mx-auto" />
                <h4 className="font-black text-gray-800 mb-1">No Variants Yet</h4>
                <p className="text-sm text-gray-500 mb-4">Add variants if this product comes in different sizes, colors, or weights with different prices.</p>
                <button onClick={addVariant} className="px-5 py-2 bg-white border-2 border-gray-200 hover:border-violet-400 text-gray-700 font-bold rounded-xl text-sm">
                  Add First Variant
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {form.variants.map((variant, idx) => (
                  <div key={variant.id} className="p-5 rounded-2xl border-2 border-gray-200 bg-white group relative">
                    <button onClick={() => removeVariant(variant.id)}
                      className="absolute top-4 right-4 text-red-400 hover:text-red-600 p-1 bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 size={16} />
                    </button>
                    <h4 className="font-black text-gray-900 mb-4 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-violet-100 text-violet-800 flex items-center justify-center text-xs">{idx + 1}</span>
                      Variant {idx + 1}
                    </h4>
                    <div className="grid md:grid-cols-4 gap-4">
                      {["Size", "Color", "Weight", "Style"].map(attr => (
                        <div key={attr}>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{attr}</label>
                          <input type="text" value={variant.attributes[attr.toLowerCase()] || ""}
                            onChange={e => updateVariant(variant.id, "attributes", { ...variant.attributes, [attr.toLowerCase()]: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-violet-500 outline-none font-semibold text-sm"
                            placeholder={`e.g. ${attr === "Size" ? "M" : attr === "Color" ? "Black" : attr === "Weight" ? "250g" : "Classic"}`} />
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Price</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 font-bold">{form.currency || "$"}</div>
                          <input type="number" value={variant.price || ""}
                            onChange={e => updateVariant(variant.id, "price", Number(e.target.value))}
                            className="w-full pl-8 pr-3 py-2 rounded-lg border-2 border-violet-200 focus:border-violet-500 outline-none font-black text-violet-700"
                            placeholder="0" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Stock</label>
                        <input type="number" value={variant.stock || ""}
                          onChange={e => updateVariant(variant.id, "stock", Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-violet-500 outline-none font-semibold text-sm"
                          placeholder="qty" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 5: Shipping ──────────────────────────────────────── */}
        {activeTab === 5 && (
          <div className="space-y-8">
            <div className="flex items-center gap-4 border-b border-gray-100 pb-5">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                <Truck className="text-indigo-700" size={22} />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900">Shipping & Delivery</h3>
                <p className="text-sm text-gray-500 font-semibold">How buyers will receive their order</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Delivery Available?</label>
              <div className="flex gap-4">
                {[{ v: true, l: "Yes" }, { v: false, l: "No — Pickup Only" }].map(opt => (
                  <button key={opt.l} type="button" onClick={() => updateField("deliveryAvailable", opt.v)}
                    className={`px-6 py-3 rounded-xl font-bold border-2 transition-all ${form.deliveryAvailable === opt.v ? "bg-indigo-600 text-white border-indigo-600" : "border-gray-200 text-gray-700 hover:border-indigo-300"}`}>
                    {opt.l}
                  </button>
                ))}
              </div>
            </div>

            {form.deliveryAvailable && (
              <>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Delivery Methods</label>
                  <div className="flex flex-wrap gap-2">
                    {DELIVERY_METHODS.map(m => {
                      const isSelected = (form.deliveryMethods || []).includes(m);
                      return (
                        <button key={m} type="button" onClick={() => toggleArrayItem("deliveryMethods", m)}
                          className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${isSelected ? "bg-indigo-500 text-white border-indigo-500" : "border-gray-200 text-gray-700 hover:border-indigo-300"}`}>
                          {isSelected ? "✓ " : ""}{m}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Delivery Fee</label>
                    <div className="flex gap-3">
                      <button type="button" onClick={() => updateField("freeDelivery", true)}
                        className={`flex-1 py-3 rounded-xl font-bold border-2 transition-all ${form.freeDelivery ? "bg-green-500 text-white border-green-500" : "border-gray-200 text-gray-700 hover:border-green-300"}`}>
                        🎁 Free Delivery
                      </button>
                      <button type="button" onClick={() => updateField("freeDelivery", false)}
                        className={`flex-1 py-3 rounded-xl font-bold border-2 transition-all ${form.freeDelivery === false ? "bg-indigo-500 text-white border-indigo-500" : "border-gray-200 text-gray-700 hover:border-indigo-300"}`}>
                        Set Fee
                      </button>
                    </div>
                    {!form.freeDelivery && (
                      <div className="mt-3">
                        <input type="number" value={form.deliveryFee || ""} onChange={e => updateField("deliveryFee", Number(e.target.value))}
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 outline-none font-semibold"
                          placeholder="Delivery fee (RWF)" />
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Estimated Delivery Time</label>
                    <div className="flex flex-wrap gap-2">
                      {DELIVERY_TIMES.map(t => (
                        <button key={t} type="button" onClick={() => updateField("estimatedDeliveryTime", t)}
                          className={`px-3 py-2 rounded-xl text-xs font-bold border-2 transition-all ${form.estimatedDeliveryTime === t ? "bg-indigo-500 text-white border-indigo-500" : "border-gray-200 text-gray-700 hover:border-indigo-300"}`}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Delivery Areas</label>
                  <div className="flex flex-wrap gap-2">
                    {DELIVERY_AREAS.map(area => {
                      const isSelected = (form.deliveryAreas || []).includes(area);
                      return (
                        <button key={area} type="button" onClick={() => toggleArrayItem("deliveryAreas", area)}
                          className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${isSelected ? "bg-indigo-500 text-white border-indigo-500" : "border-gray-200 text-gray-700 hover:border-indigo-300"}`}>
                          {isSelected ? "✓ " : ""}{area}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── TAB 6: Images ────────────────────────────────────────── */}
        {activeTab === 6 && (
          <div className="space-y-8">
            <div className="flex items-center gap-4 border-b border-gray-100 pb-5">
              <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center">
                <ImageIcon className="text-pink-600" size={22} />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900">Product Images</h3>
                <p className="text-sm text-gray-500 font-semibold">Recommended: 1200×1200px. Up to 10 photos.</p>
              </div>
            </div>

            <div className="relative h-56 rounded-2xl border-2 border-dashed border-gray-300 overflow-hidden cursor-pointer hover:border-pink-400 hover:bg-pink-50 transition-all group"
              onClick={() => triggerUpload("coverImage")}>
              {form.coverImage ? (
                <>
                  <img src={form.coverImage} alt="Cover" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold">
                    <Upload size={20} className="mr-2" /> Change Cover
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                  <ImageIcon size={36} className="mb-2" />
                  <span className="font-bold text-lg">Cover Image *</span>
                  <span className="text-sm">Main product photo</span>
                </div>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="font-bold text-gray-800">Additional Photos <span className="text-xs text-gray-400 font-normal">(max 10)</span></label>
                <button onClick={() => triggerUpload("galleryImages")} disabled={(form.galleryImages || []).length >= 10}
                  className="flex items-center gap-2 px-4 py-2 bg-pink-50 text-pink-700 font-bold rounded-xl border border-pink-200 hover:bg-pink-100 transition-all text-sm disabled:opacity-40">
                  <Plus size={16} /> Add Photo
                </button>
              </div>
              {(form.galleryImages || []).length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {(form.galleryImages || []).map((img, idx) => (
                    <div key={idx} className="aspect-square rounded-xl overflow-hidden relative group border border-gray-200">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button onClick={() => {
                        const arr = [...(form.galleryImages || [])];
                        arr.splice(idx, 1);
                        updateField("galleryImages", arr);
                      }} className="absolute top-1 right-1 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 bg-gray-50 rounded-xl border border-gray-200 text-center text-sm text-gray-500 font-semibold">No additional photos yet</div>
              )}
            </div>

            {/* Video */}
            <div className="pt-4 border-t border-gray-100">
              <label className="block text-sm font-bold text-gray-700 mb-1">Product Video <span className="text-xs text-gray-400 font-normal">(Optional)</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Link2 size={16} className="text-gray-400" />
                </div>
                <input type="text" value={form.promoVideo || ""} onChange={e => updateField("promoVideo", e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-pink-500 outline-none font-semibold"
                  placeholder="Paste YouTube or Vimeo URL" />
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 7: SEO ───────────────────────────────────────────── */}
        {activeTab === 7 && (
          <div className="space-y-8">
            <div className="flex items-center gap-4 border-b border-gray-100 pb-5">
              <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center">
                <Globe className="text-teal-600" size={22} />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900">SEO & Discoverability</h3>
                <p className="text-sm text-gray-500 font-semibold">Help customers find your product online</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Product URL Slug</label>
              <div className="flex">
                <div className="px-4 py-3 bg-gray-100 border-2 border-r-0 border-gray-200 rounded-l-xl text-sm text-gray-500 font-semibold whitespace-nowrap">tembea.rw/market/</div>
                <input type="text" value={form.productSlug || ""} onChange={e => updateField("productSlug", e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-r-xl focus:border-teal-500 outline-none font-semibold font-mono text-sm"
                  placeholder="handmade-rwanda-basket" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Meta Description</label>
              <textarea value={form.metaDescription || ""} onChange={e => updateField("metaDescription", e.target.value)} maxLength={160}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-teal-500 outline-none font-semibold min-h-[80px]"
                placeholder="Brief description for search engines (max 160 chars)" />
              <div className="text-xs text-right text-gray-400 mt-1">{(form.metaDescription || "").length}/160</div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Keywords</label>
              <input type="text" value={form.keywords || ""} onChange={e => updateField("keywords", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-teal-500 outline-none font-semibold"
                placeholder="e.g. rwanda basket, handmade, agaseke, souvenir" />
              <p className="text-xs text-gray-500 mt-1 font-semibold">Comma-separated keywords to help customers find your product</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
