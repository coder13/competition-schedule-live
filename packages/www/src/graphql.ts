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

export const GetSomeCompetitionsQuery = gql`
  query GetCompetitions($competitionIds: [String!]!) {
    competitions(competitionIds: $competitionIds) {
      id
      name
      startDate
      endDate
      country
      activities {
        activityId
        startTime
        endTime
      }
    }
  }
`;

export const ActivitiesSubscription = gql`
  subscription Activities($competitionIds: [String!]!) {
    activity: activityUpdated(competitionIds: $competitionIds) {
      activityId
      competitionId
      startTime
      endTime
    }
  }
`;
