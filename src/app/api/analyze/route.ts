import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

function dummyExtract(text: string) {
  const lowerText = text.toLowerCase();
  const asalMatch = lowerText.match(/dari\s+([a-z]+)/i);
  const tujuanMatch = lowerText.match(/ke\s+([a-z]+)/i);
  const koliMatch = lowerText.match(/(\d+)\s+(kardus|koli|box)/i);
  const beratMatch = lowerText.match(/(\d+)\s+kg/i);
  
  // Deteksi barang sederhana
  let barang = "Barang Umum";
  if (lowerText.includes("pakaian")) barang = "Pakaian";
  if (lowerText.includes("besi beton") || lowerText.includes("besi")) barang = "Besi Beton";

  return {
    asal: asalMatch ? asalMatch[1].replace(/^\w/, c => c.toUpperCase()) : "Jakarta (Dummy)",
    tujuan: tujuanMatch ? tujuanMatch[1].replace(/^\w/, c => c.toUpperCase()) : "Solo (Dummy)",
    barang: barang,
    jumlah: koliMatch ? parseInt(koliMatch[1]) : 10,
    berat: beratMatch ? parseInt(beratMatch[1]) : 300,
    panjang: null,
    lebar: null,
    tinggi: null,
    layanan: lowerText.includes("express") ? "Express" : "Reguler"
  };
}

export async function POST(request: Request) {
  let prompt = "";
  try {
    const body = await request.json();
    prompt = body.prompt;
    const clientApiKey = body.apiKey;
    
    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const apiKey = clientApiKey || process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "your_gemini_api_key_here") {
      console.log("Menggunakan Dummy AI karena API Key belum di-set");
      const dummyData = dummyExtract(prompt);
      return NextResponse.json({ ...dummyData, _warning: "Simulasi AI (API Key belum diatur)" });
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const systemPrompt = `Anda adalah asisten ekstraksi data logistik. Ekstrak informasi berikut dari pesan pelanggan ke dalam format JSON yang valid.
    Parameter:
    - asal (string)
    - tujuan (string)
    - barang (string)
    - jumlah (number, koli/kardus)
    - berat (number, dalam kg)
    - panjang (number, dalam cm)
    - lebar (number, dalam cm)
    - tinggi (number, dalam cm)
    - layanan (string: reguler, express, charter)
    Jika data tidak ada, isi dengan null. Pastikan output hanya JSON murni tanpa markdown.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        { role: "user", parts: [{ text: systemPrompt + "\n\nPesan pelanggan: " + prompt }] }
      ]
    });

    let rawText = response.text || "{}";
    rawText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();

    const data = JSON.parse(rawText);
    return NextResponse.json(data);

  } catch (error: any) {
    console.error("AI Error:", error);
    // Fallback on error so the app doesn't break
    const dummyData = dummyExtract(prompt);
    return NextResponse.json({ ...dummyData, _warning: "Simulasi AI (API Error)" });
  }
}
