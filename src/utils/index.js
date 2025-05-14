// src/utils/index.js
export * from "./exportToPDF";

export function formatRupiah(angka) {
  if (typeof angka !== "number") return angka;
  return "Rp " + angka.toLocaleString("id-ID");
}
