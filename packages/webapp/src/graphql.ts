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
        autoAdvance
        autoAdvanceDelay
        status
      }
    }
  }
`;

const ActivityFragment = gql`
  fragment ActivityFragment on Activity {
    activityId
    startTime
    endTime
    scheduledStartTime
    scheduledEndTime
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
      ...ActivityFragment
    }
  }
  ${ActivityFragment}
`;

export const StartActivityMutation = gql`
  mutation StartActivity($competitionId: String!, $activityId: Int!) {
    startActivity(competitionId: $competitionId, activityId: $activityId) {
      ...ActivityFragment
    }
  }
  ${ActivityFragment}
`;

export const StartActivitiesMutation = gql`
  mutation StartActivities($competitionId: String!, $activityIds: [Int!]!) {
    startActivities(competitionId: $competitionId, activityIds: $activityIds) {
      ...ActivityFragment
    }
  }
  ${ActivityFragment}
`;

export const StopActivityMutation = gql`
  mutation StopActivity($competitionId: String!, $activityId: Int!) {
    stopActivity(competitionId: $competitionId, activityId: $activityId) {
      ...ActivityFragment
    }
  }
  ${ActivityFragment}
`;

export const StopActivitiesMutation = gql`
  mutation StopActivities($competitionId: String!, $activityIds: [Int!]!) {
    stopActivities(competitionId: $competitionId, activityIds: $activityIds) {
      ...ActivityFragment
    }
  }
  ${ActivityFragment}
`;

export const ResetActivityMutation = gql`
  mutation ResetActivity($competitionId: String!, $activityId: Int!) {
    resetActivity(competitionId: $competitionId, activityId: $activityId) {
      ...ActivityFragment
    }
  }
  ${ActivityFragment}
`;

export const ResetActivitiesMutation = gql`
  mutation ResetActivities($competitionId: String!) {
    resetActivities(competitionId: $competitionId) {
      ...ActivityFragment
    }
  }
  ${ActivityFragment}
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
      ...ActivityFragment
    }
    start: startActivity(
      competitionId: $competitionId
      activityId: $startActivityId
    ) {
      ...ActivityFragment
    }
  }
  ${ActivityFragment}
`;

export const StopStartActivitiesMutation = gql`
  mutation StopStartActivities(
    $competitionId: String!
    $stopActivityIds: [Int!]!
    $startActivityIds: [Int!]!
  ) {
    stop: stopActivities(
      competitionId: $competitionId
      activityIds: $stopActivityIds
    ) {
      ...ActivityFragment
    }
    start: startActivities(
      competitionId: $competitionId
      activityIds: $startActivityIds
    ) {
      ...ActivityFragment
    }
  }
  ${ActivityFragment}
`;

export const ActivitiesSubscription = gql`
  subscription Activities($competitionId: String!) {
    activity: activityUpdated(competitionIds: [$competitionId]) {
      ...ActivityFragment
    }
  }
  ${ActivityFragment}
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

export const UpdateAutoAdvanceMutation = gql`
  mutation UpdateAutoAdvance(
    $competitionId: String!
    $autoAdvance: Boolean
    $autoAdvanceDelay: Int
  ) {
    updateAutoAdvance(
      competitionId: $competitionId
      autoAdvance: $autoAdvance
      autoAdvanceDelay: $autoAdvanceDelay
    ) {
      id
      autoAdvance
      autoAdvanceDelay
    }
  }
`;
