"use client";
import { useState, useEffect } from "react";
import { Key, Save, Check } from "lucide-react";

export default function Pengaturan() {
  const [apiKey, setApiKey] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const storedKey = localStorage.getItem("gemini_api_key");
    if (storedKey) setApiKey(storedKey);
  }, []);

  const handleSave = () => {
    localStorage.setItem("gemini_api_key", apiKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-4 pt-8 pb-24 flex flex-col space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-slate-800">Pengaturan</h1>
        <p className="text-sm text-slate-500">Pengaturan aplikasi dan integrasi AI.</p>
      </header>

      <section className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Key size={18} className="text-blue-600" />
            Gemini API Key
          </label>
          <p className="text-xs text-slate-500">
            Dapatkan API key gratis dari <a href="https://aistudio.google.com/" target="_blank" className="text-blue-600 hover:underline">Google AI Studio</a>. Key ini disimpan secara aman di browser Anda dan tidak dikirim ke server lain.
          </p>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="AIzaSy..."
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <button
          onClick={handleSave}
          className="w-full bg-slate-800 hover:bg-slate-900 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
        >
          {saved ? <Check size={18} className="text-emerald-400" /> : <Save size={18} />}
          {saved ? "Tersimpan!" : "Simpan Pengaturan"}
        </button>
      </section>
    </div>
  );
}
