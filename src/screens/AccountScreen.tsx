import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Header } from "../components/Header";
import { PrimaryButton } from "../components/PrimaryButton";
import { MenuItem } from "../components/MenuItem";
import { useAuth, useWishlist } from "../store/hooks";
import { TabScreenProps } from "../navigation/types";
import { colors } from "../theme";

export function AccountScreen({ navigation }: TabScreenProps<"Account">) {
  const { user, isLoggedIn, signOut } = useAuth();
  const { ids } = useWishlist();

  return (
    <View style={styles.container}>
      <Header title="👤 Tài khoản" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* KHU VỰC THÔNG TIN CÁ NHÂN (CARD TRẮNG BO GÓC) */}
        {isLoggedIn && user ? (
          <View style={styles.profileCard}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarEmoji}>🙂</Text>
            </View>
            
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.email}>{user.email}</Text>
            
            {/* Hiện SĐT nếu có */}
            {user.phone ? (
              <Text style={styles.phone}>📞 {user.phone}</Text>
            ) : null}

            {/* Nút chỉnh sửa hồ sơ */}
            <TouchableOpacity
              style={styles.editButton}
              activeOpacity={0.7}
              onPress={() => navigation.navigate("EditProfile")}
            >
              <Text style={styles.editButtonText}>✎ Chỉnh sửa hồ sơ</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.profileCard}>
            <View style={[styles.avatarCircle, styles.avatarLocked]}>
              <Text style={styles.avatarEmoji}>🔒</Text>
            </View>
            <Text style={styles.name}>Bạn chưa đăng nhập</Text>
            <Text style={styles.subText}>
              Đăng nhập để theo dõi đơn hàng và lưu sách yêu thích của bạn
            </Text>
            <View style={styles.authActions}>
              <View style={styles.flexBtn}>
                <PrimaryButton title="Đăng nhập" onPress={() => navigation.navigate("Login")} />
              </View>
              <View style={styles.flexBtn}>
                <PrimaryButton
                  title="Đăng ký"
                  variant="outline"
                  onPress={() => navigation.navigate("Register")}
                />
              </View>
            </View>
          </View>
        )}

        {/* KHU VỰC MENU CHỨC NĂNG */}
        <Text style={styles.sectionTitle}>TIỆN ÍCH CỦA TÔI</Text>
        <View style={styles.menuGroup}>
          <MenuItem
            emoji="🔔"
            label="Thông báo"
            onPress={() => navigation.navigate("Notifications")}
          />
          <MenuItem
            emoji="🧾"
            label="Đơn hàng của tôi"
            onPress={() => navigation.navigate("Orders")}
          />
          <MenuItem
            emoji="❤️"
            label="Danh sách yêu thích"
            hint={ids.length ? `${ids.length} sách` : undefined}
            onPress={() => navigation.navigate("Wishlist")}
          />
        </View>

        {/* NÚT ĐĂNG XUẤT */}
        {isLoggedIn && (
          <View style={styles.logoutSection}>
            <PrimaryButton title="Đăng xuất" variant="outline" onPress={signOut} />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg || "#F3F5F9",
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  // Thẻ thông tin người dùng đồng bộ với thẻ Đơn hàng trong ảnh mẫu
  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 22,
    paddingHorizontal: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8ECF4",
    shadowColor: "#1E293B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 20,
  },
  avatarCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#EEF2FF",
    borderWidth: 2,
    borderColor: "#C7D2FE",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarLocked: {
    backgroundColor: "#F1F5F9",
    borderColor: "#CBD5E1",
  },
  avatarEmoji: {
    fontSize: 38,
  },
  name: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.text || "#0F172A",
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: colors.muted || "#64748B",
    marginBottom: 4,
  },
  phone: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 2,
  },
  subText: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    marginTop: 4,
    marginBottom: 16,
    paddingHorizontal: 12,
    lineHeight: 18,
  },
  editButton: {
    marginTop: 14,
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  editButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1D4ED8",
  },
  authActions: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  flexBtn: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
    letterSpacing: 0.6,
    marginBottom: 8,
    marginLeft: 4,
  },
  menuGroup: {
    gap: 10,
  },
  logoutSection: {
    marginTop: 24,
  },
});
