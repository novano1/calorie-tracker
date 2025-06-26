import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator,
  TouchableOpacity, ScrollView
} from 'react-native';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { useRoute, useNavigation } from '@react-navigation/native';

export default function GroupHomeScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { groupCode } = route.params || {};
  const db = getFirestore();

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const docRef = doc(db, 'groups', groupCode);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setMembers(docSnap.data().members || []);
        }
      } catch (err) {
        console.error('Error fetching group:', err);
      } finally {
        setLoading(false);
      }
    };

    if (groupCode) fetchGroup();
  }, [groupCode]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Group Dashboard</Text>

      {groupCode && (
        <Text style={styles.groupCode}>
          Group Code: <Text style={styles.codeHighlight}>{groupCode}</Text>
        </Text>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#F0F8FF" style={{ marginVertical: 30 }} />
      ) : (
        <>
          <Text style={styles.membersTitle}>Members:</Text>
          {members.map((m, i) => (
            <Text key={i} style={styles.member}>• {m}</Text>
          ))}
        </>
      )}

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ShareGroup')}>
        <Text style={styles.buttonText}>🔗 Share Group Code</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('JoinGroup')}>
        <Text style={styles.buttonText}>➕ Join Group</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#004225',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#F0F8FF',
    marginBottom: 20,
  },
  groupCode: {
    fontSize: 18,
    color: '#DDEEDD',
    marginBottom: 20,
  },
  codeHighlight: {
    fontWeight: 'bold',
    color: '#FFD700',
  },
  membersTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F0F8FF',
    marginBottom: 10,
  },
  member: {
    fontSize: 16,
    color: '#DDEEDD',
    marginBottom: 5,
  },
  button: {
    backgroundColor: '#00308F',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 25,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
