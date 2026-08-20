"use client";

import { useActionState, useState } from "react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import { saveMenuItem, type MenuFormState } from "@/app/actions/menu";
import type { MenuItem } from "@/types/database";

const initialState: MenuFormState = { error: null };

export function MenuItemForm({ item }: { item?: MenuItem }) {
  const [state, formAction, pending] = useActionState(saveMenuItem, initialState);
  const [imageUrl, setImageUrl] = useState(item?.image_url ?? "");
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const supabase = createClient();
    const path = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("menu-images").upload(path, file);

    if (error) {
      toast.error(`Upload failed: ${error.message}`);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("menu-images").getPublicUrl(path);
    setImageUrl(data.publicUrl);
    setUploading(false);
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {item && <input type="hidden" name="id" value={item.id} />}
      <input type="hidden" name="image_url" value={imageUrl} />

      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-sm font-medium text-stone-700">
          Name
        </label>
        <input
          id="name"
          name="name"
          required
          defaultValue={item?.name}
          className="rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="flavor" className="text-sm font-medium text-stone-700">
            Flavor
          </label>
          <input
            id="flavor"
            name="flavor"
            required
            placeholder="e.g. Caramel"
            defaultValue={item?.flavor}
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="category" className="text-sm font-medium text-stone-700">
            Category
          </label>
          <input
            id="category"
            name="category"
            defaultValue={item?.category ?? "coffee"}
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="price" className="text-sm font-medium text-stone-700">
          Price (PHP)
        </label>
        <input
          id="price"
          name="price"
          type="number"
          min="0"
          step="0.01"
          required
          defaultValue={item?.price}
          className="rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="description" className="text-sm font-medium text-stone-700">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={item?.description ?? ""}
          className="rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="image" className="text-sm font-medium text-stone-700">
          Photo
        </label>
        <input id="image" type="file" accept="image/*" onChange={handleFileChange} />
        {uploading && <p className="text-xs text-stone-500">Uploading...</p>}
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="Preview" className="mt-2 h-24 w-24 rounded-lg object-cover" />
        )}
      </div>

      <label className="flex items-center gap-2 text-sm font-medium text-stone-700">
        <input
          type="checkbox"
          name="is_available"
          defaultChecked={item?.is_available ?? true}
        />
        Available on the menu
      </label>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending || uploading}
        className="self-start rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700 disabled:opacity-50"
      >
        {pending ? "Saving..." : "Save item"}
      </button>
    </form>
  );
}
