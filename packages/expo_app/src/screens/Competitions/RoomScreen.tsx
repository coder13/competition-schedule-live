import { gql, useMutation, useQuery } from '@apollo/client';
import React, { useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { Button, List, Text } from 'react-native-paper';
import { Activity } from '@wca/helpers';
import { Activity as GqlActivity } from '../../../../server/generated/graphql';
import { RoomScreenProps } from '../../navigation/types';
import { useWCIF } from '../../providers/WCIFProvider';

const style = StyleSheet.create({
  container: {
    flex: 1,
  },
});

const ActivitiesQuery = gql`
  query Activities($competitionId: String!) {
    activities(competitionId: $competitionId) {
      activityId
      startTime
      endTime
    }
  }
`;

const StartActivityMutation = gql`
  mutation StartActivity($competitionId: String!, $activityId: Int!) {
    startActivity(competitionId: $competitionId, activityId: $activityId) {
      activityId
      startTime
      endTime
    }
  }
`;

const StopActivityMutation = gql`
  mutation StopActivity($competitionId: String!, $activityId: Int!) {
    stopActivity(competitionId: $competitionId, activityId: $activityId) {
      activityId
      startTime
      endTime
    }
  }
`;

export default function RoomScreen({ route }: RoomScreenProps) {
  const { wcif } = useWCIF();
  const room = route.params;
  const { data: activities } = useQuery<GqlActivity[]>(ActivitiesQuery);

  const [_startActivity] = useMutation<GqlActivity>(StartActivityMutation, {
    refetchQueries: [ActivitiesQuery],
  });

  const [_stopActivity] = useMutation<GqlActivity>(StopActivityMutation, {
    refetchQueries: [ActivitiesQuery],
  });

  const startActivity = (activityId: number) => {
    if (!wcif?.id) {
      return;
    }

    void _startActivity({
      variables: {
        competitionId: wcif.id,
        activityId,
      },
    });
  };

  const stopActivity = (activityId: number) => {
    if (!wcif?.id) {
      return;
    }

    void _stopActivity({
      variables: {
        competitionId: wcif.id,
        activityId,
      },
    });
  };

  // const childActivitiesOrSelf = (a: Activity): Activity | Activity[] =>
  //   a.childActivities?.map(childActivitiesOrSelf)?.flat() ?? a;
  const _allActivities = room.activities
    .map((a) => a.childActivities ?? a)
    .flat();

  const activityById = useCallback(
    ({ activityId }: GqlActivity) =>
      _allActivities.find((b) => b.id === activityId),
    [_allActivities]
  );

  console.log(_allActivities);

  const sortedRoomActiviites = useMemo(() => {
    return _allActivities.sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
  }, [activities]);

  const currentActivities = useMemo(() => {
    const ongoingActivities = activities
      ?.filter((activity) => !activity.endTime)
      .map(activityById)
      .filter(Boolean) as Activity[];
    return ongoingActivities ?? [];
  }, [activities, activityById]);

  // const nextActivity = useMemo(() => {
  //   if (currentActivities.length === 0) {
  //     return sortedRoomActiviites[0];
  //   }

  //   return null;
  // }, [activities, activityById]);

  const upcomingActivities = useMemo(() => {
    return sortedRoomActiviites.filter(
      (a) =>
        !currentActivities.length ||
        currentActivities.some(
          (c) =>
            new Date(c.startTime).getTime() >= new Date(a.startTime).getTime()
        )
    );
  }, [sortedRoomActiviites, currentActivities]);

  console.log({ upcomingActivities });

  return (
    <View style={style.container}>
      <Text>Current Activity: </Text>
      <Text>{currentActivities[0]?.name}</Text>

      <List.Section>
        <List.Subheader>Upcoming Activiites: </List.Subheader>
        <FlatList
          data={upcomingActivities.slice(0, 5)}
          renderItem={({ item }) => (
            <List.Item
              title={item.name}
              description={new Date(item.startTime).toLocaleTimeString()}
            />
          )}
        />
      </List.Section>
      {currentActivities.length === 0 ? (
        <Button
          onPress={() => {
            console.log('start');
            startActivity(upcomingActivities[0].id);
          }}>
          Start
        </Button>
      ) : (
        <>
          <Button>Previous Activity</Button>
          <Button onPress={() => stopActivity(currentActivities[0].id)}>
            Stop Current Activity
          </Button>
          <Button onPress={() => startActivity(upcomingActivities[0].id)}>
            Advance Next Activity
          </Button>
        </>
      )}
    </View>
  );
}
