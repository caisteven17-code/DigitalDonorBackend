import React, { useEffect, useRef, useState } from 'react';
import { View, Image, ScrollView, Dimensions, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');

const images = [
  { uri: 'https://picsum.photos/id/10/800/400' },
  { uri: 'https://picsum.photos/id/20/800/400' },
  { uri: 'https://picsum.photos/id/30/800/400' },
  { uri: 'https://picsum.photos/id/40/800/400' },
];

export default function ImageCarousel() {
  const scrollRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % images.length;
      scrollRef.current?.scrollTo({ x: nextIndex * width, animated: true });
      setCurrentIndex(nextIndex);
    }, 3000);

    return () => clearInterval(interval);
  }, [currentIndex]);

  return (
    <View>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
      >
        {images.map((img, index) => (
          <Image
            key={index}
            source={img}
            style={styles.image}
            resizeMode="cover"
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    width,
    height: 220,
  },
});
