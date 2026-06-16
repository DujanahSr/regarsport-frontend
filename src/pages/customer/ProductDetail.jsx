/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Heart, Minus, Plus, ShoppingCart, Star } from "lucide-react";
import toast from "react-hot-toast";

import api from "../../services/api";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { EmptyState, ScreenLoader } from "../../components/common/UiStates";

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const handleAddToCart = () => {
    if (qty > product.stock) {
      toast.error(`Stock hanya tersisa ${product.stock} buah`);
      return;
    }
    addToCart(product, qty);
  };
  const { addToWishlist, removeWishlist, isWishlisted, getWishlistItemId } = useWishlist();

  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });

  const getProduct = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get(`/products/${id}`);
      setProduct(res.data);
    } catch (requestError) {
      console.log(requestError);
      setError("Produk tidak ditemukan atau gagal dimuat.");
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  const getReviews = async () => {
    try {
      setReviewsLoading(true);
      const res = await api.get(`/products/${id}/reviews`);
      setReviews(res.data || []);
    } catch (reviewError) {
      console.log(reviewError);
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    getProduct();
    getReviews();
  }, [id]);

  const averageRating = useMemo(() => {
    if (!reviews.length) {
      return 0;
    }

    return reviews.reduce((sum, item) => sum + Number(item.rating), 0) / reviews.length;
  }, [reviews]);

  const handleSubmitReview = async (event) => {
    event.preventDefault();

    try {
      setReviewSubmitting(true);
      await api.post(`/products/${id}/reviews`, reviewForm);
      toast.success("Review berhasil disimpan");
      setReviewForm({ rating: 5, comment: "" });
      await getReviews();
    } catch (reviewError) {
      const message = reviewError.response?.data?.message || "Gagal mengirim review";
      toast.error(message);
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return <ScreenLoader label="Memuat detail produk..." />;
  }

  if (error) {
    return <EmptyState title="Detail produk gagal dimuat" description={error} />;
  }

  if (!product) {
    return <EmptyState title="Produk tidak tersedia" description="Produk yang Anda cari tidak ditemukan." />;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5 sm:p-8">
        <div className="grid gap-10 md:grid-cols-2">
          <div className="group aspect-square overflow-hidden rounded-2xl bg-slate-100">
            <img
              src={product.image_url || "https://placehold.co/600x400"}
              alt={product.name}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              {product.name}
            </h1>

            <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
              <div className="flex items-center gap-1 text-amber-500">
                <Star size={15} className="fill-current" />
                <span className="font-semibold text-slate-700">{averageRating.toFixed(1)}</span>
              </div>
              <span className="text-slate-300">•</span>
              <span>{reviews.length} review</span>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <p className="text-3xl font-bold text-emerald-600">
                Rp {Number(product.price).toLocaleString("id-ID")}
              </p>

              {product.stock === 0 ? (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                  Stok Habis
                </span>
              ) : product.stock <= 5 ? (
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-600">
                  Sisa {product.stock}
                </span>
              ) : (
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                  Stok Tersedia
                </span>
              )}
            </div>

            <p className="mt-2 text-sm text-slate-400">Stok: {product.stock}</p>

            <div className="mt-6">
              <h2 className="text-lg font-semibold text-slate-900">Deskripsi</h2>
              <p className="mt-2 leading-relaxed text-slate-600">{product.description}</p>
            </div>

            <div className="mt-8 flex items-center gap-4">
              <div className="flex items-center rounded-full border border-slate-200">
                <button
                  type="button"
                  onClick={() => qty > 1 && setQty(qty - 1)}
                  disabled={qty <= 1}
                  className="flex h-11 w-11 items-center justify-center rounded-full text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-600"
                  aria-label="Kurangi jumlah"
                >
                  <Minus size={16} />
                </button>

                <span className="min-w-12 text-center text-lg font-bold text-slate-900">{qty}</span>

                <button
                  type="button"
                  onClick={() => qty < product.stock && setQty(qty + 1)}
                  disabled={qty >= product.stock}
                  className="flex h-11 w-11 items-center justify-center rounded-full text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-600"
                  aria-label="Tambah jumlah"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={async () => {
                  if (isWishlisted(product.id)) {
                    await removeWishlist(getWishlistItemId(product.id));
                  } else {
                    await addToWishlist(product.id);
                  }
                }}
                className="flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
              >
                <Heart
                  size={18}
                  className={isWishlisted(product.id) ? "fill-rose-500 text-rose-500" : ""}
                />
                {isWishlisted(product.id) ? "Hapus Wishlist" : "Tambah Wishlist"}
              </button>

              <button
                type="button"
                onClick={handleAddToCart}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-emerald-600/30"
              >
                <ShoppingCart size={18} />
                Tambah ke Keranjang
              </button>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-100 pt-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Review Produk</h2>
              <p className="mt-1 text-sm text-slate-500">
                {reviews.length > 0
                  ? `${reviews.length} review, rating rata-rata ${averageRating.toFixed(1)}/5`
                  : "Belum ada review untuk produk ini"}
              </p>
            </div>

            <div className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3.5 py-1.5">
              <Star size={16} className="fill-amber-500 text-amber-500" />
              <span className="font-semibold text-amber-700">{averageRating.toFixed(1)}</span>
            </div>
          </div>

          <form onSubmit={handleSubmitReview} className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="grid gap-4 md:grid-cols-3">
              <select
                value={reviewForm.rating}
                onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                className="rounded-xl border border-slate-200 bg-white p-3 text-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                {[5, 4, 3, 2, 1].map((value) => (
                  <option key={value} value={value}>
                    {value} Bintang
                  </option>
                ))}
              </select>

              <textarea
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                placeholder="Tulis review kamu..."
                rows="3"
                className="rounded-xl border border-slate-200 bg-white p-3 text-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 md:col-span-2"
              />
            </div>

            <button
              type="submit"
              disabled={reviewSubmitting}
              className="mt-4 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {reviewSubmitting ? "Mengirim..." : "Kirim Review"}
            </button>
          </form>

          {reviewsLoading ? (
            <ScreenLoader label="Memuat review..." />
          ) : reviews.length === 0 ? (
            <EmptyState
              title="Belum ada review"
              description="Jadilah yang pertama memberi ulasan untuk produk ini."
            />
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="rounded-2xl border border-slate-100 bg-white p-4 transition hover:border-slate-200 hover:shadow-md sm:p-5"
                >
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-emerald-100 ring-2 ring-white">
                      {review.users?.avatar_url ? (
                        <img
                          src={review.users.avatar_url}
                          alt={review.users.full_name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="font-bold text-emerald-700">
                          {review.users?.full_name?.charAt(0)?.toUpperCase() || "U"}
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="font-semibold text-slate-900">{review.users?.full_name || "User"}</h3>
                      <div className="flex items-center gap-1 text-amber-500">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star
                            key={index}
                            size={14}
                            className={index < Number(review.rating) ? "fill-current" : "text-slate-300"}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <p className="leading-relaxed text-slate-600">{review.comment}</p>

                  {review.review_replies && review.review_replies.length > 0 && (
                    <div className="mt-3 rounded-xl border-l-4 border-emerald-300 bg-emerald-50 p-3 text-sm">
                      <span className="font-semibold text-emerald-700">
                        {review.review_replies[0].admin_name} (Admin):
                      </span>
                      <p className="mt-1 text-slate-600">{review.review_replies[0].reply}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}