import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, StyleSheet } from 'react-native';

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>Components Demo</Text>
        <Text style={styles.subtitle}>React Native building blocks</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Button</Text>
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => setCount(count + 1)}
        >
          <Text style={styles.buttonText}>Clicked {count} times</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Image</Text>
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imageText}>🖼️</Text>
          <Text style={styles.caption}>Image component</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Styled Views</Text>
        <View style={styles.colorBoxes}>
          <View style={[styles.box, { backgroundColor: '#FF6B6B' }]} />
          <View style={[styles.box, { backgroundColor: '#4ECDC4' }]} />
          <View style={[styles.box, { backgroundColor: '#45B7D1' }]} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  heading: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  imagePlaceholder: {
    backgroundColor: '#eee',
    padding: 40,
    borderRadius: 8,
    alignItems: 'center',
  },
  imageText: {
    fontSize: 48,
  },
  caption: {
    marginTop: 8,
    color: '#666',
  },
  colorBoxes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  box: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
});
