import React, { useState, useEffect } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@navigation/AppNavigator';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Modal,
  Dimensions,
  Alert,
  ActivityIndicator,
  ImageSourcePropType,
  Share
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CartItem } from '@types';
import { supabase } from '@config/supabase';
import { API_BASE_URL, API_HEADERS, APP_SHARE_LINK } from '@config/app';

const { width } = Dimensions.get('window');

const paymentMethods = [
  { label: 'Credit Card', value: 'card' },
  { label: 'GCash', value: 'gcash' },
  { label: 'PayMaya', value: 'maya' },
  { label: 'Bank Transfer', value: 'bank' },
];

type CartScreenProps = NativeStackScreenProps<RootStackParamList, 'Cart'>;

export default function CartScreen({ navigation }: CartScreenProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const selectedPaymentLabel =
    paymentMethods.find(method => method.value === selectedPaymentMethod)?.label || '';

  const fetchCart = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/guest/cart`, {
        headers: API_HEADERS,
      });
      const json = await response.json();
      if (json.success) {
        setCartItems(json.data);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const subtotal = cartItems.reduce(
    (acc, item) => acc + (Number(item.amount) || 0) * (Number(item.quantity) || 1),
    0,
  );
  const total = subtotal;

  const handleCheckout = async () => {
    try {
      setIsProcessing(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        Alert.alert('Login required', 'Sign in first before completing a donation.');
        return;
      }

      if (cartItems.length === 0) {
        Alert.alert('Cart is empty', 'Add a donation card before checking out.');
        return;
      }

      if (!selectedPaymentMethod) {
        Alert.alert('Payment method required', 'Choose a payment method before checking out.');
        return;
      }

      const reference = 'MOCK-' + Math.random().toString(36).substring(2, 10).toUpperCase();
      const fulfillResponse = await fetch(`${API_BASE_URL}/donations/fulfill`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...API_HEADERS,
        },
        body: JSON.stringify({
          userId: user.id,
          amount: total,
          reference,
          paymentMethod: selectedPaymentMethod,
          items: cartItems,
        })
      });
      const fulfillJson = await fulfillResponse.json();

      if (!fulfillResponse.ok || !fulfillJson.success) {
        throw new Error(fulfillJson.error || 'Failed to record donation in Supabase.');
      }

      const clearResponse = await fetch(`${API_BASE_URL}/users/guest/cart/clear`, {
        method: 'POST',
        headers: API_HEADERS,
      });
      const clearJson = await clearResponse.json();

      if (!clearResponse.ok || !clearJson.success) {
        throw new Error(clearJson.error || 'Donation was saved, but the cart could not be cleared.');
      }

      setIsPaymentModalVisible(false);
      setIsSuccessModalVisible(true);
      setCartItems([]);
    } catch (err: any) {
      Alert.alert('Checkout Error', err.message || 'Failed to record donation.');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await Clipboard.setStringAsync(APP_SHARE_LINK);
      Alert.alert('Copied!', 'The link has been copied to your clipboard.');
    } catch (err) {
      Alert.alert('Copy Failed', 'Please try selecting the text manually.');
    }
  };

  const shareDonationLink = async () => {
    try {
      await Share.share({
        message: `Open Digital Donor: ${APP_SHARE_LINK}`,
        url: APP_SHARE_LINK,
      });
    } catch (err) {
      Alert.alert('Share Failed', 'Unable to open the share dialog.');
    }
  };

  const removeItem = async (id: string) => {
    try {
      // PERSIST: Call backend to remove from cart
      const response = await fetch(`${API_BASE_URL}/users/guest/cart/${id}`, {
        method: 'DELETE',
        headers: API_HEADERS,
      });
      const json = await response.json();
      if (json.success) {
        setCartItems(cartItems.filter(item => item.id !== id));
      }
    } catch (err) {
      Alert.alert('Cart Error', 'Failed to remove item from cart.');
    }
  };

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItem}>
      <Image source={item.image as ImageSourcePropType} style={styles.itemImage} resizeMode="cover" />
      <View style={styles.itemDetails}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.itemText}>Amount: ₱{item.amount}</Text>
        <Text style={styles.itemText}>Quantity: {item.quantity}</Text>
        <Text style={styles.itemPrice}>₱{(Number(item.amount) || 0) * (Number(item.quantity) || 1)}</Text>
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
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
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
          <Text style={styles.cartIcon}>🛒</Text>
          <View>
            <Text style={styles.cartHeaderText}>Your Cart</Text>
            <Text style={styles.itemCount}>{cartItems.length} item(s) (Persistent)</Text>
          </View>
        </View>

        {loading ? (
           <View style={styles.emptyContainer}>
              <ActivityIndicator color="#8C4B4B" />
           </View>
        ) : cartItems.length === 0 ? (
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
            (cartItems.length === 0 || loading) && { opacity: 0.6 },
          ]}
          disabled={cartItems.length === 0 || loading}
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
                {selectedPaymentLabel || 'Choose Payment Method'}
              </Text>
              <Text style={styles.dropdownArrow}>⌄</Text>
            </TouchableOpacity>

            {isDropdownOpen && (
              <View style={styles.dropdownMenu}>
                {paymentMethods.map(method => (
                  <TouchableOpacity
                    key={method.value}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setSelectedPaymentMethod(method.value);
                      setIsDropdownOpen(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{method.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.continueBtn,
                (!selectedPaymentMethod || isProcessing) && { opacity: 0.6 },
              ]}
              disabled={!selectedPaymentMethod || isProcessing}
              onPress={handleCheckout}
            >
              {isProcessing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.continueBtnText}>Complete Donation</Text>
              )}
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
                    {APP_SHARE_LINK}
                  </Text>
                </View>
                <TouchableOpacity style={styles.copyBtn} onPress={copyToClipboard}>
                  <Text style={styles.copyIcon}>📋</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.shareBtn} onPress={shareDonationLink}>
                <Text style={styles.shareBtnText}>Share Link</Text>
              </TouchableOpacity>
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
  logo: { color: '#fff', fontSize: 20, fontWeight: '800' as '800', marginRight: 8 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' as '700' },
  backIcon: { color: '#fff', fontSize: 24 },

  content: { flex: 1, padding: 20 },
  cartHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  cartIcon: { fontSize: 24, marginRight: 12 },
  cartHeaderText: { fontSize: 20, fontWeight: 'bold' as 'bold', color: '#333' },
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
  itemTitle: { fontSize: 16, fontWeight: 'bold' as 'bold', color: '#333' },
  itemText: { fontSize: 13, color: '#666' },
  itemPrice: { fontSize: 15, fontWeight: 'bold' as 'bold', color: '#000', marginTop: 4 },
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
  summaryValue: { fontSize: 16, fontWeight: 'bold' as 'bold' },
  totalLabel: { fontSize: 18, fontWeight: 'bold' as 'bold' },
  totalValue: { fontSize: 18, fontWeight: 'bold' as 'bold' },

  proceedBtn: {
    backgroundColor: '#D88C8C',
    height: 56,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  proceedBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' as 'bold' },

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
  modalTitle: { fontSize: 20, fontWeight: 'bold' as 'bold' },
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
  amountText: { fontSize: 24, fontWeight: 'bold' as 'bold', color: '#8C4B4B' },
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
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  continueBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' as 'bold' },

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
    fontWeight: 'bold' as 'bold',
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
  checkMark: { color: '#fff', fontSize: 40, fontWeight: 'bold' as 'bold' },
  successMessage: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
    marginBottom: 30,
  },
  shareContainer: { width: '100%' },
  shareLabel: {
    fontSize: 14,
    fontWeight: 'bold' as 'bold',
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
  shareBtn: {
    alignItems: 'center',
    backgroundColor: '#8C4B4B',
    borderRadius: 8,
    marginTop: 12,
    paddingVertical: 12,
  },
  shareBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' as '700' },
});
