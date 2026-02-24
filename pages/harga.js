import Link from "next/link";

export default function Harga() {
  return (
    <div className="pageWrapper">

      <div className="pageContainer">

        <h1>Cek Harga Pengiriman</h1>
        <p className="subtitle">
          Berikut estimasi harga pengiriman per kilogram (Kg) dari Surabaya:
        </p>

        <div className="tableWrapper">
          <table>
            <thead>
              <tr>
                <th>Rute Pengiriman</th>
                <th>Harga / Kg</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Surabaya - Ende</td><td>Rp 5.000 / Kg</td></tr>
              <tr><td>Surabaya - Kupang</td><td>Rp 8.000 / Kg</td></tr>
              <tr><td>Surabaya - Waingapu</td><td>Rp 6.000 / Kg</td></tr>
              <tr><td>Surabaya - Tambolaka</td><td>Rp 10.000 / Kg</td></tr>
              <tr><td>Surabaya - Kefa</td><td>Rp 15.000 / Kg</td></tr>
            </tbody>
          </table>
        </div>

        <div className="warningBox">
          <h3>⚠ Ketentuan Khusus</h3>
          <p>
            Untuk pengiriman <b>barang elektronik</b>, perhitungan biaya dapat
            berbeda tergantung jenis barang, nilai barang, dan metode pengiriman.
          </p>

          <a
            href="https://wa.me/6285977833502"
            target="_blank"
            className="waButtonHarga"
          >
            Hubungi Admin via WhatsApp
          </a>
        </div>

        <Link href="/">
          <button className="backBtn">← Kembali ke Home</button>
        </Link>

      </div>
    </div>
  );
}