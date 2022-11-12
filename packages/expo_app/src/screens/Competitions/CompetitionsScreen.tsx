import { gql, useApolloClient, useQuery } from '@apollo/client';
import React, { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { Competition } from '../../../../server/generated/graphql'; // XXX
import { CompetitionList } from '../../components/CompetitionList';
import { CompetitionsScreenProps } from '../../navigation/types';

const style = StyleSheet.create({
  container: {
    flex: 1,
  },
});

const competitionListQuery = gql`
  query Competitions {
    competitions {
      id
      name
      startDate
      endDate
      country
    }
  }
`;

export default function CompetitionsScreen({
  navigation,
}: CompetitionsScreenProps) {
  const client = useApolloClient();
  const { data, loading } = useQuery(competitionListQuery);

  console.log(26, loading, data);

  if (loading) {
    return <Text>Fetching competitions...</Text>;
  }

  const navigateToComp = useCallback((competition: Competition) => {
    console.log(competition);
    navigation.navigate('RootCompetitions', {
      screen: 'Competition',
      params: competition,
    });
  }, []);

  const refreshCompetitionList = useCallback(async () => {
    await client.refetchQueries({
      include: ['Competitions'],
    });
  }, []);

  return (
    <View style={style.container}>
      {loading && <ActivityIndicator />}
      {data && (
        <CompetitionList
          competitions={(data?.competitions || []) as Competition[]}
          onSelect={navigateToComp}
          loading={loading}
          onRefresh={refreshCompetitionList}
        />
      )}
    </View>
  );
}
