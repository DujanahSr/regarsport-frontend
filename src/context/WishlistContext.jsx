/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import toast from "react-hot-toast";

import api from "../services/api";
import { useAuth } from "./AuthContext";

const WishlistContext =
  createContext();

export const WishlistProvider = ({
  children,
}) => {
  const [wishlistItems, setWishlistItems] =
    useState([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();

  const loadWishlist =
    useCallback(async () => {
      if (!user) {
        setWishlistItems([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res =
          await api.get(
            "/wishlist"
          );

        setWishlistItems(
          res.data
        );
      } catch (error) {
        console.error(error);
        setWishlistItems([]);
      }

      setLoading(false);
    }, [user]);

  const addToWishlist =
    useCallback(async (productId) => {
      try {
        await api.post(
          "/wishlist",
          {
            product_id:
              productId,
          }
        );

        await loadWishlist();

        toast.success("Produk ditambahkan ke wishlist");

        return true;
      } catch (error) {
        console.error(error);
        toast.error(error.response?.data?.message || "Gagal menambahkan ke wishlist");

        return false;
      }
    }, [loadWishlist]);

  const removeWishlist =
    useCallback(async (wishlistId) => {
      try {
        await api.delete(
          `/wishlist/${wishlistId}`
        );

        await loadWishlist();
        toast.success("Wishlist dihapus");
      } catch (error) {
        console.error(error);
        toast.error(error.response?.data?.message || "Gagal menghapus wishlist");
      }
    }, [loadWishlist]);

  const isWishlisted = useCallback((
    productId
  ) => {
    return wishlistItems.some(
      (item) =>
        item.product_id ===
        productId
    );
  }, [wishlistItems]);

  const getWishlistItemId = useCallback((
    productId
  ) => {
    const item =
      wishlistItems.find(
        (item) =>
          item.product_id ===
          productId
      );

    return item?.id;
  }, [wishlistItems]);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    loadWishlist();
  }, [authLoading, loadWishlist]);

  const value = useMemo(
    () => ({
      wishlistItems,
      loading,
      loadWishlist,
      addToWishlist,
      removeWishlist,
      isWishlisted,
      getWishlistItemId,
    }),
    [
      addToWishlist,
      getWishlistItemId,
      isWishlisted,
      loadWishlist,
      loading,
      removeWishlist,
      wishlistItems,
    ]
  );

  return (
    <WishlistContext.Provider
      value={value}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () =>
  useContext(WishlistContext);
