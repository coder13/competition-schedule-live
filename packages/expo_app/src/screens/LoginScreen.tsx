import React from 'react';
import { makeRedirectUri, startAsync } from 'expo-auth-session';
import { StyleSheet, View } from 'react-native';
import { Button } from 'react-native-paper';
import { useAuth } from '../hooks/useAuth';

const style = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const authServer = 'http://10.0.0.234:8080';
const authUrl = `${authServer}/auth/wca`;
const authCallbackUrl = `${authServer}/auth/wca/callback`;

export default function LoginScreen() {
  const { setToken } = useAuth();

  const login = async () => {
    const redirectUri = makeRedirectUri({
      scheme: 'live-competition-schedule-tracker',
      path: 'redirect',
      useProxy: true, // Needs to be true
    });

    const results = await startAsync({
      authUrl: `${authUrl}?redirect_uri=${encodeURIComponent(redirectUri)}`,
    });

    if (results.type !== 'success') {
      console.error('Something bad happened during login');
      console.error(results);
      return;
    }

    const {
      params: { code },
    } = results;

    const query = new URLSearchParams({
      code,
      redirect_uri: redirectUri,
    });

    const jwtRes = await fetch(authCallbackUrl + `?${query.toString()}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!jwtRes.ok) {
      console.error(await jwtRes.json());
      return;
    }

    const { jwt } = await jwtRes.json();
    setToken(jwt);
  };

  return (
    <View style={style.container}>
      <Button onPress={login}>Login</Button>
    </View>
  );
}
