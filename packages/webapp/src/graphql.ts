import { gql } from '@apollo/client';

export const GetCompetitionsQuery = gql`
  query GetCompetitions {
    currentUser {
      id
      competitions {
        id
        name
        startDate
        endDate
        country
      }
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
