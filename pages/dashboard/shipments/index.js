import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

let jsPDF; // dynamic import holder

export default function Shipments() {
  const [data, setData] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data } = await supabase
      .from("shipments")
      .select("*")
      .order("created_at", { ascending: false });

    setData(data || []);
  };

  // ==========================================
  // UPDATE STATUS OTOMATIS (NEW FEATURE)
  // ==========================================
  const updateStatus = async (id, newStatus) => {
    const updateData = { status: newStatus };

    if (newStatus === "Dikirim") {
      updateData.shipped_at = new Date();
    }

    if (newStatus === "Sampai") {
      updateData.delivered_at = new Date();
    }

    await supabase
      .from("shipments")
      .update(updateData)
      .eq("id", id);

    loadData();
  };

  // ==========================================
  // GENERATE PDF (TIDAK DIUBAH)
  // ==========================================
  const generatePDF = async (shipment) => {
    try {
      if (!jsPDF) {
        const module = await import("jspdf");
        jsPDF = module.default;
      }

      let sjNumber = shipment.sj_number;

      if (!sjNumber) {
        const { data: newSJ, error } = await supabase
          .rpc("generate_sj_number");

        if (error) {
          console.error(error);
          alert("Gagal generate nomor SJ");
          return;
        }

        await supabase
          .from("shipments")
          .update({ sj_number: newSJ })
          .eq("id", shipment.id);

        sjNumber = newSJ;
      }

      const { data: items } = await supabase
        .from("shipment_items")
        .select("*")
        .eq("shipment_id", shipment.id);

      const doc = new jsPDF("p", "mm", "a4");
      const margin = 15;
      const pageWidth = 210;

      let logoBase64 = null;

      try {
        const res = await fetch("/logosj.png");
        if (res.ok) {
          const blob = await res.blob();
          logoBase64 = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          });
        }
      } catch (e) {}

      if (logoBase64) {
        doc.addImage(logoBase64, "PNG", margin, 15, 30, 30);
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("LAYAR TIMUR", 50, 20);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text("Jl. Teluk Bitung No. 56 Perak Utara,", 50, 26);
      doc.text("Kec. Pabean Cantikan,", 50, 31);
      doc.text("Surabaya, Jawa Timur – 50612", 50, 36);
      doc.text("Email : layartimur37@gmail.com", 50, 41);
      doc.text("No. Telp : 0859 7783 3502", 50, 46);

      const rightX = 140;
      let rightY = 22;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("SURAT JALAN", rightX, rightY);

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");

      rightY += 10;
      doc.text(`No SJ : ${sjNumber}`, rightX, rightY);

      rightY += 8;
      doc.text(`Berat : ${shipment.weight || 0} kg`, rightX, rightY);

      doc.line(margin, 55, pageWidth - margin, 55);

      doc.setFont("helvetica", "bold");
      doc.text("KEPADA YTH:", margin, 65);

      doc.setFont("helvetica", "normal");
      doc.text(shipment.customer_name || "-", margin, 72);
      doc.text(`Alamat : ${shipment.address || "-"}`, margin, 78);
      doc.text(`Telp : ${shipment.phone || "-"}`, margin, 84);

      let y = 95;

      doc.setFillColor(230, 230, 230);
      doc.rect(margin, y, pageWidth - margin * 2, 10, "F");

      doc.setFont("helvetica", "bold");
      doc.text("No", margin + 5, y + 7);
      doc.text("Nama Barang", margin + 20, y + 7);
      doc.text("Qty", margin + 115, y + 7);
      doc.text("Satuan", margin + 130, y + 7);
      doc.text("Keterangan", margin + 150, y + 7);

      y += 10;
      doc.setFont("helvetica", "normal");

      items?.forEach((item, index) => {
        doc.rect(margin, y, pageWidth - margin * 2, 10);
        doc.text(String(index + 1), margin + 5, y + 7);
        doc.text(item.name || "-", margin + 20, y + 7);
        doc.text(String(item.qty || 0), margin + 115, y + 7);
        doc.text(item.unit || "-", margin + 130, y + 7);
        doc.text("-", margin + 150, y + 7);
        y += 10;
      });

      doc.save(`Surat_Jalan_${sjNumber}.pdf`);
      loadData();

    } catch (err) {
      console.error("PDF ERROR:", err);
      alert("Gagal generate PDF.");
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Shipments</h1>

      <Link href="/dashboard/shipments/create">
        <button style={{ marginBottom: 20 }}>+ Create</button>
      </Link>

      <table border="1" cellPadding="10" style={{ width: "100%" }}>
        <thead>
          <tr>
            <th>Tracking</th>
            <th>Customer</th>
            <th>Status</th>
            <th>SJ</th>
            <th>PDF</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {data.map((s) => (
            <tr key={s.id}>
              <td>{s.tracking_number}</td>
              <td>{s.customer_name}</td>
              <td>{s.status}</td>
              <td>{s.sj_number || "-"}</td>
              <td>
                <button onClick={() => generatePDF(s)}>
                  Download
                </button>
              </td>
              <td>
                {s.status === "Diproses" && (
                  <button onClick={() => updateStatus(s.id, "Dikirim")}>
                    Kirim
                  </button>
                )}

                {s.status === "Dikirim" && (
                  <button onClick={() => updateStatus(s.id, "Sampai")}>
                    Tandai Sampai
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}