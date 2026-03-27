import React, { useState, useEffect } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@navigation/AppNavigator';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  ScrollView,
  useWindowDimensions,
  StatusBar,
  ActivityIndicator,
  Alert,
  ImageSourcePropType
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Campaign, CartItem } from '@types';
import { supabase } from '@config/supabase';
import { API_BASE_URL, API_HEADERS } from '@config/app';

const amounts = [50, 100, 200, 400, 550, 600, 900, 1000];

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { width } = useWindowDimensions();
  const numColumns = width > 800 ? 3 : width > 600 ? 2 : 1;
  const [search, setSearch] = useState('');
  const [allCampaigns, setAllCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<Campaign | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Modal State
  const [selectedAmount, setSelectedAmount] = useState(50);
  const [quantity, setQuantity] = useState(1);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Local filtering calculation instantly updates as you type
  const filteredCampaigns = allCampaigns.filter(item =>
    item.title?.toLowerCase().includes(search.toLowerCase())
  );

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/campaigns`, {
        headers: API_HEADERS,
      });
      const json = await response.json();
      if (json.success) {
        setAllCampaigns(json.data);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const syncCartWithServer = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/guest/cart`, {
        headers: API_HEADERS,
      });
      const json = await response.json();
      if (json.success) {
        setCartItems(json.data);
      }
    } catch (error) {
      console.error('Error syncing cart:', error);
    }
  };

  useEffect(() => {
    fetchCampaigns();
    syncCartWithServer();
  }, []);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Logout', 
        style: 'destructive', 
        onPress: async () => {
          setIsMenuOpen(false);
          const { error } = await supabase.auth.signOut();
          if (error) {
            Alert.alert('Logout Error', error.message);
          }
        }
      }
    ]);
  };

  const handleOpenDetails = (item: Campaign) => {
    setSelectedCard(item);
    setSelectedAmount(50);
    setQuantity(1);
  };

  const handleAddToCart = async () => {
    if (!selectedCard) return;

    const newItem: CartItem = {
      id: selectedCard.id,
      title: selectedCard.title,
      amount: selectedAmount,
      quantity: quantity,
      image: selectedCard.cover_image_key 
        ? { uri: `https://hycsbfugiboutvgbvueg.supabase.co/storage/v1/object/public/images/${selectedCard.cover_image_key}` }
        : { uri: 'https://via.placeholder.com/500x300.png?text=No+Image' },
    };

    try {
      // PERSIST: Call backend to add to cart
      const response = await fetch(`${API_BASE_URL}/users/guest/cart`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...API_HEADERS,
        },
        body: JSON.stringify({ item: newItem })
      });
      const json = await response.json();
      if (json.success) {
        setCartItems(json.data);
        setSelectedCard(null);
      }
    } catch (err) {
      Alert.alert('Cart Error', 'Failed to save item to cart.');
    }
  };

  const handlePayment = async () => {
    if (!selectedCard) return;
    await handleAddToCart(); // Save to cart first
    navigation.navigate('Cart');
  };

  const renderItem = ({ item }: { item: Campaign }) => {
    const imageUrl = item.cover_image_key 
      ? `https://hycsbfugiboutvgbvueg.supabase.co/storage/v1/object/public/images/${item.cover_image_key}` 
      : 'https://via.placeholder.com/500x300.png?text=No+Image';
    
    return (
      <TouchableOpacity
        style={[styles.card, { flex: 1, maxWidth: numColumns > 1 ? (width / numColumns) - 24 : '100%', marginHorizontal: numColumns > 1 ? 8 : 16 }]}
        onPress={() => handleOpenDetails(item)}
      >
        <Image source={{ uri: imageUrl }} style={styles.cardImage} />
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle}>{item.title || (item as any).name || 'Untitled Campaign'}</Text>
          <Text style={styles.cardDescription} numberOfLines={2}>{item.description}</Text>
          <Text style={{fontSize: 12, color: '#888', marginTop: 8}}>Goal: ₱{(Number(item.target_amount) || 0).toLocaleString()}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#8C4B4B" translucent />
      <SafeAreaView style={{ backgroundColor: '#8C4B4B' }} edges={['top', 'left', 'right']} />

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.logo}>H</Text>
          <Text style={styles.headerTitle}>Digital Donor</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.cartBtn}
            onPress={() => navigation.navigate('Cart')}
          >
            <Text style={styles.cartText}>Cart</Text>
            {cartItems.length > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.badgeText}>{cartItems.length}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsMenuOpen(true)}>
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading && allCampaigns.length === 0 ? (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator size="large" color="#8C4B4B" />
          <Text style={{marginTop: 10, color: '#666'}}>Loading campaigns...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredCampaigns}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          key={numColumns}
          numColumns={numColumns}
          columnWrapperStyle={numColumns > 1 ? styles.row : undefined}
          ListHeaderComponent={
            <View style={styles.content}>
              <Text style={styles.title}>Browse Donation Cards</Text>
              <Text style={styles.subtitle}>
                Support meaningful causes and make an impact in communities
              </Text>
              <View style={styles.searchBox}>
                <Text style={styles.searchIcon}>⌕</Text>
                <TextInput
                  placeholder="Search for donation cards"
                  placeholderTextColor="#8A8A8A"
                  value={search}
                  onChangeText={setSearch}
                  style={styles.searchInput}
                />
              </View>
              <Text style={styles.countText}>
                {filteredCampaigns.length} Cards found
              </Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      )}

      {/* Details Modal */}
      <Modal visible={!!selectedCard} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.detailsModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderText}>Campaign Details</Text>
              <TouchableOpacity onPress={() => setSelectedCard(null)}>
                <Text style={{ fontSize: 20 }}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView>
              <Image 
                source={{ uri: selectedCard?.cover_image_key 
                  ? `https://hycsbfugiboutvgbvueg.supabase.co/storage/v1/object/public/images/${selectedCard.cover_image_key}` 
                  : 'https://via.placeholder.com/500x300.png?text=No+Image' }} 
                style={styles.modalImage} 
              />
              <View style={styles.modalPadding}>
                <Text style={styles.modalTitle}>{selectedCard?.title}</Text>
                <Text style={styles.managerText}>
                  Manager: {selectedCard?.organizer_name || 'Verified Organizers'}
                </Text>
                <Text style={styles.modalDesc}>{selectedCard?.description}</Text>

                <Text style={styles.sectionTitle}>Select Amount:</Text>
                <View style={styles.amountGrid}>
                  {amounts.map(amt => (
                    <TouchableOpacity
                      key={amt}
                      style={[styles.amountBtn, selectedAmount === amt && styles.selectedAmountBtn]}
                      onPress={() => setSelectedAmount(amt)}
                    >
                      <Text style={[styles.amountBtnText, selectedAmount === amt && styles.selectedAmountBtnText]}>
                        ₱{amt}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.qtyContainer}>
                  <TouchableOpacity style={styles.addToCartBtn} onPress={handleAddToCart}>
                    <Text style={styles.addToCartText}>🛒 Add to cart</Text>
                  </TouchableOpacity>

                  <View style={styles.qtySelector}>
                    <TouchableOpacity onPress={() => setQuantity(Math.max(1, quantity - 1))}>
                      <Text style={styles.qtyBtnText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{quantity}</Text>
                    <TouchableOpacity onPress={() => setQuantity(quantity + 1)}>
                      <Text style={styles.qtyBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.totalBox}>
                  <Text style={styles.totalLabel}>Total Donation</Text>
                  <Text style={styles.totalValue}>₱{selectedAmount * quantity}</Text>
                </View>

                <TouchableOpacity style={styles.paymentBtn} onPress={handlePayment}>
                  <Text style={styles.paymentBtnText}>Order Now</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Side Menu */}
      <Modal visible={isMenuOpen} transparent animationType="fade">
        <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPress={() => setIsMenuOpen(false)}>
          <View style={styles.sideMenu}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuHeaderText}>Menu</Text>
              <TouchableOpacity onPress={() => setIsMenuOpen(false)}><Text>✕</Text></TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setIsMenuOpen(false); navigation.navigate('EditProfile'); }}>
              <Text style={styles.menuItemText}>👤 Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setIsMenuOpen(false); navigation.navigate('Cart'); }}>
              <Text style={styles.menuItemText}>🎁 My Donations</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setIsMenuOpen(false); Alert.alert('Wallet', 'Wallet feature coming soon!'); }}>
              <Text style={styles.menuItemText}>👛 Wallet</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setIsMenuOpen(false); Alert.alert('Settings', 'Settings feature coming soon!'); }}>
              <Text style={styles.menuItemText}>⚙️ Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setIsMenuOpen(false); Alert.alert('Help', 'Support center coming soon!'); }}>
              <Text style={styles.menuItemText}>❓ Help</Text>
            </TouchableOpacity>
            <View style={{ height: 1, backgroundColor: '#eee', marginVertical: 10 }} />
            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
              <Text style={[styles.menuItemText, { color: '#B94F4F' }]}>Logout</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F3F3' },
  header: {
    backgroundColor: '#8C4B4B',
    height: 70,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  logo: { color: '#fff', fontSize: 22, fontWeight: '800' as '800', marginRight: 10 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' as '700' },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  cartBtn: {
    backgroundColor: '#1A2E44',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartText: { color: '#3E76BB', fontWeight: '700' as '700', fontSize: 16 },
  cartBadge: {
    backgroundColor: 'red',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute' as 'absolute',
    top: -5,
    right: -5,
  },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' as 'bold' },
  menuIcon: { color: '#fff', fontSize: 30 },
  content: { padding: 16 },
  row: { justifyContent: 'space-between', paddingHorizontal: 8 },
  title: { fontSize: 24, fontWeight: '800' as '800', color: '#0C1B33', marginTop: 10, marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#394B63', marginBottom: 20, lineHeight: 20 },
  searchBox: {
    height: 50,
    borderWidth: 1,
    borderColor: '#D7D7D7',
    borderRadius: 12,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginBottom: 20,
  },
  searchIcon: { fontSize: 22, color: '#97A0B0', marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16, color: '#222' },
  countText: { fontSize: 14, color: '#394B63', marginBottom: 16 },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardImage: { width: '100%', height: 200 },
  cardBody: { padding: 16 },
  cardTitle: { fontSize: 18, fontWeight: '800' as '800', color: '#0C1B33', marginBottom: 8 },
  cardDescription: { fontSize: 14, color: '#394B63', lineHeight: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  detailsModal: { backgroundColor: '#fff', width: '90%', maxHeight: '90%', borderRadius: 20, overflow: 'hidden' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  modalHeaderText: { fontSize: 18, fontWeight: 'bold' as 'bold', color: '#333' },
  modalImage: { width: '100%', height: 200 },
  modalPadding: { padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold' as 'bold', color: '#0C1B33', marginBottom: 4 },
  managerText: { fontSize: 13, color: '#666', marginBottom: 12 },
  modalDesc: { fontSize: 14, color: '#444', lineHeight: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold' as 'bold', color: '#333', marginBottom: 12 },
  amountGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  amountBtn: { width: '23%', height: 44, borderWidth: 1, borderColor: '#eee', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  selectedAmountBtn: { backgroundColor: '#801A1A', borderColor: '#801A1A' },
  amountBtnText: { color: '#333', fontWeight: '600' as '600' },
  selectedAmountBtnText: { color: '#fff' },
  qtyContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  addToCartBtn: { flex: 1, height: 50, backgroundColor: '#F7E6E6', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  addToCartText: { color: '#8C4B4B', fontWeight: 'bold' as 'bold' },
  qtySelector: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#eee', borderRadius: 12, height: 50, paddingHorizontal: 12 },
  qtyBtnText: { fontSize: 20, fontWeight: 'bold' as 'bold', color: '#666' },
  qtyText: { marginHorizontal: 15, fontSize: 18, fontWeight: 'bold' as 'bold' },
  totalBox: { backgroundColor: '#F9F4F4', padding: 16, borderRadius: 12, marginBottom: 20 },
  totalLabel: { fontSize: 12, color: '#999', marginBottom: 4 },
  totalValue: { fontSize: 24, fontWeight: 'bold' as 'bold', color: '#801A1A' },
  paymentBtn: { backgroundColor: '#D88C8C', height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  paymentBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' as 'bold' },
  menuOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'flex-end' },
  sideMenu: { backgroundColor: '#fff', width: 260, minHeight: 450, borderTopLeftRadius: 20, borderBottomLeftRadius: 20, padding: 24, paddingBottom: 40 },
  menuHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  menuHeaderText: { fontSize: 20, fontWeight: 'bold' as 'bold' },
  menuItem: { paddingVertical: 15 },
  menuItemText: { fontSize: 18, color: '#333' },
});
