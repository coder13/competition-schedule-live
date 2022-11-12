import React, { useEffect } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { ActivityIndicator, Avatar, List } from 'react-native-paper';
import { CompetitionScreenProps } from '../../navigation/types';
import { ScrollView } from 'react-native-gesture-handler';
import { useWCIF } from '../../providers/WCIFProvider';

const style = StyleSheet.create({
  container: {
    flex: 1,
  },
});

// const query = gql`
//   query Competition($competitionId: String!) {
//     competition(competitionId: $competitionId) {
//       id
//       name
//       startDate
//       endDate
//       country
//       activities {
//         activityId
//         startTime
//         endTime
//       }
//     }
//   }
// `;

export default function CompetitionScreen({ route }: CompetitionScreenProps) {
  const { wcif, setCompetitionId, loading } = useWCIF();

  const competition = route.params;

  useEffect(() => {
    setCompetitionId(competition.id);
  });

  // const { data, loading } = useQuery<{ competitions: Competition[] }>(query, {
  //   variables: {
  //     competitionId: route.params.id,
  //   },
  // });

  // console.log(15, route);
  // console.log(42, loading, data);
  // console.log(57, wcif);

  console.log(
    60,
    wcif?.schedule.venues.map((venue) => venue.rooms).flat().length
  );

  return (
    <ScrollView style={style.container}>
      {loading && <ActivityIndicator />}
      {/* <NestedListScrollView
        data={wcif?.schedule.venues || []}
        getChildrenName={() => 'rooms'}
        renderNode={(node, level) => {
          console.log('71', level, node.name);
          if (level === 2) {
            return <List.Item title={node.name} />;
          }
          if (level === 1) {
            <List.Subheader>{node.name}</List.Subheader>;
          }

          return <List.Item title={node.name} description={node.timezone} />;
        }}
        keepOpenedState={true}
      /> */}
      {wcif?.schedule?.venues.map((venue) => (
        <List.Section>
          <List.Subheader>{venue.name || ''}</List.Subheader>
          <FlatList
            data={venue.rooms}
            renderItem={({ item }) => (
              <List.Item
                title={item.name}
                description={`Current Activity: none`}
                left={() => (
                  <List.Icon
                    style={{
                      padding: 0,
                      marginLeft: 0,
                      marginRight: 0,
                    }}
                    icon={() => (
                      <Avatar.Text
                        size={24}
                        label={''}
                        color={item.color}
                        style={{
                          backgroundColor: item.color,
                        }}
                      />
                    )}
                  />
                )}
              />
            )}
            keyExtractor={(item) => item.id.toString()}
          />
        </List.Section>
      ))}
    </ScrollView>
  );
}
