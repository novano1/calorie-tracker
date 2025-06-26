import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getFirestore, doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export default function JoinGroupScreen() {
  const [code, setCode] = useState('');
  const navigation = useNavigation();
  const db = getFirestore();
  const auth = getAuth();

  const handleJoin = async () => {
    if (!code.trim()) {
      Alert.alert('Enter a group code');
      return;
    }

    try {
      const groupRef = doc(db, 'groups', code);
      const groupSnap = await getDoc(groupRef);

      if (!groupSnap.exists()) {
        Alert.alert('Group not found');
        return;
      }

      const uid = auth.currentUser.uid;
      await updateDoc(groupRef, {
        members: arrayUnion(uid),
      });

      Alert.alert('Joined successfully!');
      navigation.navigate('GroupHome', { groupCode: code });
    } catch (error) {
      console.error('Join error:', error);
      Alert.alert('Failed to join group');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Join Group</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter code"
        value={code}
        onChangeText={setCode}
      />
      <TouchableOpacity style={styles.button} onPress={handleJoin}>
        <Text style={styles.buttonText}>Join</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.back}>← Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#004225',
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20,
  },
  header: {
    fontSize: 28, fontWeight: 'bold', color: '#F0F8FF', marginBottom: 20,
  },
  input: {
    width: '100%', backgroundColor: '#fff', borderRadius: 8,
    padding: 15, marginBottom: 20, fontSize: 16,
  },
  button: {
    backgroundColor: '#00308F', paddingVertical: 12,
    paddingHorizontal: 25, borderRadius: 10,
  },
  buttonText: {
    color: '#fff', fontWeight: 'bold', fontSize: 16,
  },
  back: {
    marginTop: 20, color: '#A9A9A9', fontSize: 14, fontStyle: 'italic',
  },
});
