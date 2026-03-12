import { createClient } from "@supabase/supabase-js";
import { generateInvoicePDF } from "../../utils/generateInvoicePDF";

const supabase = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req,res){

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

/* ambil items */

const { data:items, error:itemError } = await supabase
.from("shipment_items")
.select("*")
.eq("shipment_id",shipmentData.id);

if(itemError){
console.log(itemError);
}

/* format sama seperti email */

const invoice = {
shipments: shipmentData
};

/* generate pdf dengan template yang sama */

const pdfBuffer = await generateInvoicePDF(invoice,items);

/* kirim ke browser */

res.setHeader("Content-Type","application/pdf");

res.setHeader(
"Content-Disposition",
`inline; filename=INVOICE-${shipmentData.sj_number}.pdf`
);

res.send(Buffer.from(pdfBuffer));

}