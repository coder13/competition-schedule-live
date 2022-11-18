import {
  DrawerNavigationProp,
  DrawerScreenProps,
} from '@react-navigation/drawer';
import {
  CompositeScreenProps,
  NavigatorScreenParams,
  ParamListBase,
  RouteProp,
} from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { Room } from '@wca/helpers';
import { Competition } from '../../../server/generated/graphql';

export type RootCompetitionsParams =
  NavigatorScreenParams<CompetitionsStackParamList>;

export interface DrawerParamList extends ParamListBase {
  RootCompetitions: RootCompetitionsParams;
}

export interface CompetitionsStackParamList extends ParamListBase {
  Competitions: undefined;
  Competition: Competition;
  Room: Room;
}

export type CompetitionsScreenProps = CompositeScreenProps<
  StackScreenProps<CompetitionsStackParamList, 'Competitions'>,
  DrawerScreenProps<DrawerParamList>
>;

export type CompetitionScreenProps = CompositeScreenProps<
  StackScreenProps<CompetitionsStackParamList, 'Competition'>,
  DrawerScreenProps<DrawerParamList>
>;

export type RoomScreenProps = CompositeScreenProps<
  StackScreenProps<CompetitionsStackParamList, 'Room'>,
  DrawerScreenProps<DrawerParamList>
>;

export interface DrawerHeaderProps {
  route: RouteProp<DrawerParamList>;
  navigation: DrawerNavigationProp<DrawerParamList>;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends DrawerParamList {}
  }
}
