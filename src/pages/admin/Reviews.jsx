/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
import { memo, useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  MessageSquareText,
  Search,
  Star,
  Reply,
  Trash2,
  Send,
} from "lucide-react";
import api from "../../services/api";
import { EmptyState, ScreenLoader } from "../../components/common/UiStates";
import toast from "react-hot-toast";

/* ----------------------------------------------------------------
   ReviewRow – memoized untuk performa
---------------------------------------------------------------- */
const ReviewRow = memo(function ReviewRow({ review, index, page, limit, onReplySent }) {
  const [avatarError, setAvatarError] = useState(false);
  const [productImageError, setProductImageError] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState(review.review_replies?.[0]?.reply || "");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitReply = async () => {
    if (!replyText.trim()) {
      toast.error("Balasan tidak boleh kosong");
      return;
    }
    try {
      setSubmitting(true);
      await api.post(`/admin/reviews/${review.id}/reply`, { reply: replyText });
      toast.success("Balasan berhasil disimpan");
      setShowReplyForm(false);
      onReplySent();
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal menyimpan balasan");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReply = async () => {
    if (!confirm("Hapus balasan ini?")) return;
    try {
      await api.delete(`/admin/reviews/${review.id}/reply`);
      toast.success("Balasan dihapus");
      onReplySent();
    } catch (error) {
      toast.error("Gagal menghapus balasan");
    }
  };

  const existingReply = review.review_replies?.[0];

  return (
    <tr className="border-b border-white/5 hover:bg-white/3 transition-colors duration-200 group">
      <td className="p-4 text-white/40 text-sm font-mono">
        {(page - 1) * limit + index + 1}
      </td>
      <td className="p-4 min-w-48">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full overflow-hidden bg-[#1a1a2a] border border-white/10 flex items-center justify-center shrink-0">
            {review.users?.avatar_url && !avatarError ? (
              <img
                src={review.users.avatar_url}
                alt={review.users.full_name}
                className="w-full h-full object-cover"
                onError={() => setAvatarError(true)}
              />
            ) : (
              <span className="text-xs font-bold text-[#00BFA5]">
                {review.users?.full_name?.charAt(0)?.toUpperCase() || "U"}
              </span>
            )}
          </div>
          <div>
            <p className="text-white/90 text-sm font-semibold group-hover:text-white transition-colors">
              {review.users?.full_name || "-"}
            </p>
            <p className="text-white/30 text-xs">{review.users?.email || "-"}</p>
          </div>
        </div>
      </td>
      <td className="p-4 min-w-48">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#0C0C16] border border-white/10 flex items-center justify-center shrink-0">
            {review.products?.image_url && !productImageError ? (
              <img
                src={review.products.image_url}
                alt={review.products?.name}
                className="w-full h-full object-cover"
                onError={() => setProductImageError(true)}
              />
            ) : (
              <MessageSquareText size={16} className="text-white/30" />
            )}
          </div>
          <p className="text-white/80 text-sm font-medium truncate max-w-45">
            {review.products?.name || "-"}
          </p>
        </div>
      </td>
      <td className="p-4">
        <div className="flex items-center gap-0.5 text-yellow-500">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={14}
              className={i < Number(review.rating) ? "fill-current" : "text-white/20"}
            />
          ))}
        </div>
      </td>
      <td className="p-4 text-white/70 text-sm max-w-xs">
        <p className="line-clamp-3">{review.comment}</p>
        {existingReply && (
          <div className="mt-2 p-2 bg-[#00BFA5]/10 border border-[#00BFA5]/20 rounded-xl text-xs">
            <span className="font-semibold text-[#00BFA5]">
              Admin {existingReply.admin_name}:
            </span>
            <span className="text-white/80 ml-1">{existingReply.reply}</span>
          </div>
        )}
      </td>
      <td className="p-4 text-white/40 text-sm whitespace-nowrap">
        {new Date(review.created_at).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}
      </td>
      <td className="p-4">
        {!showReplyForm ? (
          <button
            onClick={() => setShowReplyForm(true)}
            className="p-2 rounded-xl hover:bg-white/5 text-[#00BFA5]/60 hover:text-[#00BFA5] transition-all duration-200"
            title="Balas"
          >
            <Reply size={18} />
          </button>
        ) : (
          <div className="flex flex-col gap-2 min-w-52 animate-in fade-in slide-in-from-top-2 duration-200">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Tulis balasan..."
              className="bg-[#0D0D0D] border border-white/10 rounded-xl p-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#00BFA5]/60 transition-all resize-none"
              rows={2}
            />
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleSubmitReply}
                disabled={submitting}
                className="flex items-center gap-1.5 bg-[#00BFA5] hover:bg-[#00BFA5]/90 text-black font-bold px-3 py-1.5 rounded-lg text-xs transition disabled:opacity-50 active:scale-95"
              >
                <Send size={12} /> Kirim
              </button>
              <button
                onClick={() => setShowReplyForm(false)}
                className="bg-white/5 hover:bg-white/10 text-white/70 px-3 py-1.5 rounded-lg text-xs border border-white/10 transition"
              >
                Batal
              </button>
              {existingReply && (
                <button
                  onClick={handleDeleteReply}
                  className="flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg text-xs border border-red-500/20 transition"
                >
                  <Trash2 size={12} /> Hapus
                </button>
              )}
            </div>
          </div>
        )}
      </td>
    </tr>
  );
});

