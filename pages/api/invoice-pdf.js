import { createClient } from "@supabase/supabase-js";
import { generateInvoicePDF } from "../../utils/generateInvoicePDF";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  try {
    const { shipment } = req.query;
    if (!shipment) return res.status(400).send("Shipment ID required");

    // 1. Ambil data Shipment
    const { data: shipmentData } = await supabase.from("shipments").select("*").eq("id", shipment).single();
    if (!shipmentData) return res.status(404).send("Shipment tidak ditemukan");

    // 2. Ambil SEMUA data invoice dan cari yang cocok (Paling Aman)
    const { data: allInvoices } = await supabase.from("invoices").select("status, shipment_id");
    const invoiceRecord = allInvoices?.find(inv => 
      String(inv.shipment_id).trim() === String(shipmentData.id).trim()
    );

    const cleanStatus = String(invoiceRecord?.status || "Unpaid").trim();
    
    // Log terminal untuk memastikan
    console.log("--- DEBUG FINAL ---");
    console.log("STATUS DITEMUKAN:", cleanStatus);

    const { data: items } = await supabase.from("shipment_items").select("*").eq("shipment_id", shipmentData.id);

    const invoice = { ...shipmentData, shipments: shipmentData, status: cleanStatus };
    const pdfBuffer = await generateInvoicePDF(invoice, items);

    // 3. Kirim ke Browser dengan nama file yang benar
    const safeSj = (shipmentData.sj_number || "INVOICE").replace(/\//g, "-");
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=INVOICE-${safeSj}.pdf`);
    res.send(pdfBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).send("Gagal");
  }
}
