import React from 'react';
import { RefreshControl } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { List, Text } from 'react-native-paper';
import { Competition } from '../../../../server/generated/graphql';
import flags from '../Flag/flags.json';

interface CompetitionListProps {
  competitions: Competition[];
  onSelect: (competition: Competition) => void;
  loading: boolean;
  onRefresh: () => void;
}

export const CompetitionList = ({
  competitions,
  onSelect,
  loading,
  onRefresh,
}: CompetitionListProps) => {
  return (
    <FlatList
      data={competitions}
      renderItem={({ item }) => (
        <List.Item
          title={item.name}
          description={item.startDate}
          left={() => (
            <Text style={{ fontSize: 24, textAlignVertical: 'center' }}>
              {flags[item.country as keyof typeof flags].emoji}
            </Text>
          )}
          onPress={() => onSelect(item)}
        />
      )}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={onRefresh} />
      }
    />
  );
};
