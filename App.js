

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';


import HomeScreen from './screens/HomeScreen';
import SearchScreen from './screens/SearchScreen';
import AIScannerScreen from './screens/AIScannerScreen';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import SleepTrackerScreen from './screens/SleepTrackerScreen';
import ShareGroupScreen from './screens/ShareGroupScreen';
import JoinGroupScreen from './screens/JoinGroupScreen';
import GroupHomeScreen from './screens/GroupHomeScreen';


const Stack = createNativeStackNavigator();


export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Search" component={SearchScreen} />
        <Stack.Screen name="AIScanner" component={AIScannerScreen} />
        <Stack.Screen name="SleepTracker" component={SleepTrackerScreen} />
        <Stack.Screen name="ShareGroup" component={ShareGroupScreen} />
        <Stack.Screen name="JoinGroup" component={JoinGroupScreen} />
        <Stack.Screen name="GroupHome" component={GroupHomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

