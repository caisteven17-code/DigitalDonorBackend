import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Campaign } from '@types';

interface DonationCardProps {
  campaign: Campaign;
  onPress: () => void;
}

const DonationCard: React.FC<DonationCardProps> = ({ campaign, onPress }) => {
  const { title, cover_image_key, target_amount, collected_amount } = campaign;
  // Ensure we don't divide by zero and cap progress at 100%
  const progress = Math.min((collected_amount / (target_amount || 1)) * 100, 100);

  const imageUrl = cover_image_key && cover_image_key.startsWith('http') 
    ? cover_image_key 
    : (cover_image_key 
        ? `https://hycsbfugiboutvgbvueg.supabase.co/storage/v1/object/public/images/${cover_image_key}` 
        : 'https://via.placeholder.com/500x300.png?text=No+Image');

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image 
        source={{ uri: imageUrl }} 
        style={styles.image} 
      />
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${progress}%` }]} />
        </View>
        <View style={styles.stats}>
          <Text style={styles.raised}>₱{Number(collected_amount || 0).toLocaleString()} raised</Text>
          <Text style={styles.goal}>of ₱{Number(target_amount || 0).toLocaleString()}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  image: {
    width: '100%',
    height: 150,
    backgroundColor: '#E0E0E0',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold' as 'bold',
    color: '#333',
    marginBottom: 4,
  },
  progressContainer: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  stats: {
    flexDirection: 'row' as 'row',
    justifyContent: 'space-between' as 'space-between',
  },
  raised: {
    fontSize: 12,
    fontWeight: 'bold' as 'bold',
    color: '#4CAF50',
  },
  goal: {
    fontSize: 12,
    color: '#888',
  },
});

export default DonationCard;
