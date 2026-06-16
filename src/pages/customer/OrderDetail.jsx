/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Calendar, CreditCard, MapPin, Package, Wallet } from "lucide-react";

import api from "../../services/api";
import { EmptyState, ScreenLoader } from "../../components/common/UiStates";
import { loadMidtransSnap } from "../../utils/loadMidtrans";

const STATUS_STYLES = {
  pending: "bg-amber-50 text-amber-600",
  processing: "bg-blue-50 text-blue-600",
  paid: "bg-emerald-50 text-emerald-600",
  shipped: "bg-purple-50 text-purple-600",
  completed: "bg-green-50 text-green-600",
  cancelled: "bg-rose-50 text-rose-600",
};

export default function OrderDetail() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState("");

  const getOrder = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get(`/orders/${id}`);
      setOrder(res.data);
    } catch (requestError) {
      console.log(requestError);
      setError("Detail order gagal dimuat.");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getOrder();
  }, []);

  const handlePayNow = async () => {
    try {
      setPaymentLoading(true);
      const tokenRes = await api.post(`/orders/${id}/payment-token`);
      const snap = await loadMidtransSnap();

      if (snap && tokenRes.data?.token) {
        snap.pay(tokenRes.data.token, {
          onSuccess: async () => {
            try {
              await api.post(`/orders/${id}/confirm-payment`);
            } catch (confirmError) {
              console.log(confirmError);
            }

            await getOrder();
          },
          onPending: async () => {
            await getOrder();
          },
          onClose: async () => {
            await getOrder();
          },
          onError: async (paymentError) => {
            console.log(paymentError);
            await getOrder();
          },
        });
      } else if (tokenRes.data?.redirect_url) {
        window.location.href = tokenRes.data.redirect_url;
      }
    } catch (paymentError) {
      console.log(paymentError);
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return <ScreenLoader label="Memuat detail pesanan..." />;
  }

  if (error) {
    return <EmptyState title="Detail order gagal dimuat" description={error} />;
  }

  if (!order) {
    return (
      <EmptyState title="Order tidak ditemukan" description="Pesanan yang Anda cari tidak tersedia." />
    );
  }

  const statusStyle = STATUS_STYLES[order.status] || "bg-slate-100 text-slate-500";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        Detail Pesanan
      </h1>

      <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
            <Package size={18} className="text-emerald-600" />
            Order #{order.id}
          </h2>

          <span className={`rounded-full px-3 py-1 text-sm font-semibold capitalize ${statusStyle}`}>
            {order.status}
          </span>
        </div>

        {order.created_at ? (
          <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
            <Calendar size={14} />
            {new Date(order.created_at).toLocaleString("id-ID")}
          </p>
        ) : null}

        <div className="mt-6 space-y-3 border-t border-slate-100 pt-6">
          <p className="flex items-center gap-2 text-slate-600">
            <Wallet size={16} className="text-slate-400" />
            Total:
            <span className="font-bold text-emerald-600">
              Rp {Number(order.total_amount).toLocaleString("id-ID")}
            </span>
          </p>

          <p className="flex items-start gap-2 text-slate-600">
            <MapPin size={16} className="mt-0.5 shrink-0 text-slate-400" />
            Alamat: {order.shipping_address}
          </p>
        </div>

        {order.status === "pending" ? (
          <button
            type="button"
            onClick={handlePayNow}
            disabled={paymentLoading}
            className="mt-6 flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-emerald-600/30 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-50 disabled:shadow-none"
          >
            <CreditCard size={18} />
            {paymentLoading ? "Menyiapkan pembayaran..." : "Bayar Sekarang"}
          </button>
        ) : null}
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Produk Dipesan</h2>

        <div className="space-y-4">
          {order.order_items.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm ring-1 ring-slate-900/5 transition hover:-translate-y-0.5 hover:shadow-md sm:p-5"
            >
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                <img
                  src={item.products?.image_url || "https://placehold.co/600x400"}
                  alt={item.products?.name}
                  className="h-full w-full object-cover"
                />
              </div>

              <div>
                <h3 className="font-bold text-slate-900">{item.products?.name}</h3>
                <p className="mt-1 text-sm text-slate-500">Qty: {item.quantity}</p>
                <p className="mt-1 font-semibold text-emerald-600">
                  Rp {Number(item.price).toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}