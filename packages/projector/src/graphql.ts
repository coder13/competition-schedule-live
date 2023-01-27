import { gql } from '@apollo/client';

export const GetCompetitionsQuery = gql`
  query GetCompetitions {
    competitions {
      id
      name
      startDate
      endDate
      country
    }
  }
`;

export const ImportCompetitionMutation = gql`
  mutation ImportCompetition($competitionId: String!) {
    importCompetition(competitionId: $competitionId) {
      id
      name
    }
  }
`;

export const ActivitiesQuery = gql`
  query Activities($competitionId: String!, $roomId: Int) {
    activities(competitionId: $competitionId, roomId: $roomId) {
      activityId
      startTime
      endTime
    }
  }
`;

export const StartActivityMutation = gql`
  mutation StartActivity($competitionId: String!, $activityId: Int!) {
    startActivity(competitionId: $competitionId, activityId: $activityId) {
      activityId
      startTime
      endTime
    }
  }
`;

export const StopActivityMutation = gql`
  mutation StopActivity($competitionId: String!, $activityId: Int!) {
    stopActivity(competitionId: $competitionId, activityId: $activityId) {
      activityId
      startTime
      endTime
    }
  }
`;

export const StopStartActivityMutation = gql`
  mutation StopStartActivity(
    $competitionId: String!
    $stopActivityId: Int!
    $startActivityId: Int!
  ) {
    stop: stopActivity(
      competitionId: $competitionId
      activityId: $stopActivityId
    ) {
      activityId
      startTime
      endTime
    }
    start: startActivity(
      competitionId: $competitionId
      activityId: $startActivityId
    ) {
      activityId
      startTime
      endTime
    }
  }
`;

export const ActivitiesSubscription = gql`
  subscription Activities($competitionIds: [String!]!) {
    activity: activityUpdated(competitionIds: $competitionIds) {
      activityId
      startTime
      endTime
    }
  }
`;
