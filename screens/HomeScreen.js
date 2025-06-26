import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  ActivityIndicator, FlatList, SafeAreaView, ScrollView
} from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { useFocusEffect } from '@react-navigation/native';

const API_KEY = 'HXO46Fw0iT4l7UJg1SjGzXa8ONfxfggHso8beiJu';

export default function HomeScreen({ navigation, route }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [eaten, setEaten] = useState(0);
  const [burned, setBurned] = useState(282);
  const [meals, setMeals] = useState([]);
  const calorieGoal = 2000;
  const left = Math.max(calorieGoal - eaten, 0);

  const [macros, setMacros] = useState([
    { type: 'Carbs', value: 0, goal: 250 },
    { type: 'Protein', value: 0, goal: 100 },
    { type: 'Fat', value: 0, goal: 67 },
  ]);

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

  const addToLog = (item) => {
    const getValue = (name) =>
      Math.round(item.foodNutrients?.find(n => n.nutrientName.includes(name))?.value || 0);

    const kcal = getValue('Energy');
    const carbs = getValue('Carbohydrate');
    const protein = getValue('Protein');
    const fat = getValue('Fat');

    setEaten(prev => prev + kcal);
    setMeals(prev => [...prev, {
      title: item.description,
      details: 'Added from search',
      calories: kcal,
      carbs,
      protein,
      fat,
    }]);

    setMacros(prev => [
      { ...prev[0], value: prev[0].value + carbs },
      { ...prev[1], value: prev[1].value + protein },
      { ...prev[2], value: prev[2].value + fat },
    ]);
  };

  useFocusEffect(
    useCallback(() => {
      if (route.params?.scannedFood) {
        const food = route.params.scannedFood;
        setEaten(prev => prev + food.calories);
        setMeals(prev => [...prev, food]);

        setMacros(prev => [
          { ...prev[0], value: prev[0].value + (food.carbs || 0) },
          { ...prev[1], value: prev[1].value + (food.protein || 0) },
          { ...prev[2], value: prev[2].value + (food.fat || 0) },
        ]);

        navigation.setParams({ scannedFood: null });
      }
    }, [route.params?.scannedFood])
  );

  useEffect(() => {
    const now = new Date();
    const nextMidnight = new Date();
    nextMidnight.setHours(24, 0, 0, 0);
    const msUntilMidnight = nextMidnight.getTime() - now.getTime();

    const timer = setTimeout(() => {
      setEaten(0);
      setMeals([]);
      setMacros([
        { type: 'Carbs', value: 0, goal: 250 },
        { type: 'Protein', value: 0, goal: 100 },
        { type: 'Fat', value: 0, goal: 67 },
      ]);
    }, msUntilMidnight);

    return () => clearTimeout(timer);
  }, [eaten, meals]);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.brand}>XCAL</Text>

      <View style={styles.progressSection}>
        <AnimatedCircularProgress
          size={180}
          width={15}
          fill={(eaten / calorieGoal) * 100}
          tintColor="#8B5CF6"
          backgroundColor="#E0E0E0"
          rotation={0}
          lineCap="round"
        >
          {() => (
            <View style={styles.progressContent}>
              <Text style={styles.progressMain}>{left}</Text>
              <Text style={styles.progressLabel}>kcal left</Text>
            </View>
          )}
        </AnimatedCircularProgress>

        <View style={styles.sideInfo}>
          <Text style={styles.sideLabel}>Eaten</Text>
          <Text style={styles.sideValue}>{eaten}</Text>
          <Text style={styles.sideLabel}>Burned</Text>
          <Text style={styles.sideValue}>{burned}</Text>
        </View>
      </View>

      <View style={styles.macrosContainer}>
        {macros.map((m, i) => (
          <View key={i} style={styles.macroItem}>
            <Text style={styles.macroType}>{m.type}</Text>
            <View style={styles.barBase}>
              <View style={[styles.barFill, { width: `${(m.value / m.goal) * 100}%` }]} />
            </View>
            <Text style={styles.macroLabel}>{m.value} / {m.goal} g</Text>
          </View>
        ))}
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.date}>
          Today, {new Date().toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric'
          })}
        </Text>

        <ScrollView style={styles.mealsContainer}>
          {meals.map((meal, index) => (
            <View key={index} style={styles.mealCard}>
              <Text style={styles.mealTitle}>{meal.title}</Text>
              <Text style={styles.mealDetails}>{meal.details}</Text>
              <Text style={styles.mealCalories}>{meal.calories} kcal</Text>
            </View>
          ))}
        </ScrollView>

        <Text style={styles.subtitle}>Search food:</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. banana, rice, chicken"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={searchFood}
          returnKeyType="search"
        />

        <TouchableOpacity style={styles.button} onPress={searchFood}>
          <Text style={styles.buttonText}>Search</Text>
        </TouchableOpacity>

        {loading ? (
          <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 20 }} />
        ) : results.length > 0 && (
          <FlatList
            data={results}
            keyExtractor={(item) => item.fdcId.toString()}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.food}>{item.description}</Text>
                <Text style={styles.nutrients}>
                  {item.foodNutrients
                    ?.filter(n => ['Energy', 'Protein', 'Fat', 'Carbohydrate'].includes(n.nutrientName))
                    .map(n => `${n.nutrientName}: ${Math.round(n.value)} ${n.unitName}`)
                    .join(' • ')}
                </Text>
                <TouchableOpacity style={styles.addButton} onPress={() => addToLog(item)}>
                  <Text style={styles.addText}>➕ Add to Log</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        )}

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Barcode')}>
          <Text style={styles.buttonText}>📷 Scan Barcode</Text>
        </TouchableOpacity>

        

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('AIScanner')}>
          <Text style={styles.buttonText}>🧠 AI Image Scan</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ShareGroup')}>
          <Text style={styles.buttonText}>🔗 Share Group Code</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('JoinGroup')}>
          <Text style={styles.buttonText}>➕ Join Group with Code</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#004225', // British Racing Green
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  brand: {
    fontSize: 32,
    fontWeight: '800',
    fontFamily: 'Orbitron_700Bold',
    color: '#4169E1', // Royal Blue
    alignSelf: 'center',
    marginBottom: 10,
  },
  progressSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginVertical: 25,
  },
  progressContent: {
    alignItems: 'center',
  },
  progressMain: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#F5F5DC', // Light beige for contrast
  },
  progressLabel: {
    fontSize: 16,
    fontFamily: 'Georgia',
    color: '#B5CBBB',
  },
  sideInfo: {
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  sideLabel: {
    fontSize: 15,
    color: '#B5CBBB',
    fontFamily: 'Times New Roman',
  },
  sideValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#F0F8FF',
    marginBottom: 8,
  },
  macrosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  macroItem: {
    flex: 1,
    marginHorizontal: 6,
  },
  macroType: {
    fontWeight: '700',
    marginBottom: 5,
    color: '#E6E6FA',
    fontFamily: 'Georgia',
  },
  barBase: {
    height: 10,
    backgroundColor: '#013220',
    borderRadius: 5,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#4169E1', // Royal Blue
  },
  macroLabel: {
    fontSize: 13,
    color: '#CCCCCC',
    marginTop: 4,
    fontFamily: 'Times New Roman',
  },
  date: {
    fontSize: 18,
    fontWeight: '700',
    color: '#DDEEDD',
    marginBottom: 12,
  },
  mealsContainer: {
    maxHeight: 600,
    marginBottom: 20,
  },
  mealCard: {
    backgroundColor: '#013220',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  mealTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#F0F8FF',
  },
  mealDetails: {
    fontSize: 14,
    color: '#A9A9A9',
    fontStyle: 'italic',
    marginVertical: 4,
  },
  mealCalories: {
    fontSize: 14,
    color: '#4169E1',
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F5F5DC',
    marginTop: 25,
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#4169E1',
    padding: 14,
    borderRadius: 10,
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    elevation: 3,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#00308F', // Deeper royal blue
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
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 4,
  },
  food: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 8,
    color: '#F5F5F5',
  },
  nutrients: {
    fontSize: 14,
    color: '#C0C0C0',
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

  // Extra styling for richness
  divider: {
    height: 1,
    backgroundColor: '#2E8B57',
    marginVertical: 10,
  },
  fadedText: {
    color: '#9BB7A7',
    fontStyle: 'italic',
    fontSize: 12,
  },
  cardShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  crown: {
    fontSize: 32,
    color: '#FFD700',
    alignSelf: 'center',
  },
  richHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F0F8FF',
    fontFamily: 'Orbitron_700Bold',
    textAlign: 'center',
    marginBottom: 20,
  },
});

