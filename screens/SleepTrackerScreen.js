import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions, ScrollView } from 'react-native';
import { Audio } from 'expo-av';
import { LineChart } from 'react-native-chart-kit';

export default function SleepTrackerScreen() {
  const [recording, setRecording] = useState(null);
  const [soundLevels, setSoundLevels] = useState([]);
  const [chartData, setChartData] = useState([]);
  const recordingRef = useRef(null);

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Microphone access is needed to track sleep.');
        return;
      }

      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });

      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      await rec.startAsync();
      recordingRef.current = rec;
      setRecording(rec);

      const interval = setInterval(async () => {
        const status = await rec.getStatusAsync();
        if (status.metering) {
          const decibels = Math.floor(status.metering);
          setSoundLevels(prev => [...prev.slice(-59), decibels]);
        }
      }, 1000); // every second

      rec._interval = interval;
    } catch (err) {
      console.error('Recording error:', err);
      Alert.alert('Error starting recording');
    }
  };

  const stopRecording = async () => {
    try {
      const rec = recordingRef.current;
      if (rec) {
        clearInterval(rec._interval);
        await rec.stopAndUnloadAsync();
        setRecording(null);

        // Simulate sleep analysis
        const fakeAnalysis = soundLevels.map((val) => {
          if (val < -40) return 1; // Deep sleep
          if (val < -20) return 2; // Light sleep
          return 3; // Awake
        });

        setChartData(fakeAnalysis);
      }
    } catch (err) {
      console.error('Stop recording error:', err);
      Alert.alert('Error stopping recording');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Sleep Quality Tracker</Text>

      <TouchableOpacity style={styles.button} onPress={recording ? stopRecording : startRecording}>
        <Text style={styles.buttonText}>
          {recording ? 'Stop Sleep Tracking' : 'Start Sleep Tracking'}
        </Text>
      </TouchableOpacity>

      {chartData.length > 0 && (
        <View>
          <Text style={styles.chartLabel}>Sleep Cycle:</Text>
          <LineChart
            data={{
              labels: Array.from({ length: chartData.length }, (_, i) => `${i}h`),
              datasets: [{ data: chartData }],
            }}
            width={Dimensions.get('window').width - 30}
            height={220}
            yAxisLabel=""
            yAxisSuffix=""
            yLabelsOffset={15}
            chartConfig={{
              backgroundColor: '#00308F',
              backgroundGradientFrom: '#004225',
              backgroundGradientTo: '#004225',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: () => '#DDEEDD',
            }}
            bezier
            style={{ marginVertical: 20, borderRadius: 16 }}
          />
          <Text style={styles.legend}>
            1 = Deep Sleep   2 = Light Sleep   3 = Awake
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#004225',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F0F8FF',
    marginBottom: 30,
    fontFamily: 'Georgia',
  },
  button: {
    backgroundColor: '#00308F',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 10,
    marginBottom: 30,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Georgia',
  },
  chartLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F5F5DC',
    marginBottom: 10,
  },
  legend: {
    fontSize: 14,
    color: '#C0C0C0',
    marginTop: -10,
    marginBottom: 40,
    fontStyle: 'italic',
  },
});
