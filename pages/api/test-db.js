import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default async function handler(req, res) {
  const { data: allInvoices } = await supabase.from("invoices").select("status, shipment_id");
  const { data: allShipments } = await supabase.from("shipments").select("id, sj_number");
  
  res.json({
    total_invoices: allInvoices?.length,
    total_shipments: allShipments?.length,
    invoices_sample: allInvoices?.slice(0, 5),
    shipments_sample: allShipments?.slice(0, 5)
  });
}