/* ----------------------------------------------------------------
   Reviews Page
---------------------------------------------------------------- */
export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const limit = 10;
  const searchTimerRef = useRef(null);

  /* Debounce search */
  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setPage(1);
      setDebouncedSearch(search.trim());
    }, 350);
    return () => clearTimeout(searchTimerRef.current);
  }, [search]);

  /* Fetch reviews */
  const getReviews = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/reviews", {
        params: {
          search: debouncedSearch || undefined,
          rating: ratingFilter || undefined,
          page,
          limit,
        },
      });
      setReviews(res.data.data || []);
      setTotal(res.data.meta?.total || 0);
      setTotalPages(res.data.meta?.totalPages || 1);
      setAverageRating(Number(res.data.summary?.averageRating || 0));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, ratingFilter, page]);

  useEffect(() => {
    getReviews();
  }, [getReviews]);

  const activeFilterLabel = ratingFilter ? `${ratingFilter} bintang` : "Semua rating";

  return (
    <div className="min-h-screen bg-[#0D0D0D] pb-10">
      {/* ======================== HEADER ======================== */}
      <div className="flex items-center gap-4 mb-10">
        <div className="relative">
          <div className="absolute inset-0 bg-[#00BFA5]/20 blur-xl rounded-2xl" />
          <div className="relative bg-[#00BFA5]/10 border border-[#00BFA5]/30 p-3 rounded-2xl">
            <MessageSquareText size={28} className="text-[#00BFA5]" />
          </div>
        </div>
        <div>
          <h1 className="text-4xl font-black text-white tracking-[-1px]">REVIEWS</h1>
          <p className="text-[#2a3a3a] text-sm">
            Total <span className="text-white font-semibold">{total}</span> review · Rata‑rata{" "}
            <span className="text-white font-semibold">{averageRating.toFixed(1)}</span>/5 ·{" "}
            {activeFilterLabel}
          </p>
        </div>
      </div>

      {/* ======================== FILTER BAR ======================== */}
      <div className="flex flex-col md:flex-row gap-3 mb-8">
        {/* Search */}
        <div className="flex items-center gap-3 flex-1 bg-[#14141E] border border-white/5 rounded-2xl px-5 py-3 hover:border-[#00BFA5]/20 transition-all duration-300 group">
          <Search size={20} className="text-white/30 group-hover:text-[#00BFA5]/60 transition-colors duration-300" />
          <input
            type="text"
            placeholder="Cari isi komentar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-white/30"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="p-1 rounded-lg hover:bg-white/5 text-white/30 hover:text-white/60 transition-all"
            >
              <ChevronRight size={16} className="rotate-45" />
            </button>
          )}
        </div>

        {/* Rating Filter */}
        <select
          value={ratingFilter}
          onChange={(e) => {
            setPage(1);
            setRatingFilter(e.target.value);
          }}
          className="bg-[#14141E] border border-white/5 rounded-2xl px-5 py-3 text-white text-sm outline-none hover:border-[#00BFA5]/20 focus:border-[#00BFA5]/40 transition-all duration-300 cursor-pointer appearance-none bg-no-repeat bg-position-[right_1rem_center] bg-size-[1rem]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2300BFA5' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
          }}
        >
          <option value="">Semua Rating</option>
          {[5, 4, 3, 2, 1].map((r) => (
            <option key={r} value={r} className="bg-[#0D0D0D]">{r} Bintang</option>
          ))}
        </select>
      </div>

      {/* ======================== TABLE ======================== */}
      {loading ? (
        <ScreenLoader label="Memuat review..." />
      ) : reviews.length === 0 ? (
        <EmptyState title="Belum ada review" description="Belum ada customer yang memberikan review produk." />
      ) : (
        <div className="bg-[#14141E] border border-white/5 rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-225">
              <thead>
                <tr className="border-b border-white/5 bg-white/2">
                  <th className="p-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">No</th>
                  <th className="p-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Customer</th>
                  <th className="p-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Produk</th>
                  <th className="p-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Rating</th>
                  <th className="p-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Komentar</th>
                  <th className="p-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Tanggal</th>
                  <th className="p-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {reviews.map((review, idx) => (
                  <ReviewRow
                    key={review.id}
                    review={review}
                    index={idx}
                    page={page}
                    limit={limit}
                    onReplySent={getReviews}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================== PAGINATION ======================== */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-10">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            className="flex items-center gap-2 px-5 py-3 bg-[#14141E] border border-white/5 hover:border-white/20 rounded-2xl text-white/60 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 hover:text-white active:scale-95"
          >
            <ChevronLeft size={18} />
            Sebelumnya
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all duration-300 active:scale-90 ${
                  p === page
                    ? "bg-[#00BFA5] text-black shadow-[0_0_20px_rgba(0,191,165,0.3)]"
                    : "bg-[#14141E] border border-white/5 text-white/50 hover:text-white hover:border-white/20"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            className="flex items-center gap-2 px-5 py-3 bg-[#14141E] border border-white/5 hover:border-white/20 rounded-2xl text-white/60 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 hover:text-white active:scale-95"
          >
            Berikutnya
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Subtle background grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.015] z-[-1]"
        style={{
          backgroundImage: `linear-gradient(#00BFA5 1px, transparent 1px), linear-gradient(90deg, #00BFA5 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
        }}
      />
    </div>
  );
}