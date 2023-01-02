import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { maybeCompleteAuthSession } from 'expo-web-browser';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { useAuth } from './hooks/useAuth';
import NavigationBar from './components/NavigationBar/NavigationBar';
import { Card, Title } from 'react-native-paper';
import CompetitionsNavigation from './screens/Competitions/CompetitionsNavigation';
import { DrawerParamList } from './navigation/types';
import ImportCompetitionScreen from './screens/Competitions/ImportCompetitionScreen';

maybeCompleteAuthSession();

const Drawer = createDrawerNavigator<DrawerParamList>();

function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { user } = useAuth();

  return (
    <DrawerContentScrollView {...props}>
      {user && (
        <Card>
          <Card.Cover source={{ uri: user.avatar?.url }} style={{}} />
          <Card.Content>
            <Title>{user.name}</Title>
          </Card.Content>
        </Card>
      )}
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
}

export default function App() {
  const { user } = useAuth();

  useEffect(() => {
    console.log(18, user);
  }, [user]);

  return (
    <NavigationContainer>
      <Drawer.Navigator
        initialRouteName="Competitions"
        screenOptions={{
          header: NavigationBar,
        }}
        drawerContent={(props) => <CustomDrawerContent {...props} />}>
        <Drawer.Screen name="Competitions" component={CompetitionsNavigation} />
        <Drawer.Screen
          name="ImportCompetition"
          component={ImportCompetitionScreen}
        />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}
