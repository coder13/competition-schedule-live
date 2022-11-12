import { DrawerHeaderProps } from '@react-navigation/drawer';
import { RouteProp } from '@react-navigation/native';
import React from 'react';
import { Appbar } from 'react-native-paper';
import { Competition } from '../../../../server/generated/graphql';

export default function NavigationBar({
  route,
  navigation,
}: DrawerHeaderProps) {
  console.log(6, route);
  const title =
    route.name === 'RootCompetitions' &&
    (route as RouteProp<{ params: { screen: string } }>).params?.screen ===
      'Competition'
      ? (route.params as RouteProp<{ params: Competition }>)?.params?.name
      : 'Competition Schedule Live';
  return (
    <Appbar.Header>
      <Appbar.Action icon="menu" onPress={() => navigation.toggleDrawer()} />
      <Appbar.Content title={title} />
    </Appbar.Header>
  );
}
