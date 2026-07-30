"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  Loader2,
  Package,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { PartnerListingPicker } from "@/components/partner/PartnerListingPicker";
import { usePartnerListings } from "@/hooks/usePartnerListings";
import { productsApi } from "@/lib/api-client";
import { formatCurrency } from "@/utils/formatters/currency";
import type { Product } from "@/types/api.types";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  stock: "0",
  images: "",
  category: "",
  sku: "",
  weight: "",
  tags: "",
  featured: false,
};

function splitValues(value: string) {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function PartnerProductsPage() {
  const listingState = usePartnerListings("MARKETPLACE");
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [actionId, setActionId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadProducts = useCallback(async () => {
    if (!listingState.selectedListingId) {
      setProducts([]);
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const response = await productsApi.getByListing(listingState.selectedListingId);
      setProducts(Array.isArray(response) ? response : []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Products could not be loaded.");
    } finally {
      setIsLoading(false);
    }
  }, [listingState.selectedListingId]);

  useEffect(() => {
    setEditingId(null);
    setForm(emptyForm);
    loadProducts();
  }, [loadProducts]);

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!listingState.selectedListingId) return;
    const images = splitValues(form.images);
    if (!images.length || images.some((image) => !image.startsWith("https://"))) {
      setError("Add at least one secure https image URL.");
      return;
    }
    setIsSaving(true);
    setError("");
    setSuccess("");
    const data = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      price: Number(form.price),
      stock: Number(form.stock),
      images,
      category: form.category.trim() || undefined,
      sku: form.sku.trim() || undefined,
      weight: form.weight ? Number(form.weight) : undefined,
      tags: splitValues(form.tags),
      featured: form.featured,
    };
    try {
      if (editingId) {
        await productsApi.update(editingId, data);
        setSuccess("Product updated.");
      } else {
        await productsApi.create({
          ...data,
          listingId: listingState.selectedListingId,
        });
        setSuccess("Product created.");
      }
      resetForm();
      await loadProducts();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Product could not be saved.");
    } finally {
      setIsSaving(false);
    }
  };

  const edit = (product: Product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description ?? "",
      price: String(product.price),
      stock: String(product.stock),
      images: product.images.join("\n"),
      category: product.category ?? "",
      sku: product.sku ?? "",
      weight: product.weight == null ? "" : String(product.weight),
      tags: product.tags.join(", "),
      featured: product.featured,
    });
    setSuccess("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (product: Product) => {
    if (!window.confirm(`Delete ${product.name}? Existing orders are preserved.`)) return;
    setActionId(product.id);
    setError("");
    try {
      await productsApi.delete(product.id);
      if (editingId === product.id) resetForm();
      setSuccess("Product deleted.");
      await loadProducts();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Product could not be deleted.");
    } finally {
      setActionId("");
    }
  };

  const changeStock = async (product: Product) => {
    const entered = window.prompt(`New stock for ${product.name}`, String(product.stock));
    if (entered == null) return;
    const stock = Number(entered);
    if (!Number.isInteger(stock) || stock < 0) {
      setError("Stock must be a whole number of zero or more.");
      return;
    }
    setActionId(product.id);
    setError("");
    try {
      await productsApi.updateInventory(product.id, stock);
      setSuccess("Inventory updated.");
      await loadProducts();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Inventory could not be updated.");
    } finally {
      setActionId("");
    }
  };

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <section className="rounded-2xl border border-[#D5F5E3] bg-white p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wider text-[#2ECC71]">Marketplace inventory</p>
        <h1 className="mt-1 text-3xl font-black text-[#111827]">Products and stock</h1>
        <p className="mt-2 text-[#6B7280]">Products and inventory changes are persisted to the selected marketplace listing.</p>
        <div className="mt-5"><PartnerListingPicker error={listingState.listingError} isLoading={listingState.isLoadingListings} label="Marketplace listing" listings={listingState.listings} onChange={listingState.setSelectedListingId} onRetry={listingState.reloadListings} selectedListingId={listingState.selectedListingId} /></div>
      </section>

      {error && <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700" role="alert">{error}</p>}
      {success && <p className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-700" role="status"><CheckCircle2 size={17} aria-hidden />{success}</p>}

      {listingState.selectedListingId && (
        <section className="grid gap-6 xl:grid-cols-[400px_1fr]">
          <form className="h-fit space-y-4 rounded-2xl border border-[#D5F5E3] bg-white p-5 shadow-sm" onSubmit={submit}>
            <div className="flex items-center justify-between gap-3"><h2 className="text-xl font-black">{editingId ? "Edit product" : "Add product"}</h2>{editingId && <button className="text-sm font-bold text-[#145A32] underline" onClick={resetForm} type="button">Cancel</button>}</div>
            <label className="block space-y-1"><span className="text-sm font-bold">Product name</span><input className="field-control" minLength={3} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required value={form.name} /></label>
            <label className="block space-y-1"><span className="text-sm font-bold">Description</span><textarea className="field-control min-h-24" minLength={10} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} value={form.description} /></label>
            <div className="grid grid-cols-2 gap-3"><label className="block space-y-1"><span className="text-sm font-bold">Price (USD)</span><input className="field-control" min={0} onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))} required step="0.01" type="number" value={form.price} /></label><label className="block space-y-1"><span className="text-sm font-bold">Stock</span><input className="field-control" min={0} onChange={(event) => setForm((current) => ({ ...current, stock: event.target.value }))} required step={1} type="number" value={form.stock} /></label></div>
            <div className="grid grid-cols-2 gap-3"><label className="block space-y-1"><span className="text-sm font-bold">Category</span><input className="field-control" onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} value={form.category} /></label><label className="block space-y-1"><span className="text-sm font-bold">SKU</span><input className="field-control" onChange={(event) => setForm((current) => ({ ...current, sku: event.target.value }))} value={form.sku} /></label></div>
            <label className="block space-y-1"><span className="text-sm font-bold">Secure image URLs</span><textarea className="field-control min-h-20" onChange={(event) => setForm((current) => ({ ...current, images: event.target.value }))} placeholder="One https URL per line" required value={form.images} /></label>
            <label className="block space-y-1"><span className="text-sm font-bold">Tags</span><input className="field-control" onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))} placeholder="coffee, organic, gift" value={form.tags} /></label>
            <label className="flex items-center gap-2 text-sm font-bold"><input checked={form.featured} className="accent-[#145A32]" onChange={(event) => setForm((current) => ({ ...current, featured: event.target.checked }))} type="checkbox" />Feature this product</label>
            <button className="btn-base btn-dark w-full" disabled={isSaving} type="submit">{isSaving ? <Loader2 className="animate-spin" size={17} aria-hidden /> : <Plus size={17} aria-hidden />}{isSaving ? "Saving..." : editingId ? "Save changes" : "Create product"}</button>
          </form>

          <div className="rounded-2xl border border-[#D5F5E3] bg-white p-5 shadow-sm">
            <h2 className="text-xl font-black">Saved products</h2>
            {isLoading && <p className="py-12 text-center text-sm text-[#6B7280]" role="status">Loading products...</p>}
            {!isLoading && products.length === 0 && <div className="py-12 text-center"><Package className="mx-auto text-[#145A32]" size={31} aria-hidden /><p className="mt-3 font-bold">No products on this listing yet</p></div>}
            <div className="mt-4 grid gap-3">
              {products.map((product) => (
                <article className="grid gap-3 rounded-xl border border-[#D5F5E3] p-4 sm:grid-cols-[1fr_auto] sm:items-center" key={product.id}>
                  <div><div className="flex flex-wrap items-center gap-2"><h3 className="font-black">{product.name}</h3>{product.featured && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">Featured</span>}</div><p className="mt-1 text-sm text-[#6B7280]">{formatCurrency(product.price)} · {product.stock} in stock · {product.sold} sold</p></div>
                  <div className="flex flex-wrap gap-2"><button className="btn-base btn-ghost btn-sm" disabled={actionId === product.id} onClick={() => changeStock(product)} type="button">Update stock</button><button aria-label={`Edit ${product.name}`} className="rounded-lg border border-[#D5F5E3] p-2 text-[#145A32]" onClick={() => edit(product)} type="button"><Pencil size={16} aria-hidden /></button><button aria-label={`Delete ${product.name}`} className="rounded-lg border border-red-200 p-2 text-red-600" disabled={actionId === product.id} onClick={() => remove(product)} type="button"><Trash2 size={16} aria-hidden /></button></div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
