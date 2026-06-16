/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
// FRONTEND/src/pages/admin/Orders.jsx

import { useCallback, useEffect, useState } from "react";
import { Download, Filter, ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";
import api from "../../services/api";
import { EmptyState, ScreenLoader } from "../../components/common/UiStates";
import toast from "react-hot-toast";

const orderStatuses = ["pending", "paid", "processing", "shipped", "completed", "cancelled"];

const statusColors = {
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  paid: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  processing: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  shipped: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  completed: "bg-green-500/10 text-green-400 border-green-500/30",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/30",
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [exporting, setExporting] = useState(false);

  const getOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/orders", {
        params: {
          status: statusFilter || undefined,
          page,
          limit: 10
        },
      });
      setOrders(res.data.data || []);
      setTotalPages(res.data.meta?.totalPages || 1);
    } catch (error) {
      console.error(error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    getOrders();
  }, [getOrders]);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/orders/${id}/status`, { status });
      toast.success("Status pesanan berhasil diperbarui");
      getOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal memperbarui status");
    }
  };

  const handleExportCSV = async () => {
    try {
      setExporting(true);
      const response = await api.get("/admin/orders/export", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `orders-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Data pesanan berhasil diekspor");
    } catch (error) {
      toast.error("Gagal mengekspor data");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      {/* Header */}
      <div className="flex items-center gap-4 mb-10">
        <div className="relative">
          <div className="absolute inset-0 bg-[#00BFA5]/20 blur-xl rounded-2xl" />
          <div className="relative bg-[#00BFA5]/10 border border-[#00BFA5]/30 p-3 rounded-2xl">
            <ShoppingCart size={28} className="text-[#00BFA5]" />
          </div>
        </div>
        <div>
          <h1 className="text-4xl font-black text-white tracking-[-1px]">ORDERS</h1>
          <p className="text-[#2a3a3a] text-sm">Kelola semua pesanan pelanggan RegarSport</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#14141E] border border-white/5 rounded-2xl px-4 py-2.5">
            <Filter size={18} className="text-white/40 mr-3" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setPage(1);
                setStatusFilter(e.target.value);
              }}
              className="bg-transparent text-white text-sm outline-none cursor-pointer"
            >
              <option value="">Semua Status</option>
              {orderStatuses.map((s) => (
                <option key={s} value={s} className="bg-[#0C0C16]">
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={exporting}
          className="flex items-center gap-2.5 bg-[#00BFA5]/10 hover:bg-[#00BFA5]/20 text-[#00BFA5] hover:text-white px-5 py-3 rounded-2xl border border-[#00BFA5]/20 transition-all font-medium disabled:opacity-50"
        >
          <Download size={18} />
          {exporting ? "Mengekspor..." : "Export CSV"}
        </button>
      </div>

      {loading ? (
        <ScreenLoader label="Memuat daftar pesanan..." />
      ) : orders.length === 0 ? (
        <EmptyState
          title="Belum ada pesanan"
          description="Pesanan dari pelanggan akan muncul di sini."
        />
      ) : (
        <div className="bg-[#14141E] border border-white/5 rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-225">
              <thead>
                <tr className="border-b border-white/5 bg-white/5">
                  <th className="p-6 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Order ID</th>
                  <th className="p-6 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Pelanggan</th>
                  <th className="p-6 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Total</th>
                  <th className="p-6 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="p-6 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Ubah Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-white/5 transition-all duration-200 group"
                  >
                    <td className="p-6 text-white/60 font-mono text-sm">#{order.id}</td>
                    <td className="p-6">
                      <div className="font-medium text-white">
                        {order.users?.full_name || "Customer"}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {order.users?.email}
                      </div>
                    </td>
                    <td className="p-6">
                      <span className="text-lg font-bold text-white">
                        Rp {Number(order.total_amount).toLocaleString("id-ID")}
                      </span>
                    </td>
                    <td className="p-6">
                      <span
                        className={`inline-block text-xs font-bold px-4 py-1.5 rounded-2xl border ${statusColors[order.status] || "bg-white/10 text-white/70"}`}
                      >
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="p-6">
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        className="bg-[#0D0D0D] border border-white/10 hover:border-[#00BFA5]/40 focus:border-[#00BFA5] rounded-2xl px-4 py-2.5 text-sm text-white outline-none transition-all cursor-pointer"
                      >
                        {orderStatuses.map((s) => (
                          <option key={s} value={s}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-10">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            className="flex items-center gap-2 px-5 py-3 bg-[#14141E] border border-white/5 hover:border-white/20 rounded-2xl text-white/70 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:text-white"
          >
            <ChevronLeft size={18} />
            Sebelumnya
          </button>

          <div className="px-6 py-3 bg-[#14141E] border border-white/5 rounded-2xl text-sm text-white/70 font-medium">
            Halaman <span className="text-white font-bold">{page}</span> dari {totalPages}
          </div>

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            className="flex items-center gap-2 px-5 py-3 bg-[#14141E] border border-white/5 hover:border-white/20 rounded-2xl text-white/70 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:text-white"
          >
            Berikutnya
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}