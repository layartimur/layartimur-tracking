import { createClient } from "@supabase/supabase-js";
import { generateInvoicePDF } from "../../utils/generateInvoicePDF";

const supabase = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req,res){

try{

const { shipment } = req.query;

if(!shipment){
return res.status(400).send("Shipment ID required");
}

/* ambil shipment */

const { data:shipmentData, error } = await supabase
.from("shipments")
.select("*")
.eq("id",shipment)
.single();

if(error || !shipmentData){
return res.status(404).send("Shipment tidak ditemukan");
}

/* ================= ambil invoice ================= */

const { data:invoiceData } = await supabase
.from("invoices")
.select("status")
.eq("shipment_id", shipmentData.id)
.single();

/* ambil items */

const { data:items, error:itemError } = await supabase
.from("shipment_items")
.select("*")
.eq("shipment_id",shipmentData.id);

if(itemError){
console.log(itemError);
}

/* format invoice */

const invoice = {
shipments: shipmentData,
status: invoiceData?.status || "Unpaid"
};

/* generate pdf */

const pdfBuffer = await generateInvoicePDF(invoice,items);

/* kirim ke browser */

res.setHeader("Content-Type","application/pdf");

res.setHeader(
"Content-Disposition",
`attachment; filename=INVOICE-${shipmentData.sj_number}.pdf`
);

res.send(pdfBuffer);

}catch(err){

console.log(err);

res.status(500).send("Gagal membuat PDF");

}

}