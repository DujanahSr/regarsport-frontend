/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, ChevronLeft, ChevronRight, MapPin, Package, ShoppingBag } from "lucide-react";

import api from "../../services/api";
import { CardSkeletonList, EmptyState } from "../../components/common/UiStates";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const getOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get("/orders/my-orders", {
        params: {
          status: statusFilter || undefined,
          page,
          limit: 5,
        },
      });
      setOrders(res.data.data || []);
      setTotalPages(res.data.meta?.totalPages || 1);
    } catch (error) {
      console.log(error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getOrders();
  }, [statusFilter, page]);

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-amber-50 text-amber-600";
      case "processing":
        return "bg-blue-50 text-blue-600";
      case "paid":
        return "bg-emerald-50 text-emerald-600";
      case "shipped":
        return "bg-purple-50 text-purple-600";
      case "completed":
        return "bg-green-50 text-green-600";
      case "cancelled":
        return "bg-rose-50 text-rose-600";
      default:
        return "bg-slate-100 text-slate-500";
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        Pesanan Saya
      </h1>

      <div className="mb-6 mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-slate-500">Filter riwayat pesanan berdasarkan status.</p>

        <select
          value={statusFilter}
          onChange={(e) => {
            setPage(1);
            setStatusFilter(e.target.value);
          }}
          className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 md:w-56"
        >
          <option value="">Semua Status</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <CardSkeletonList count={2} />
      ) : orders.length === 0 ? (
        <EmptyState
          title="Belum ada pesanan"
          description="Pesanan yang Anda buat akan muncul di sini."
          action={
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-emerald-600/30"
            >
              <ShoppingBag size={18} />
              Belanja Sekarang
            </Link>
          }
        />
      ) : (
        <>
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm ring-1 ring-slate-900/5 transition hover:-translate-y-0.5 hover:shadow-md sm:p-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="flex items-center gap-2 font-bold text-slate-900">
                      <Package size={16} className="text-emerald-600" />
                      Order #{order.id}
                    </h2>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                      <Calendar size={14} />
                      {new Date(order.created_at).toLocaleString("id-ID")}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-sm font-semibold capitalize ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="mt-4 border-t border-slate-100 pt-4">
                  <p className="text-slate-600">
                    Total:{" "}
                    <span className="ml-1 font-bold text-emerald-600">
                      Rp {Number(order.total_amount).toLocaleString("id-ID")}
                    </span>
                  </p>

                  <p className="mt-2 flex items-start gap-1.5 text-sm text-slate-500">
                    <MapPin size={14} className="mt-0.5 shrink-0" />
                    {order.shipping_address}
                  </p>

                  <Link
                    to={`/dashboard/orders/${order.id}`}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-emerald-600/30"
                  >
                    Lihat Detail
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="flex items-center gap-1 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:bg-transparent disabled:hover:text-slate-600"
              >
                <ChevronLeft size={16} />
                Sebelumnya
              </button>

              <span className="text-sm text-slate-500">
                Halaman {page} dari {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="flex items-center gap-1 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:bg-transparent disabled:hover:text-slate-600"
              >
                Berikutnya
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}