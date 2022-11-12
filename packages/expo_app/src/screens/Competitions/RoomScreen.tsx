import React from 'react';
import { StyleSheet, View } from 'react-native';
import { RoomScreenProps } from '../../navigation/types';

const style = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default function RoomScreen({ route }: RoomScreenProps) {
  return <View style={style.container}></View>;
}
