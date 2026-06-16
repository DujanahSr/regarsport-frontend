/* eslint-disable react-hooks/immutability */
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MapPin, Package, ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";

import api from "../../services/api";
import { useCart } from "../../context/CartContext";
import { EmptyState, ScreenLoader } from "../../components/common/UiStates";
import { loadMidtransSnap } from "../../utils/loadMidtrans";

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();

  const { cartItems, loadCart, setSelectedItems } = useCart();

  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState("");

  const selectedIds = location.state?.selectedItems || [];

  const selectedCart = cartItems.filter((item) => selectedIds.includes(item.id));

  const total = selectedCart.reduce(
    (acc, item) => acc + Number(item.products.price) * item.quantity,
    0
  );

  const handleCheckout = async () => {
    try {
      if (selectedCart.length === 0) {
        setValidationError("Pilih produk terlebih dahulu");
        return;
      }

      if (!address.trim()) {
        setValidationError("Alamat pengiriman wajib diisi");
        return;
      }

      setValidationError("");
      setLoading(true);

      const items = selectedCart.map((item) => ({
        cart_id: item.id,
        product_id: item.products.id,
        quantity: item.quantity,
      }));

      const orderResponse = await api.post("/orders", {
        shipping_address: address,
        items,
      });

      const payment = orderResponse.data.payment;
      const snap = await loadMidtransSnap();

      if (snap && payment?.token) {
        snap.pay(payment.token, {
          onSuccess: async () => {
            try {
              await api.post(`/orders/${orderResponse.data.order.id}/confirm-payment`);
              toast.success("Pembayaran berhasil");
            } catch (confirmError) {
              console.log(confirmError);
            }

            navigate("/dashboard/my-orders");
          },
          onPending: () => {
            toast("Pembayaran menunggu konfirmasi");
            navigate("/dashboard/my-orders");
          },
          onError: (error) => {
            console.log(error);
            setValidationError("Pembayaran gagal diproses.");
            toast.error("Pembayaran gagal diproses");
          },
          onClose: () => {
            toast("Pembayaran ditutup");
            navigate("/dashboard/my-orders");
          },
        });
      } else if (payment?.redirect_url) {
        toast("Mengarahkan ke halaman pembayaran");
        window.location.href = payment.redirect_url;
      } else {
        navigate("/dashboard/my-orders");
      }

      await loadCart();
      setSelectedItems([]);
      setValidationError("");
    } catch (error) {
      setValidationError(error.response?.data?.message || "Checkout gagal");
    } finally {
      setLoading(false);
    }
  };

  if (loading && selectedCart.length === 0) {
    return <ScreenLoader label="Menyiapkan checkout..." />;
  }

  if (selectedCart.length === 0) {
    return (
      <EmptyState
        title="Belum ada produk yang dipilih"
        description="Kembali ke keranjang dan pilih item yang ingin dibeli."
      />
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5 sm:p-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Checkout
        </h1>

        <div className="mt-8">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <MapPin size={18} className="text-emerald-600" />
            Alamat Pengiriman
          </h2>

          <textarea
            placeholder="Tulis alamat lengkap penerima..."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows="4"
            className="mt-3 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 transition focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        {validationError ? (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
            {validationError}
          </div>
        ) : null}

        <div className="mt-8 border-t border-slate-100 pt-8">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Package size={18} className="text-emerald-600" />
            Ringkasan Pesanan
          </h2>

          <div className="mt-4 space-y-3">
            {selectedCart.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm transition hover:border-slate-200"
              >
                <span className="text-slate-700">
                  {item.products.name}{" "}
                  <span className="text-slate-400">x {item.quantity}</span>
                </span>

                <span className="font-semibold text-slate-900">
                  Rp {(Number(item.products.price) * item.quantity).toLocaleString("id-ID")}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
            <span className="text-sm font-medium text-slate-500">Total Pembayaran</span>
            <h3 className="text-2xl font-bold text-emerald-600">
              Rp {total.toLocaleString("id-ID")}
            </h3>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCheckout}
          disabled={loading}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-emerald-600/30 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-50 disabled:shadow-none sm:w-auto"
        >
          <ShoppingBag size={18} />
          {loading ? "Memproses..." : "Buat Pesanan"}
        </button>
      </div>
    </div>
  );
}