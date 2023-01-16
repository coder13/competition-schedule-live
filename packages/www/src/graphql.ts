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
