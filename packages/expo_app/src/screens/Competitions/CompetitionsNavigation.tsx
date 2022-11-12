import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { CompetitionsStackParamList } from '../../navigation/types';
import CompetitionsScreen from './CompetitionsScreen';
import CompetitionScreen from './CompetitionScreen';
import RoomScreen from './RoomScreen';
import ImportCompetitionScreen from './ImportCompetitionScreen';

const Stack = createStackNavigator<CompetitionsStackParamList>();

export default function CompetitionsNavigation() {
  return (
    <Stack.Navigator
      initialRouteName="Competitions"
      screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Competitions" component={CompetitionsScreen} />
      <Stack.Screen name="Competition" component={CompetitionScreen} />
      <Stack.Screen name="Room" component={RoomScreen} />
      <Stack.Screen name="Import" component={ImportCompetitionScreen} />
    </Stack.Navigator>
  );
}
