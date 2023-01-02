import { DrawerHeaderProps } from '@react-navigation/drawer';
import { RouteProp } from '@react-navigation/native';
import React, { useMemo } from 'react';
import { Appbar } from 'react-native-paper';
import { Room } from '@wca/helpers';
import { Competition } from '../../../../server/generated/graphql';
// import { useWCIF } from '../../providers/WCIFProvider';

const APP_NAME = 'Competition Schedule Live';

export default function NavigationBar({
  route,
  navigation,
}: DrawerHeaderProps) {
  // const { wcif } = useWCIF();

  const title = useMemo(() => {
    console.log(17, route);
    if (route.name !== 'Competitions') {
      return APP_NAME;
    }

    switch (
      (route as RouteProp<{ params: { screen: string } }>).params?.screen
    ) {
      case 'Competition':
        return (route.params as RouteProp<{ params: Competition }>)?.params
          ?.name;
      case 'Room':
        console.log(30);
        return (route.params as RouteProp<{ params: Room }>)?.params?.name;
      default:
        return APP_NAME;
    }
  }, [route]);

  return (
    <Appbar.Header>
      <Appbar.Action icon="menu" onPress={() => navigation.toggleDrawer()} />
      <Appbar.Content title={title} />
    </Appbar.Header>
  );
}
