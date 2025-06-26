import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert
} from 'react-native';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';

const generateGroupCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
};

export default function CreateGroupScreen() {
  const [creating, setCreating] = useState(false);
  const navigation = useNavigation();
  const db = getFirestore();
  const auth = getAuth();

  const handleCreateGroup = async () => {
    setCreating(true);
    const groupCode = generateGroupCode();
    const uid = auth.currentUser.uid;

    try {
      await setDoc(doc(db, 'groups', groupCode), {
        createdBy: uid,
        members: [uid],
        createdAt: new Date().toISOString()
      });

      Alert.alert('Group Created', `Code: ${groupCode}`);
      navigation.navigate('GroupHome', { groupCode });
    } catch (err) {
      console.error('Error creating group:', err);
      Alert.alert('Failed to create group');
    } finally {
      setCreating(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create a New Group</Text>
      <TouchableOpacity style={styles.button} onPress={handleCreateGroup} disabled={creating}>
        <Text style={styles.buttonText}>{creating ? 'Creating...' : 'Generate Group Code'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.back}>← Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#004225',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#F0F8FF',
    marginBottom: 30,
    fontFamily: 'Georgia',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#00308F',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 10,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  back: {
    marginTop: 20,
    color: '#A9A9A9',
    fontSize: 14,
    fontStyle: 'italic',
  },
});
