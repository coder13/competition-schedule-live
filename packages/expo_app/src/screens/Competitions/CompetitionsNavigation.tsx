import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { CompetitionsStackParamList } from '../../navigation/types';
import CompetitionsScreen from './CompetitionsScreen';
import CompetitionScreen from './CompetitionScreen';
import RoomScreen from './RoomScreen';

const Stack = createStackNavigator<CompetitionsStackParamList>();

export default function CompetitionsNavigation() {
  return (
    <Stack.Navigator
      initialRouteName="CompetitionList"
      screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CompetitionList" component={CompetitionsScreen} />
      <Stack.Screen name="Competition" component={CompetitionScreen} />
      <Stack.Screen name="Room" component={RoomScreen} />
    </Stack.Navigator>
  );
}
