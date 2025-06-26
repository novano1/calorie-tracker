import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import uuid from 'react-native-uuid';

export default function ShareGroupScreen() {
  const navigation = useNavigation();
  const db = getFirestore();
  const auth = getAuth();

  const handleCreateGroup = async () => {
    const code = uuid.v4().slice(0, 6); // Short 6-character code
    const uid = auth.currentUser.uid;

    try {
      await setDoc(doc(db, 'groups', code), {
        code,
        members: [uid],
      });

      Alert.alert('Group created!', `Share this code: ${code}`);
      navigation.navigate('GroupHome', { groupCode: code });
    } catch (error) {
      console.error('Error creating group:', error);
      Alert.alert('Failed to create group');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Create & Share Group</Text>
      <TouchableOpacity style={styles.button} onPress={handleCreateGroup}>
        <Text style={styles.buttonText}>Generate Share Code</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.back}>← Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#004225', padding: 20,
  },
  header: {
    fontSize: 26, fontWeight: 'bold', color: '#F0F8FF', marginBottom: 20,
  },
  button: {
    backgroundColor: '#00308F', paddingVertical: 12, paddingHorizontal: 25,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff', fontWeight: 'bold', fontSize: 16,
  },
  back: {
    marginTop: 20, color: '#A9A9A9', fontSize: 14, fontStyle: 'italic',
  },
});
