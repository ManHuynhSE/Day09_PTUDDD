import React, { useCallback, useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { StatusBadge } from "../components/StatusBadge";
import { PrimaryButton } from "../components/PrimaryButton";
import { EmptyState } from "../components/EmptyState";
import { LoadingView } from "../components/LoadingView";
import { ErrorView } from "../components/ErrorView";
import { getOrdersByUser } from "../services/orderService";
import { getBooks } from "../services/bookService";
import { getErrorMessage } from "../api/client";
import { useAuth, useCart } from "../store/hooks";
import { formatDateTime } from "../utils/format";
import { showMessage } from "../utils/dialog";
import { RootScreenProps } from "../navigation/types";
import { Order } from "../types";
import { colors, formatPrice, radius } from "../theme";

export const PAYMENT_LABEL = {
  cod: "Thanh toán khi nhận hàng (COD)",
  bank: "Chuyển khoản ngân hàng",
} as const;

export function OrdersScreen({ navigation }: RootScreenProps<"Orders">) {
  const { user, isLoggedIn } = useAuth();
  const { items: cartItems, add, setQty } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<number | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getOrdersByUser(user.id);
      setOrders(res.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  // Thử thách BT9.C1: Mua lại toàn bộ sản phẩm của đơn
  const reorder = async (order: Order) => {
    // 1. Lấy danh sách sách từ API (getBooks)
    const books = await getBooks();
    // 2. Duyệt từng item trong order.items, tìm sách tương ứng trong books
    for (const item of order.items) {
      const book = books.find((b) => b.id === item.bookId);
      if (!book) continue; // sách đã bị xóa khỏi hệ thống → bỏ qua
      // 3. Nếu sách còn tồn tại, add vào giỏ (nếu đã có thì tăng số lượng)
      const existingQty = cartItems.find((ci) => ci.bookId === book.id)?.quantity ?? 0;
      setQty(book.id, existingQty + item.quantity);
    }
    showMessage("Đã thêm vào giỏ", "Các sản phẩm trong đơn đã được thêm vào giỏ hàng.");
    navigation.navigate("Tabs", { screen: "Cart" });
  };

  if (!isLoggedIn) {
    return (
      <EmptyState
        emoji="🔒"
        title="Bạn cần đăng nhập"
        actionLabel="Đăng nhập"
        onAction={() => navigation.navigate("Login")}
      />
    );
  }
  if (loading) return <LoadingView />;
  if (error) return <ErrorView message={error} onRetry={load} />;

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={orders.length === 0 ? styles.emptyList : styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const isOpen = openId === item.id;

          return (
            <View style={styles.card}>
              <TouchableOpacity
                activeOpacity={0.75}
                style={styles.cardHeader}
                onPress={() => setOpenId(isOpen ? null : item.id)}
              >
                <View style={styles.headerLeft}>
                  <Text style={styles.orderId}>Đơn #{item.id}</Text>
                  <Text style={styles.orderDate}>{formatDateTime(item.createdAt)}</Text>
                  <Text style={styles.orderTotal}>{formatPrice(item.total)}</Text>
                </View>

                <View style={styles.headerRight}>
                  <StatusBadge status={item.status} />
                  <Text style={styles.toggleText}>
                    {isOpen ? "Thu gọn ▲" : "Chi tiết ▼"}
                  </Text>
                </View>
              </TouchableOpacity>

          
              {isOpen && (
                <View style={styles.detailBox}>
                  <View style={styles.divider} />

                 
                  <View style={styles.itemList}>
                    {item.items.map((it) => (
                      <View key={it.bookId} style={styles.itemRow}>
                        <Text style={styles.itemTitle} numberOfLines={2}>
                          {it.title}{" "}
                          <Text style={styles.itemQty}>× {it.quantity}</Text>
                        </Text>
                        <Text style={styles.itemPrice}>
                          {formatPrice(it.price * it.quantity)}
                        </Text>
                      </View>
                    ))}
                  </View>

                
                  <View style={styles.shippingBox}>
                    <Text style={styles.shippingHeading}>Giao đến</Text>
                    <Text style={styles.shippingText}>
                      {item.address.name} - {item.address.phone}
                    </Text>
                    <Text style={styles.shippingText}>{item.address.address}</Text>
                    <Text style={styles.paymentText}>
                      Thanh toán: {PAYMENT_LABEL[item.paymentMethod]}
                    </Text>
                  </View>

                  {/* Nút Mua lại */}
                  <PrimaryButton
                    title="Mua lại"
                    variant="outline"
                    onPress={() => reorder(item)}
                  />
                </View>
              )}
            </View>
          );
        }}
        
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg || "#F3F5F9",
  },
  listContent: {
    padding: 14,
    gap: 12,
    paddingBottom: 28,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 16,
  },
  // Thẻ đơn hàng màu trắng bo góc giống ảnh mẫu
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: radius.md || 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E8ECF4",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerLeft: {
    gap: 3,
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text || "#0F172A",
  },
  orderDate: {
    fontSize: 12,
    color: colors.muted || "#64748B",
  },
  orderTotal: {
    fontSize: 15,
    fontWeight: "800",

    color: "#1D4ED8",
    marginTop: 2,
  },
  headerRight: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 14,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },
  // Khu vực chi tiết mở rộng
  detailBox: {
    marginTop: 12,
    gap: 12,
  },
  divider: {
    height: 1,
    backgroundColor: "#EEF2F6",
  },
  itemList: {
    gap: 6,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  itemTitle: {
    flex: 1,
    fontSize: 13,
    color: "#1E293B",
    lineHeight: 18,
  },
  itemQty: {
    fontWeight: "700",
    color: "#475569",
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
  },
  // Khung "Giao đến" nền xám nhạt
  shippingBox: {
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: radius.sm || 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 3,
  },
  shippingHeading: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 2,
  },
  shippingText: {
    fontSize: 12.5,
    color: "#475569",
    lineHeight: 18,
  },
  paymentText: {
    fontSize: 12.5,
    color: "#475569",
    marginTop: 2,
  },
});
