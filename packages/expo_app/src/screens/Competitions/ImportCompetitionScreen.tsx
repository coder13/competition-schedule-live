import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

const style = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default function ImportCompetitionScreen() {
  return (
    <View style={style.container}>
      <Text>Hi</Text>
    </View>
  );
}
