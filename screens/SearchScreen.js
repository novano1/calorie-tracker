import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';

const API_KEY = 'HXO46Fw0iT4l7UJg1SjGzXa8ONfxfggHso8beiJu';

export default function SearchScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchFood = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.nal.usda.gov/fdc/v1/foods/search?query=${query}&api_key=${API_KEY}`
      );
      
      const data = await res.json();
      setResults(data.foods || []);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>🔍 Search Food</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. banana, rice, chicken"
        placeholderTextColor="#d0d0ff"
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={searchFood}
        returnKeyType="search"
      />
      <TouchableOpacity style={styles.button} onPress={searchFood}>
        <Text style={styles.buttonText}>Search</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color="#4169E1" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={results}
          keyExtractor={item => item.fdcId.toString()}
          renderItem={({ item }) => {
            const energy = item.foodNutrients?.find(n => n.nutrientName === 'Energy');
            const kcal = energy ? Math.round(energy.value) : 0;

            return (
              <View style={styles.card}>
                <Text style={styles.foodName}>{item.description}</Text>
                {item.foodNutrients?.length > 0 && (
                  <Text style={styles.nutrients}>
                    {item.foodNutrients
                      .filter(n =>
                        ['Energy', 'Protein', 'Total lipid (fat)', 'Carbohydrate, by difference'].includes(
                          n.nutrientName
                        )
                      )
                      .map(n => `${n.nutrientName}: ${Math.round(n.value)} ${n.unitName}`)
                      .join('  •  ')}
                  </Text>
                )}
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => {
                    navigation.navigate('Home', {
                      scannedFood: {
                        title: item.description,
                        details: 'Added from search',
                        calories: kcal,
                      },
                    });
                  }}
                >
                  <Text style={styles.addText}>➕ Add to Log</Text>
                </TouchableOpacity>
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#00000', // British Racing Green
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    fontFamily: 'Georgia',
    color: '#F5F5DC',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#4169E1', // Royal Blue
    padding: 14,
    borderRadius: 10,
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#00308F',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 2,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
    fontFamily: 'Georgia',
  },
  card: {
    backgroundColor: '#013220',
    borderRadius: 12,
    padding: 14,
    marginVertical: 8,
    elevation: 3,
  },
  foodName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#F0F8FF',
    marginBottom: 6,
  },
  nutrients: {
    fontSize: 14,
    color: '#CCCCCC',
    fontFamily: 'Times New Roman',
  },
  addButton: {
    marginTop: 12,
    backgroundColor: '#4169E1',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  addText: {
    color: '#fff',
    fontWeight: '700',
  },
});
