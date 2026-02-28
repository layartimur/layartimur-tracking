import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/router";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function CreateShipment() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    tracking_number: "",
    customer_name: "",
    phone: "",
    address: "",
    vehicle_id: "",
    weight: "",
  });

  const [items, setItems] = useState([
    { name: "", qty: 1, unit: "Pcs", price: 0, nominal: 0, insurance: false }
  ]);

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    const { data } = await supabase.from("vehicles").select("*");
    setVehicles(data || []);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const addItem = () => {
    setItems([
      ...items,
      { name: "", qty: 1, unit: "Pcs", price: 0, nominal: 0, insurance: false }
    ]);
  };

  const removeItem = (index) => {
    const updated = [...items];
    updated.splice(index, 1);
    setItems(updated);
  };

  const calculateTotal = () => {
    let total = 0;
    items.forEach(item => {
      const sub = item.qty * item.price;
      const ins = item.insurance ? item.nominal * 0.002 : 0;
      total += sub + ins;
    });
    return total;
  };

  const handleSubmit = async () => {
    if (!form.tracking_number || !form.customer_name) {
      alert("Tracking & Customer wajib diisi");
      return;
    }

    setLoading(true);

    const { data: shipment, error } = await supabase
      .from("shipments")
      .insert([{
        tracking_number: form.tracking_number,
        customer_name: form.customer_name,
        phone: form.phone,
        address: form.address,
        vehicle_id: form.vehicle_id || null,
        weight: Number(form.weight) || 0,
        status: "Diproses"
      }])
      .select()
      .single();

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    for (let item of items) {
      await supabase.from("shipment_items").insert([{
        shipment_id: shipment.id,
        name: item.name,
        qty: Number(item.qty),
        unit: item.unit,
        price: Number(item.price),
        nominal: Number(item.nominal),
        insurance: item.insurance
      }]);
    }

    await supabase.from("invoices").insert([{
      shipment_id: shipment.id,
      total: calculateTotal(),
      status: "Unpaid"
    }]);

    alert("Shipment & Invoice berhasil dibuat 🚀");
    router.push("/dashboard/shipments");
  };

  return (
    <div className="adminWrapper">
      <div className="adminContainer">
        <h1>Create Shipment</h1>

        <input name="tracking_number" placeholder="Tracking" onChange={handleChange} />
        <input name="customer_name" placeholder="Customer" onChange={handleChange} />
        <input name="phone" placeholder="Phone" onChange={handleChange} />
        <input name="address" placeholder="Alamat" onChange={handleChange} />
        <input name="weight" type="number" placeholder="Berat (kg)" onChange={handleChange} />

        <select name="vehicle_id" onChange={handleChange}>
          <option value="">Pilih Kendaraan</option>
          {vehicles.map(v=>(
            <option key={v.id} value={v.id}>
              {v.name} - {v.plate_number}
            </option>
          ))}
        </select>

        <h3>Items</h3>

        {items.map((item,index)=>(
          <div key={index}>
            <input placeholder="Nama Barang" onChange={(e)=>handleItemChange(index,"name",e.target.value)} />
            <input type="number" placeholder="Qty" onChange={(e)=>handleItemChange(index,"qty",e.target.value)} />
            <input placeholder="Satuan" onChange={(e)=>handleItemChange(index,"unit",e.target.value)} />
            <input type="number" placeholder="Harga" onChange={(e)=>handleItemChange(index,"price",e.target.value)} />
            <input type="number" placeholder="Nominal Barang" onChange={(e)=>handleItemChange(index,"nominal",e.target.value)} />
            <label>
              <input type="checkbox" onChange={(e)=>handleItemChange(index,"insurance",e.target.checked)} />
              Asuransi 0.2%
            </label>
            <button onClick={()=>removeItem(index)}>Hapus</button>
          </div>
        ))}

        <button onClick={addItem}>+ Tambah Item</button>

        <h3>Total: Rp {calculateTotal().toLocaleString()}</h3>

        <button onClick={handleSubmit} disabled={loading}>
          {loading ? "Menyimpan..." : "Simpan Shipment"}
        </button>
      </div>
    </div>
  );
}