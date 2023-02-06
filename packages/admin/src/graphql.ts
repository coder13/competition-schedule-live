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

export const GetCompetitionQuery = gql`
  query GetCompetition($competitionId: String!) {
    competition(competitionId: $competitionId) {
      id
      name
      startDate
      endDate
      country
      webhooks {
        id
        url
        method
        headers {
          key
          value
        }
      }
      activities {
        activityId
        startTime
        endTime
      }
    }
  }
`;

export const CreateWebhookMutation = gql`
  mutation CreateWebhook($competitionId: String!, $webhook: WebhookInput!) {
    createWebhook(competitionId: $competitionId, webhook: $webhook) {
      id
      url
      method
      headers {
        key
        value
      }
    }
  }
`;

export const UpdateWebhookMutation = gql`
  mutation UpdateWebhook($id: Int!, $webhook: WebhookInput!) {
    updateWebhook(id: $id, webhook: $webhook) {
      id
      url
      method
      headers {
        key
        value
      }
    }
  }
`;

export const DeleteWebhookMutation = gql`
  mutation DeleteWebhook($id: Int!) {
    deleteWebhook(id: $id)
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

export const ResetActivitiesMutation = gql`
  mutation ResetActivities($competitionId: String!) {
    resetActivities(competitionId: $competitionId) {
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
