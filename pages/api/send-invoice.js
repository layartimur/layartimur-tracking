import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";
import { generateInvoicePDF } from "../../utils/generateInvoicePDF";

const supabase = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req,res){

if(req.method !== "POST"){
return res.status(405).json({error:"Method not allowed"});
}

const { shipment_id } = req.body;

try{

console.log("Shipment ID:", shipment_id);

// ambil shipment
const { data:shipment, error:shipmentError } = await supabase
.from("shipments")
.select("*")
.eq("id",shipment_id)
.single();

if(shipmentError || !shipment){
console.log("SHIPMENT ERROR:", shipmentError);
return res.status(400).json({error:"Shipment tidak ditemukan"});
}

// ambil email customer
const { data:customer, error:customerError } = await supabase
.from("customers")
.select("email")
.eq("nama_pt",shipment.customer_name)
.single();

if(customerError || !customer){
console.log("CUSTOMER ERROR:", customerError);
return res.status(400).json({error:"Email customer tidak ditemukan"});
}

// ambil item invoice dari shipment_items
const { data:items, error:itemError } = await supabase
.from("shipment_items")
.select("*")
.eq("shipment_id",shipment_id);

if(itemError){
console.log("ITEM ERROR:", itemError);
return res.status(400).json({error:"Item shipment tidak ditemukan"});
}

// generate PDF
const pdfArrayBuffer = await generateInvoicePDF(
{ shipments: shipment },
items
);

const pdfBuffer = Buffer.from(pdfArrayBuffer);

// setup email
const transporter = nodemailer.createTransport({
service:"gmail",
auth:{
user:process.env.EMAIL_USER,
pass:process.env.EMAIL_PASS
}
});

// kirim email
await transporter.sendMail({

from:"[layartimur37@gmail.com](mailto:layartimur37@gmail.com)",

to:customer.email,

subject:`Invoice Pengiriman ${shipment.tracking_number}`,

html:`

<h3>Invoice Pengiriman</h3>

<p><b>Nomor Tracking :</b> ${shipment.tracking_number}</p>

<p><b>Nomor Surat Jalan :</b> ${shipment.sj_number || "-"}</p>

<p>
Invoice pengiriman telah dibuat.<br/>
File invoice terlampir pada email ini.
</p>

<p>
Terima kasih.
</p>

`,

attachments:[
{
filename:`INVOICE-${shipment.sj_number || shipment.tracking_number}.pdf`,
content: pdfBuffer
}
]

});

console.log("EMAIL BERHASIL DIKIRIM");

res.status(200).json({success:true});

}catch(err){

console.log("EMAIL ERROR:", err);

res.status(500).json({
error: err.message
});

}

}
