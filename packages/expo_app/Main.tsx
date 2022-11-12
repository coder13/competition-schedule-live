import React, { useEffect, useState } from 'react';
import 'react-native-gesture-handler';
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persistCache } from 'apollo3-cache-persist';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider as PaperProvider, Text } from 'react-native-paper';
import App from './src/App';
import AuthProvider from './src/hooks/useAuth';
import WCIFProvider from './src/providers/WCIFProvider';

const cache = new InMemoryCache();

// Initialize Apollo Client
const client = new ApolloClient({
  uri: 'http://10.0.0.234:8080/graphql',
  cache,
});

const queryClient = new QueryClient();

export default function Main() {
  const [loadingCache, setLoadingCache] = useState(true);

  const setupCache = async () => {
    await persistCache({
      cache,
      storage: AsyncStorage,
    });
    setLoadingCache(false);
  };

  useEffect(() => {
    // async function loadFonts() {
    //   await loadAsync({
    //     'material-community': require('./assets/fonts/MaterialCommunityIcons.ttf'),
    //   });
    // }
    // void loadFonts();

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    setupCache();
  }, []);

  if (loadingCache) {
    return <Text>'Loading...'</Text>;
  }

  return (
    <ApolloProvider client={client}>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <PaperProvider>
            <WCIFProvider>
              <App />
            </WCIFProvider>
          </PaperProvider>
        </QueryClientProvider>
      </AuthProvider>
    </ApolloProvider>
  );
}
