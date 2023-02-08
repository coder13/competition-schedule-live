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

export const ResetActivityMutation = gql`
  mutation ResetActivity($competitionId: String!, $activityId: Int!) {
    resetActivity(competitionId: $competitionId, activityId: $activityId) {
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
  subscription Activities($competitionId: String!) {
    activity: activityUpdated(competitionIds: [$competitionId]) {
      activityId
      startTime
      endTime
    }
  }
`;

export const WebhooksQuery = gql`
  query Webhooks($competitionId: String!) {
    competition(competitionId: $competitionId) {
      id
      webhooks {
        id
        url
        method
        headers {
          key
          value
        }
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

export const TestWebhooksMutation = gql`
  mutation TestWebhooks($competitionId: String!) {
    testWebhooks(competitionId: $competitionId) {
      url
      status
      statusText
      body
    }
  }
`;

export const TestEditingWebhookMutation = gql`
  mutation TestEditingWebhook(
    $competitionId: String!
    $webhook: WebhookInput!
  ) {
    testEditingWebhook(competitionId: $competitionId, webhook: $webhook) {
      status
      statusText
      body
    }
  }
`;
