import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { maybeCompleteAuthSession } from 'expo-web-browser';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
  DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { useAuth } from './hooks/useAuth';
import NavigationBar from './components/NavigationBar/NavigationBar';
import { Card, Title } from 'react-native-paper';
import CompetitionsNavigation from './screens/Competitions/CompetitionsNavigation';
import { DrawerParamList } from './navigation/types';

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
      <DrawerItem
        label="Toggle drawer"
        onPress={() => props.navigation.toggleDrawer()}
      />
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
        initialRouteName="RootCompetitions"
        screenOptions={{
          header: NavigationBar,
        }}
        drawerContent={(props) => <CustomDrawerContent {...props} />}>
        <Drawer.Screen
          name="RootCompetitions"
          component={CompetitionsNavigation}
        />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}
