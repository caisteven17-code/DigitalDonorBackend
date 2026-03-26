import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Image,
  Modal,
  Dimensions,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const paymentMethods = ['Credit Card', 'GCash', 'PayMaya', 'Bank Transfer'];

export default function CartScreen({ navigation, route }) {
  const { cartItems: initialCartItems = [] } = route.params || {};
  const [cartItems, setCartItems] = useState(initialCartItems);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.amount * item.quantity,
    0,
  );
  const total = subtotal;

  const removeItem = id => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image source={item.image} style={styles.itemImage} />
      <View style={styles.itemDetails}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.itemText}>Amount: ₱{item.amount}</Text>
        <Text style={styles.itemText}>Quantity: {item.quantity}</Text>
        <Text style={styles.itemPrice}>₱{item.amount * item.quantity}</Text>
      </View>
      <TouchableOpacity
        onPress={() => removeItem(item.id)}
        style={styles.deleteBtn}
      >
        <Text style={styles.deleteIcon}>🗑️</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerLeft}>
          <Text style={styles.logo}>H</Text>
          <Text style={styles.headerTitle}>Hopecard</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.cartHeaderRow}>
          <Text style={styles.cartIcon} />
          <View>
            <Text style={styles.cartHeaderText}>Your Cart</Text>
            <Text style={styles.itemCount}>{cartItems.length} item(s)</Text>
          </View>
        </View>

        {cartItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Your cart is empty</Text>
          </View>
        ) : (
          <FlatList
            data={cartItems}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderCartItem}
            contentContainerStyle={styles.listContent}
          />
        )}

        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>{subtotal} php</Text>
          </View>
          <View
            style={[
              styles.summaryRow,
              { borderTopWidth: 1, borderColor: '#eee', paddingTop: 10 },
            ]}
          >
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{total} php</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.proceedBtn,
            cartItems.length === 0 && { opacity: 0.6 },
          ]}
          disabled={cartItems.length === 0}
          onPress={() => setIsPaymentModalVisible(true)}
        >
          <Text style={styles.proceedBtnText}>Proceed to Payment</Text>
        </TouchableOpacity>
      </View>

      {/* Payment Details Modal */}
      <Modal visible={isPaymentModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.paymentModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Payment Details</Text>
              <TouchableOpacity onPress={() => setIsPaymentModalVisible(false)}>
                <Text style={styles.closeModal}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>About to pay:</Text>
            <View style={styles.amountBox}>
              <Text style={styles.amountText}>{total} php</Text>
            </View>

            <Text style={styles.label}>Payment Method</Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <Text style={styles.dropdownText}>
                {selectedPaymentMethod || 'Choose Payment Method'}
              </Text>
              <Text style={styles.dropdownArrow}>⌄</Text>
            </TouchableOpacity>

            {isDropdownOpen && (
              <View style={styles.dropdownMenu}>
                {paymentMethods.map(method => (
                  <TouchableOpacity
                    key={method}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setSelectedPaymentMethod(method);
                      setIsDropdownOpen(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{method}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.continueBtn,
                !selectedPaymentMethod && { opacity: 0.6 },
              ]}
              disabled={!selectedPaymentMethod}
              onPress={() => {
                setIsPaymentModalVisible(false);
                setIsSuccessModalVisible(true);
              }}
            >
              <Text style={styles.continueBtnText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal visible={isSuccessModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.successModal}>
            <TouchableOpacity
              style={styles.closeSuccess}
              onPress={() => {
                setIsSuccessModalVisible(false);
                setCartItems([]);
                navigation.navigate('Home');
              }}
            >
              <Text style={{ fontSize: 20 }}>✕</Text>
            </TouchableOpacity>

            <Text style={styles.successTitle}>Payment Successful!</Text>

            <View style={styles.successCircle}>
              <Text style={styles.checkMark}>✓</Text>
            </View>

            <Text style={styles.successMessage}>
              Thank you for your generous donation!
            </Text>

            <View style={styles.shareContainer}>
              <Text style={styles.shareLabel}>Share this donation:</Text>
              <View style={styles.linkBox}>
                <View style={styles.linkTextContainer}>
                  <Text style={styles.linkText} numberOfLines={1}>
                    https://example.com/post-enddont
                  </Text>
                </View>
                <TouchableOpacity style={styles.copyBtn}>
                  <Text style={styles.copyIcon}>📋</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    backgroundColor: '#D88C8C',
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  logo: { color: '#fff', fontSize: 20, fontWeight: '800', marginRight: 8 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  backIcon: { color: '#fff', fontSize: 24 },

  content: { flex: 1, padding: 20 },
  cartHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  cartIcon: { fontSize: 24, marginRight: 12 },
  cartHeaderText: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  itemCount: { fontSize: 14, color: '#666' },

  emptyContainer: {
    height: 120,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyText: { color: '#8C4B4B', fontSize: 16 },

  listContent: { paddingBottom: 20 },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  itemImage: { width: 60, height: 60, borderRadius: 8 },
  itemDetails: { flex: 1, marginLeft: 12 },
  itemTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  itemText: { fontSize: 13, color: '#666' },
  itemPrice: { fontSize: 15, fontWeight: 'bold', color: '#000', marginTop: 4 },
  deleteBtn: { padding: 8 },
  deleteIcon: { fontSize: 20 },

  summaryContainer: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: { fontSize: 16, color: '#666' },
  summaryValue: { fontSize: 16, fontWeight: 'bold' },
  totalLabel: { fontSize: 18, fontWeight: 'bold' },
  totalValue: { fontSize: 18, fontWeight: 'bold' },

  proceedBtn: {
    backgroundColor: '#D88C8C',
    height: 56,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  proceedBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentModal: {
    backgroundColor: '#fff',
    width: width * 0.85,
    borderRadius: 20,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  closeModal: { fontSize: 20, color: '#666' },
  label: { fontSize: 14, color: '#333', marginBottom: 10, marginTop: 10 },
  amountBox: {
    backgroundColor: '#FDF2F2',
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  amountText: { fontSize: 24, fontWeight: 'bold', color: '#8C4B4B' },
  dropdown: {
    height: 50,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    justifyContent: 'space-between',
    backgroundColor: '#f9f9f9',
  },
  dropdownText: { fontSize: 16, color: '#666' },
  dropdownArrow: { fontSize: 18, color: '#666' },
  dropdownMenu: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 12,
    marginTop: 5,
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  dropdownItemText: { fontSize: 16, color: '#333' },
  continueBtn: {
    backgroundColor: '#D88C8C',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  continueBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },

  // Success Modal
  successModal: {
    backgroundColor: '#fff',
    width: width * 0.85,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  closeSuccess: { alignSelf: 'flex-end', padding: 5 },
  successTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#5D4037',
    marginBottom: 20,
  },
  successCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkMark: { color: '#fff', fontSize: 40, fontWeight: 'bold' },
  successMessage: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
    marginBottom: 30,
  },
  shareContainer: { width: '100%' },
  shareLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  linkBox: { flexDirection: 'row', alignItems: 'center' },
  linkTextContainer: {
    flex: 1,
    height: 45,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: 10,
    marginRight: 10,
  },
  linkText: { color: '#3E76BB', fontSize: 12 },
  copyBtn: {
    width: 45,
    height: 45,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  copyIcon: { fontSize: 18 },
});
