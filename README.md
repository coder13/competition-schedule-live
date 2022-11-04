# competition-schedule-live
Bundle of apps and services that manages a WCA Competition schedule live

## packages

### `packages/server`

This is the main beast that drives events. It is a nodejs, express, graphql server. It handles authentication as well as real time tracking of the ongoing activity. Users will receive a JWT token when they authenticate which can then be used across these other services to verify their identity. When a user imports a competition, it saves a subset of data to a database. The list of users is also saved and will be able to be edited in the future. After a user has imported a competition, any user (authenticated or not), can "subscribe" to the activity events to listen for activities starting and stopping. This server also sends webhooks when an activity is started and these can be configured however the competition owner chooses.

Bundled also in this monorepo will be serverless applications that listen for these webhooks and do actions such as send SMS messages, send discord messages, send telegram messages, or more

A spec for the webhooks will be well communicated once finalized so that anyone can create these serverless applications.

- [Database schema](./packages/server/prisma/schema.prisma)
- [Graphql schema](./packages/server/graphql/schema)

### `packages/expo_app`

This is the main app that competition owners will 

## Glossary

- `competition owner`: A delegate or organizer
- `stage manager`: A delegate, organizer, or authorized individual who is allowed to progress the activities in this service
- `Activity`: Per the [WCIF spec](https://github.com/thewca/wcif/blob/master/specification.md), an activity is a very flexible concept. It is a recursive data structure that makes up a schedule. It represents all of the rounds you see on the schedule but also "lunch", "awards" and so on. Activities also have childActivities. Round activities will children in the form of "groups". To break it down further, "group" activities could have attempts. Only FMC or Multi-blind need attempt activities however.
- `JWT`: JSON web token

## Roadmap

- [ ] Competition owners can track the current ongoing group for a respective stage
- [ ] Users can get notified of their groups in real time via SMS messages
- [ ] Competition owners can reflect on the performance of their comp schedule through looking at the activity history
- [ ] Competition owners can update the WCA schedule based on the actual performance of the comp schedule.
