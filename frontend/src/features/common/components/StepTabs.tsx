import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface StepTabsProps {
  currentTab: number;
  setCurrentTab: (tab: number) => void;
}

const StepTabs: React.FC<StepTabsProps> = ({ currentTab, setCurrentTab }) => {
  return (
    <View style={styles.row}>
      <TouchableOpacity style={styles.tab} onPress={() => setCurrentTab(1)}>
        <Text style={[styles.number, currentTab === 1 && styles.activeText]}>
          1
        </Text>
        <Text style={[styles.label, currentTab === 1 && styles.activeText]}>
          Front ID
        </Text>
        <View style={[styles.line, currentTab === 1 && styles.activeLine]} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.tab} onPress={() => setCurrentTab(2)}>
        <Text style={[styles.number, currentTab === 2 && styles.activeText]}>
          2
        </Text>
        <Text style={[styles.label, currentTab === 2 && styles.activeText]}>
          Back ID
        </Text>
        <View style={[styles.line, currentTab === 2 && styles.activeLine]} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
  },
  number: {
    fontSize: 18,
    color: '#999',
  },
  label: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  activeText: {
    color: '#B94F4F',
    fontWeight: '700' as '700',
  },
  line: {
    marginTop: 8,
    height: 1,
    width: '80%',
    backgroundColor: '#D0D0D0',
  },
  activeLine: {
    height: 2,
    backgroundColor: '#B94F4F',
  },
});

export default StepTabs;
