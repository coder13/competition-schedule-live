import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

const style = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default function SettingsScreen() {
  return (
    <View style={style.container}>
      <Text>Settings Screen</Text>
    </View>
  );
}
