"use client";
import { useState } from "react";
import { Bot, Calculator, AlertCircle, Check, Copy, MessageCircle, ChevronDown, ChevronUp } from "lucide-react";

export default function HitungTarif() {
  const [prompt, setPrompt] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedData, setAnalyzedData] = useState<any>(null);
  const [error, setError] = useState("");
  
  // Form State
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    asal: "",
    tujuan: "",
    barang: "Barang umum",
    jumlah: 1,
    berat: 1,
    panjang: 0,
    lebar: 0,
    tinggi: 0,
    layanan: "Reguler",
    pickup: false,
    delivery: false,
    asuransi: false
  });
  
  const [hasil, setHasil] = useState<any>(null);
  const [showRincian, setShowRincian] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleUseExample = () => {
    setPrompt("Mau kirim 10 kardus pakaian dari Jakarta ke Surabaya. Berat total 300 kg, ukuran setiap kardus 60 x 40 x 40 cm, layanan reguler.");
  };

  const handleAnalyze = async () => {
    if (!prompt) return;
    setIsAnalyzing(true);
    setError("");
    setAnalyzedData(null);
    setShowForm(false);
    setHasil(null);

    try {
      const apiKey = localStorage.getItem("gemini_api_key") || "";
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, apiKey }),
      });
      const data = await res.json();
      
      if (res.ok) {
        setAnalyzedData(data);
      } else {
        setError(data.error || "Gagal menghubungi AI. Pastikan API key sudah diatur.");
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan koneksi.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLanjutkan = () => {
    if (analyzedData) {
      setFormData({
        asal: analyzedData.asal || "",
        tujuan: analyzedData.tujuan || "",
        barang: analyzedData.barang || "Barang umum",
        jumlah: Number(analyzedData.jumlah) || 1,
        berat: Number(analyzedData.berat) || 1,
        panjang: Number(analyzedData.panjang) || 0,
        lebar: Number(analyzedData.lebar) || 0,
        tinggi: Number(analyzedData.tinggi) || 0,
        layanan: analyzedData.layanan?.toLowerCase().includes("express") ? "Express" : "Reguler",
        pickup: false,
        delivery: false,
        asuransi: false
      });
    }
    setShowForm(true);
  };

  const handleHitung = () => {
    const { panjang, lebar, tinggi, jumlah, berat, layanan, pickup, delivery } = formData;
    
    const volume = (panjang * lebar * tinggi * jumlah) / 4000;
    const beratDikenakan = Math.max(berat, Math.ceil(volume)) || 1;
    
    const tarifPerKg = 5000; 
    let baseTarif = beratDikenakan * tarifPerKg;
    
    if (layanan === "Express") baseTarif *= 1.25;
    
    const biayaPickup = pickup ? 150000 : 0;
    const biayaDelivery = delivery ? 150000 : 0;
    
    let hpp = baseTarif + biayaPickup + biayaDelivery;
    let hargaRekomendasi = hpp * 1.2;
    hargaRekomendasi = Math.ceil(hargaRekomendasi / 10000) * 10000;
    
    setHasil({
      beratVolume: Math.ceil(volume),
      beratDikenakan,
      hpp,
      hargaRekomendasi,
      margin: hargaRekomendasi - hpp,
      rincian: {
        tarifPengiriman: baseTarif,
        biayaPickup,
        biayaDelivery,
        total: hpp
      }
    });
    setShowRincian(false);
    setCopied(false);
  };

  const getMessageText = () => {
    if (!hasil) return "";
    return `Halo Kak, berikut estimasi biaya pengirimannya:

Asal: ${formData.asal}
Tujuan: ${formData.tujuan}
Barang: ${formData.barang}
Jumlah: ${formData.jumlah} koli
Berat dikenakan: ${hasil.beratDikenakan} kg
Layanan: ${formData.layanan}

*Total tarif: Rp ${hasil.hargaRekomendasi.toLocaleString('id-ID')}*

Tarif sudah termasuk pickup dan delivery standar (jika ada). Harga dapat berubah apabila terdapat perbedaan berat, ukuran, alamat, atau kondisi barang saat proses pengecekan.

Terima kasih.`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getMessageText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(getMessageText());
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  return (
    <div className="p-4 pt-8 pb-32 flex flex-col space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl font-black text-slate-800 uppercase tracking-wide">RAJA SEWA MOBIL - AI TARIF</h1>
        <p className="text-sm text-slate-500">Masukkan kebutuhan pengiriman pelanggan.</p>
      </header>

      {/* Input AI */}
      <section className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Bot size={18} className="text-blue-600" />
            Pertanyaan Pelanggan
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Contoh: Mau kirim 10 kardus pakaian dari Jakarta ke Surabaya, berat sekitar 300 kg."
            className="w-full h-28 p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-start gap-2 text-sm border border-red-100">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}
        <div className="flex gap-2">
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !prompt}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
          >
            {isAnalyzing ? "Membaca..." : "Analisis dengan AI"}
          </button>
          <button
            onClick={handleUseExample}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 px-4 rounded-lg transition-colors text-sm"
          >
            Contoh
          </button>
        </div>
      </section>

      {/* Hasil Analisis */}
      {analyzedData && !showForm && (
        <section className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-slate-700">Data Ditemukan</h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(analyzedData).map(([key, val]) => {
              if (val === null || key.startsWith("_")) return null;
              return (
                <span key={key} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium border border-blue-100 capitalize">
                  {key}: {String(val)}
                </span>
              );
            })}
          </div>
          
          <button 
            onClick={handleLanjutkan}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-lg transition-colors mt-4 flex justify-center items-center gap-2 text-sm"
          >
            <Calculator size={18} /> Lanjutkan ke Form
          </button>
        </section>
      )}

      {/* Form Lengkap */}
      {showForm && (
        <div className="space-y-6">
          <section className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4 animate-in slide-in-from-bottom-4">
            <h2 className="text-sm font-semibold text-slate-700 border-b pb-2">1. Rute Pengiriman</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Kota Asal</label>
                <input type="text" value={formData.asal} onChange={e => setFormData({...formData, asal: e.target.value})} className="w-full p-2 bg-slate-50 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Kota Tujuan</label>
                <input type="text" value={formData.tujuan} onChange={e => setFormData({...formData, tujuan: e.target.value})} className="w-full p-2 bg-slate-50 border rounded-lg text-sm" />
              </div>
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4 animate-in slide-in-from-bottom-4">
            <h2 className="text-sm font-semibold text-slate-700 border-b pb-2">2. Detail Barang</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Jenis Barang</label>
                <select value={formData.barang} onChange={e => setFormData({...formData, barang: e.target.value})} className="w-full p-2 bg-slate-50 border rounded-lg text-sm">
                  <option>Barang umum</option>
                  <option>Pakaian</option>
                  <option>Besi Beton</option>
                  <option>Elektronik</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Jumlah Koli</label>
                <input type="number" value={formData.jumlah} onChange={e => setFormData({...formData, jumlah: Number(e.target.value)})} className="w-full p-2 bg-slate-50 border rounded-lg text-sm" />
              </div>
            </div>
            
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Berat Aktual Total (kg)</label>
              <input type="number" value={formData.berat} onChange={e => setFormData({...formData, berat: Number(e.target.value)})} className="w-full p-2 bg-slate-50 border rounded-lg text-sm" />
            </div>

            <div className="pt-2">
              <label className="text-xs text-slate-500 mb-1 block">Dimensi per Koli (cm)</label>
              <div className="grid grid-cols-3 gap-2">
                <input type="number" placeholder="P" value={formData.panjang || ''} onChange={e => setFormData({...formData, panjang: Number(e.target.value)})} className="w-full p-2 bg-slate-50 border rounded-lg text-sm" />
                <input type="number" placeholder="L" value={formData.lebar || ''} onChange={e => setFormData({...formData, lebar: Number(e.target.value)})} className="w-full p-2 bg-slate-50 border rounded-lg text-sm" />
                <input type="number" placeholder="T" value={formData.tinggi || ''} onChange={e => setFormData({...formData, tinggi: Number(e.target.value)})} className="w-full p-2 bg-slate-50 border rounded-lg text-sm" />
              </div>
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4 animate-in slide-in-from-bottom-4">
            <h2 className="text-sm font-semibold text-slate-700 border-b pb-2">3. Layanan & Tambahan</h2>
            <div className="flex gap-2">
              {['Reguler', 'Express'].map(l => (
                <button key={l} onClick={() => setFormData({...formData, layanan: l})} className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${formData.layanan === l ? 'bg-blue-50 border-blue-600 text-blue-700' : 'bg-white border-slate-200 text-slate-600'}`}>
                  {l}
                </button>
              ))}
            </div>
            
            <div className="space-y-3 pt-2 border-t mt-3">
              <label className="flex items-center gap-3">
                <input type="checkbox" checked={formData.pickup} onChange={e => setFormData({...formData, pickup: e.target.checked})} className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-sm text-slate-700">Pickup Barang</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" checked={formData.delivery} onChange={e => setFormData({...formData, delivery: e.target.checked})} className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-sm text-slate-700">Delivery sampai alamat</span>
              </label>
            </div>
          </section>

          <button 
            onClick={handleHitung}
            className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-4 px-4 rounded-xl shadow-lg transition-transform active:scale-95 text-base flex justify-center items-center gap-2"
          >
            Hitung Tarif Sekarang
          </button>
        </div>
      )}

      {/* Hasil Perhitungan */}
      {hasil && (
        <section className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 shadow-sm space-y-4 animate-in slide-in-from-bottom-8">
          <div className="text-center space-y-1">
            <p className="text-sm text-emerald-800 font-medium">Tarif Rekomendasi</p>
            <h2 className="text-3xl font-bold text-emerald-700">
              Rp {hasil.hargaRekomendasi.toLocaleString('id-ID')}
            </h2>
            <p className="text-xs text-emerald-600">{formData.asal} → {formData.tujuan} ({formData.layanan})</p>
          </div>
          
          <div className="bg-white rounded-lg p-3 text-xs text-slate-600 space-y-2 border border-emerald-100">
            <div className="flex justify-between">
              <span>Berat Aktual:</span>
              <span className="font-medium text-slate-800">{formData.berat} kg</span>
            </div>
            <div className="flex justify-between">
              <span>Berat Volume:</span>
              <span className="font-medium text-slate-800">{hasil.beratVolume} kg</span>
            </div>
            <div className="flex justify-between border-t pt-2 mt-2 border-slate-100">
              <span>Berat Dikenakan:</span>
              <span className="font-bold text-slate-800">{hasil.beratDikenakan} kg</span>
            </div>
          </div>
          
          {/* Untuk internal HPP & Margin */}
          <div className="bg-slate-100 rounded-lg border border-slate-200 overflow-hidden">
            <button 
              onClick={() => setShowRincian(!showRincian)}
              className="w-full p-3 flex justify-between items-center text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <span>Lihat Rincian HPP (Internal)</span>
              {showRincian ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            
            {showRincian && (
              <div className="p-3 bg-white border-t border-slate-200 text-xs text-slate-600 space-y-2">
                <div className="flex justify-between">
                  <span>Tarif Pengiriman:</span>
                  <span>Rp {hasil.rincian.tarifPengiriman.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Biaya Pickup:</span>
                  <span>Rp {hasil.rincian.biayaPickup.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Biaya Delivery:</span>
                  <span>Rp {hasil.rincian.biayaDelivery.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between border-t pt-2 mt-2 font-medium">
                  <span>Total HPP:</span>
                  <span className="text-slate-800">Rp {hasil.hpp.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between font-medium text-emerald-600 mt-1">
                  <span>Margin Keuntungan:</span>
                  <span>Rp {hasil.margin.toLocaleString('id-ID')}</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-2 relative">
            <button 
              onClick={handleCopy}
              className="flex-1 bg-white border border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />} 
              {copied ? "Disalin!" : "Salin"}
            </button>
            <button 
              onClick={handleWhatsApp}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <MessageCircle size={16} /> WhatsApp
            </button>
          </div>
          {copied && (
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-3 py-1.5 rounded shadow-lg animate-in fade-in zoom-in duration-200">
              Penawaran berhasil disalin
            </div>
          )}
        </section>
      )}

    </div>
  );
}
