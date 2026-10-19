"use client";

import React, { useEffect, useRef, useState } from "react";
import { StudioShell } from "@/components/studio/StudioShell";
import { Library, Upload, Film, Music, Image as ImageIcon } from "lucide-react";

interface AssetItem {
  id: string;
  name: string;
  category: string;
  fileUrl: string;
  mimeType: string;
  durationSec: number;
  sizeBytes: number;
  tags: string;
  createdAt: string;
}

export default function AssetLibraryPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [assets, setAssets] = useState<AssetItem[]>([]);
  const [category, setCategory] = useState("all");
  const [uploading, setUploading] = useState(false);

  const loadAssets = async (cat = category) => {
    const res = await fetch(`/api/assets?category=${encodeURIComponent(cat)}`);
    if (res.ok) {
      const data = await res.json();
      setAssets(data.assets || []);
    }
  };

  useEffect(() => {
    loadAssets(category);
  }, [category]);

  const handleUploadAsset = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", category === "all" ? "b-roll" : category);
      formData.append("saveToAssetLibrary", "true");
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        await loadAssets(category);
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <StudioShell breadcrumbs={[{ label: "Create" }, { label: "Asset library" }]}>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <Library className="w-6 h-6 text-[#04F827]" />
              <span>Workspace Asset Library</span>
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Reusable B-Roll clips, brand logos, background music, and intro/outro bumpers.
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            onChange={handleUploadAsset}
            className="hidden"
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{uploading ? "Uploading..." : "Upload Asset"}</span>
          </button>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "all", label: "All Assets" },
            { id: "b-roll", label: "Stock & AI B-Roll" },
            { id: "video", label: "Source Videos" },
            { id: "logo", label: "Brand Logos" },
            { id: "music", label: "Music Tracks" },
            { id: "intro-outro", label: "Intro / Outro" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setCategory(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                category === tab.id
                  ? "bg-white text-black"
                  : "bg-zinc-900 text-zinc-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Assets Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {assets.map((a) => (
            <div
              key={a.id}
              className="p-4 rounded-2xl bg-[#121216] border border-zinc-800/90 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                  {a.category === "music" ? (
                    <Music className="w-4 h-4 text-amber-400" />
                  ) : a.category === "logo" ? (
                    <ImageIcon className="w-4 h-4 text-violet-400" />
                  ) : (
                    <Film className="w-4 h-4 text-[#04F827]" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">
                    {a.name}
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    {a.category.toUpperCase()} • {(a.sizeBytes / 1024).toFixed(0)} KB
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </StudioShell>
  );
}
