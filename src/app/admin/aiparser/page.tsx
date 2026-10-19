"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Bot, Check, RefreshCw, Save, X } from "lucide-react";
import {
  useGetAiParserConfigQuery,
  useUpdateAiParserConfigMutation,
} from "@/services/api/adminApi";

// Fixed try-order: cheapest free AI first, local Ollama last.
const PROVIDER_ROWS = [
  { id: "groq", title: "Groq (free)", hint: "Fastest free AI. Paste one key per line - all are used in turn." },
  { id: "openrouter", title: "OpenRouter (free)", hint: "Free models through one key. Paste one key per line." },
  { id: "deepseek", title: "DeepSeek", hint: "Paste one key per line." },
  { id: "gemini", title: "Gemini (free tier)", hint: "Paste one key per line - all are used in turn." },
  { id: "ollama", title: "Ollama (this machine)", hint: "No key needed. Used when set up locally." },
];

export default function AiParserSettingsPage() {
  const { data, isLoading, refetch } = useGetAiParserConfigQuery();
  const [saveConfig, { isLoading: isSaving }] = useUpdateAiParserConfigMutation();

  const [enabled, setEnabled] = useState<string[]>(["groq", "openrouter", "deepseek", "gemini", "ollama"]);
  const [keys, setKeys] = useState<Record<string, string>>({ groq: "", openrouter: "", deepseek: "", gemini: "" });
  const [groqModel, setGroqModel] = useState("openai/gpt-oss-20b");
  const [ollamaUrl, setOllamaUrl] = useState("http://localhost:11434");
  const [ollamaModel, setOllamaModel] = useState("qwen2.5:7b");
  const [openrouterModel, setOpenrouterModel] = useState("deepseek/deepseek-r1:free");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const cfg = (data as any)?.config;
    if (!cfg) return;
    if (Array.isArray(cfg.providers) && cfg.providers.length) setEnabled(cfg.providers);
    if (cfg.ollamaUrl) setOllamaUrl(cfg.ollamaUrl);
    if (cfg.ollamaModel) setOllamaModel(cfg.ollamaModel);
    if (cfg.openrouterModel) setOpenrouterModel(cfg.openrouterModel);
    if (cfg.groqModel) setGroqModel(cfg.groqModel);
    setKeys({
      groq: (cfg.groqKeys || []).join("\n"),
      openrouter: (cfg.openrouterKeys || []).join("\n"),
      deepseek: (cfg.deepseekKeys || []).join("\n"),
      gemini: (cfg.geminiKeys || []).join("\n"),
    });
  }, [data]);

  const splitKeys = (t: string) => t.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
  const toggle = (id: string) =>
    setEnabled((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const totalKeys = ["groq", "openrouter", "deepseek", "gemini"].reduce((n, k) => n + splitKeys(keys[k] || "").length, 0);

  const handleSave = async () => {
    setMsg(null);
    setErr(null);
    try {
      const res = await saveConfig({
        providers: PROVIDER_ROWS.map((r) => r.id).filter((id) => enabled.includes(id)),
        ollamaUrl: ollamaUrl.trim(),
        ollamaModel: ollamaModel.trim(),
        geminiKeys: splitKeys(keys.gemini || ""),
        groqKeys: splitKeys(keys.groq || ""),
        groqModel: groqModel.trim(),
        openrouterKeys: splitKeys(keys.openrouter || ""),
        openrouterModel: openrouterModel.trim(),
        deepseekKeys: splitKeys(keys.deepseek || ""),
      }).unwrap();
      if (res?.success) {
        setMsg(`Saved. ${totalKeys} key(s) across ${enabled.length} provider(s). Same-CV re-uploads use the free 90-day cache.`);
        refetch();
      } else {
        setErr(res?.message || "Failed to save.");
      }
    } catch (e: any) {
      setErr(e?.data?.message || e?.message || "Failed to save.");
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12">
      <div className="border-b border-slate-200 pb-5">
        <Link href="/admin" className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5 mt-1">
          <Bot className="w-6 h-6 text-blue-600" />
          <span>AI Resume Parser</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Add free AI keys once. CV parsing tries them in order, switches account automatically on limits, and re-uses saved results for repeat CVs.
        </p>
      </div>

      {msg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs flex items-start gap-2">
          <Check className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{msg}</span>
          <button onClick={() => setMsg(null)} className="ml-auto text-emerald-600 hover:text-emerald-800"><X className="w-4 h-4" /></button>
        </div>
      )}
      {err && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 text-xs">
          <span className="font-bold">Error: </span><span>{err}</span>
        </div>
      )}

      {isLoading ? (
        <div className="p-10 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin" /> Loading...
        </div>
      ) : (
        <div className="space-y-3">
          {PROVIDER_ROWS.map((row, i) => {
            const on = enabled.includes(row.id);
            return (
              <div key={row.id} className={`bg-white rounded-2xl border p-5 shadow-sm space-y-3 ${on ? "border-slate-200" : "border-slate-200 opacity-70"}`}>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={() => toggle(row.id)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-extrabold text-slate-900">
                    {i + 1}. {row.title}
                  </span>
                </label>
                <p className="text-[11px] text-slate-500">{row.hint}</p>
                {on && row.id !== "ollama" && (
                  <textarea
                    value={keys[row.id] || ""}
                    onChange={(e) => setKeys((prev) => ({ ...prev, [row.id]: e.target.value }))}
                    rows={2}
                    placeholder="One key per line"
                    className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                )}
                {on && row.id === "groq" && (
                  <input
                    value={groqModel}
                    onChange={(e) => setGroqModel(e.target.value)}
                    placeholder="openai/gpt-oss-20b"
                    className="w-full h-10 px-3 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                )}
                {on && row.id === "openrouter" && (
                  <input
                    value={openrouterModel}
                    onChange={(e) => setOpenrouterModel(e.target.value)}
                    placeholder="deepseek/deepseek-r1:free"
                    className="w-full h-10 px-3 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                )}
                {on && row.id === "ollama" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      value={ollamaUrl}
                      onChange={(e) => setOllamaUrl(e.target.value)}
                      placeholder="http://localhost:11434"
                      className="h-10 px-3 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <input
                      value={ollamaModel}
                      onChange={(e) => setOllamaModel(e.target.value)}
                      placeholder="qwen2.5:7b"
                      className="h-10 px-3 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                )}
              </div>
            );
          })}

          <button type="button" onClick={handleSave} disabled={isSaving} className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2">
            <Save className="w-4 h-4" /> {isSaving ? "Saving..." : `Save (${totalKeys} keys)`}
          </button>
        </div>
      )}
    </div>
  );
}
