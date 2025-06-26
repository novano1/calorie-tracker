import React, { useState } from 'react';
import {
  View, Text, Image, ActivityIndicator,
  StyleSheet, Alert, TouchableOpacity, TextInput, Button
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';

const HF_API_KEY = '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';
const USDA_API_KEY = 'HXO46Fw0iT4l7UJg1SjGzXa8ONfxfggHso8beiJu';

export default function AIScannerScreen() {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const navigation = useNavigation();

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Camera access is needed to scan food.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const picked = result.assets[0];
      setImage(picked.uri);
      classifyImage(picked.base64);
    } else {
      Alert.alert('No image selected');
    }
  };

  const classifyImage = async (base64) => {
    setLoading(true);
    setResult('');
    setInputQuery('');
    try {
      const response = await fetch(
        'https://api-inference.huggingface.co/models/nateraw/food-101',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${HF_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ inputs: `data:image/jpeg;base64,${base64}` }),
        }
      );

      const data = await response.json();
      const label = data?.[0]?.label;

      if (label) {
        setResult(label);
        setInputQuery(label);
      } else {
        setResult('Could not detect food.');
      }
    } catch (err) {
      console.error('Error scanning image:', err);
      setResult('Error scanning food.');
    } finally {
      setLoading(false);
    }
  };

  const fetchFromUSDA = async () => {
    if (!inputQuery.trim()) {
      Alert.alert('Enter a food name to search');
      return;
    }

    try {
      const res = await fetch(
        `https://api.nal.usda.gov/fdc/v1/foods/search?query=${inputQuery}&api_key=${USDA_API_KEY}`
      );
      const data = await res.json();
      const food = data.foods?.[0];

      if (food) {
        const getValue = (name) =>
          Math.round(
            food.foodNutrients?.find((n) =>
              n.nutrientName.toLowerCase().includes(name.toLowerCase())
            )?.value || 0
          );

        const foodLog = {
          title: food.description,
          details: 'Added via AI Scan',
          calories: getValue('Energy'),
          protein: getValue('Protein'),
          fat: getValue('Fat'),
          carbs: getValue('Carbohydrate'),
        };

        navigation.navigate('Home', { scannedFood: foodLog });
      } else {
        Alert.alert('No food found in USDA database');
      }
    } catch (err) {
      console.error('USDA fetch error:', err);
      Alert.alert('Error fetching USDA data');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>📸 AI Food Scanner</Text>
      <Button title="Select Food Image" onPress={pickImage} />
      {image && <Image source={{ uri: image }} style={styles.preview} />}
      {loading ? (
        <ActivityIndicator size="large" color="#4F46E5" />
      ) : (
        result && <Text style={styles.result}>🍽️ {result}</Text>
      )}

      <TextInput
        placeholder="Edit or confirm food name"
        style={styles.input}
        value={inputQuery}
        onChangeText={setInputQuery}
      />

      <TouchableOpacity style={styles.usdaButton} onPress={fetchFromUSDA}>
        <Text style={styles.usdaButtonText}>Get Nutrition Info</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, padding: 20, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#004225'
  },
  title: {
    fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#F0F8FF'
  },
  preview: {
    width: 250, height: 250, marginTop: 20, borderRadius: 12
  },
  result: {
    marginTop: 20, fontSize: 18, fontWeight: '600', color: '#F0F8FF'
  },
  input: {
    backgroundColor: '#fff', padding: 12, marginTop: 20, width: '100%',
    borderRadius: 8, fontSize: 16
  },
  usdaButton: {
    marginTop: 16,
    backgroundColor: '#00308F',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8
  },
  usdaButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  },
  backButton: {
    position: 'absolute', top: 40, left: 20,
    backgroundColor: '#00308F', paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 8
  },
  backButtonText: {
    color: 'white', fontWeight: 'bold'
  }
});
