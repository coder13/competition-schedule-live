import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  DateTime: string;
  JSON: any;
  Void: any;
};

export type Activity = {
  __typename?: 'Activity';
  activityId: Scalars['Int'];
  competitionId: Scalars['String'];
  endTime?: Maybe<Scalars['DateTime']>;
  startTime?: Maybe<Scalars['DateTime']>;
};

export type Competition = {
  __typename?: 'Competition';
  activities?: Maybe<Array<Activity>>;
  competitionAccess?: Maybe<Array<CompetitionAccess>>;
  country: Scalars['String'];
  endDate: Scalars['String'];
  id: Scalars['String'];
  name: Scalars['String'];
  startDate: Scalars['String'];
  webhooks?: Maybe<Array<Webhook>>;
};


export type CompetitionActivitiesArgs = {
  ongoing?: InputMaybe<Scalars['Boolean']>;
};

export type CompetitionAccess = {
  __typename?: 'CompetitionAccess';
  competitionId: Scalars['String'];
  roomId: Scalars['Int'];
  userId: Scalars['Int'];
};

export enum HttpMethod {
  Delete = 'DELETE',
  Get = 'GET',
  Patch = 'PATCH',
  Post = 'POST',
  Put = 'PUT'
}

export type Header = {
  __typename?: 'Header';
  key: Scalars['String'];
  value: Scalars['String'];
};

export type HeaderInput = {
  key: Scalars['String'];
  value: Scalars['String'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createWebhook: Webhook;
  deleteWebhook?: Maybe<Scalars['Void']>;
  importCompetition?: Maybe<Competition>;
  resetActivities?: Maybe<Array<Maybe<Activity>>>;
  resetActivity?: Maybe<Activity>;
  startActivities?: Maybe<Array<Maybe<Activity>>>;
  startActivity?: Maybe<Activity>;
  stopActivity?: Maybe<Activity>;
  testEditingWebhook?: Maybe<WebhookResponse>;
  testWebhook?: Maybe<WebhookResponse>;
  testWebhooks: Array<Maybe<WebhookResponse>>;
  updateWebhook: Webhook;
};


export type MutationCreateWebhookArgs = {
  competitionId: Scalars['String'];
  webhook: WebhookInput;
};


export type MutationDeleteWebhookArgs = {
  id: Scalars['Int'];
};


export type MutationImportCompetitionArgs = {
  competitionId: Scalars['String'];
};


export type MutationResetActivitiesArgs = {
  activityIds?: InputMaybe<Array<Scalars['Int']>>;
  competitionId: Scalars['String'];
};


export type MutationResetActivityArgs = {
  activityId: Scalars['Int'];
  competitionId: Scalars['String'];
};


export type MutationStartActivitiesArgs = {
  activityIds: Array<Scalars['Int']>;
  competitionId: Scalars['String'];
};


export type MutationStartActivityArgs = {
  activityId: Scalars['Int'];
  competitionId: Scalars['String'];
};


export type MutationStopActivityArgs = {
  activityId: Scalars['Int'];
  competitionId: Scalars['String'];
};


export type MutationTestEditingWebhookArgs = {
  competitionId: Scalars['String'];
  webhook: WebhookInput;
};


export type MutationTestWebhookArgs = {
  id: Scalars['Int'];
};


export type MutationTestWebhooksArgs = {
  competitionId: Scalars['String'];
};


export type MutationUpdateWebhookArgs = {
  id: Scalars['Int'];
  webhook: WebhookInput;
};

export type Query = {
  __typename?: 'Query';
  activities: Array<Maybe<Activity>>;
  competition?: Maybe<Competition>;
  competitions: Array<Maybe<Competition>>;
  currentUser?: Maybe<User>;
};


export type QueryActivitiesArgs = {
  competitionId: Scalars['String'];
  roomId?: InputMaybe<Scalars['Int']>;
};


export type QueryCompetitionArgs = {
  competitionId: Scalars['String'];
};


export type QueryCompetitionsArgs = {
  after?: InputMaybe<Scalars['String']>;
  competitionIds?: InputMaybe<Array<Scalars['String']>>;
};

export type Subscription = {
  __typename?: 'Subscription';
  activities?: Maybe<Array<Maybe<Activity>>>;
  activityStarted?: Maybe<Activity>;
  activityStopped?: Maybe<Activity>;
  activityUpdated?: Maybe<Activity>;
};


export type SubscriptionActivitiesArgs = {
  competitionIds: Array<Scalars['String']>;
  roomId?: InputMaybe<Scalars['Int']>;
};


export type SubscriptionActivityStartedArgs = {
  competitionId: Scalars['String'];
  roomId?: InputMaybe<Scalars['Int']>;
};


export type SubscriptionActivityStoppedArgs = {
  competitionId: Scalars['String'];
  roomId?: InputMaybe<Scalars['Int']>;
};


export type SubscriptionActivityUpdatedArgs = {
  competitionIds: Array<Scalars['String']>;
  roomId?: InputMaybe<Scalars['Int']>;
};

export type User = {
  __typename?: 'User';
  competitions?: Maybe<Array<Competition>>;
  id: Scalars['Int'];
};

export type Webhook = {
  __typename?: 'Webhook';
  headers?: Maybe<Array<Header>>;
  id: Scalars['Int'];
  method: HttpMethod;
  url: Scalars['String'];
};

export type WebhookInput = {
  headers?: InputMaybe<Array<HeaderInput>>;
  method: HttpMethod;
  url: Scalars['String'];
};

export type WebhookResponse = {
  __typename?: 'WebhookResponse';
  body?: Maybe<Scalars['String']>;
  status: Scalars['Int'];
  statusText: Scalars['String'];
  url: Scalars['String'];
};



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Activity: ResolverTypeWrapper<Activity>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  Competition: ResolverTypeWrapper<Competition>;
  CompetitionAccess: ResolverTypeWrapper<CompetitionAccess>;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']>;
  HTTPMethod: HttpMethod;
  Header: ResolverTypeWrapper<Header>;
  HeaderInput: HeaderInput;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  JSON: ResolverTypeWrapper<Scalars['JSON']>;
  Mutation: ResolverTypeWrapper<{}>;
  Query: ResolverTypeWrapper<{}>;
  String: ResolverTypeWrapper<Scalars['String']>;
  Subscription: ResolverTypeWrapper<{}>;
  User: ResolverTypeWrapper<User>;
  Void: ResolverTypeWrapper<Scalars['Void']>;
  Webhook: ResolverTypeWrapper<Webhook>;
  WebhookInput: WebhookInput;
  WebhookResponse: ResolverTypeWrapper<WebhookResponse>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Activity: Activity;
  Boolean: Scalars['Boolean'];
  Competition: Competition;
  CompetitionAccess: CompetitionAccess;
  DateTime: Scalars['DateTime'];
  Header: Header;
  HeaderInput: HeaderInput;
  Int: Scalars['Int'];
  JSON: Scalars['JSON'];
  Mutation: {};
  Query: {};
  String: Scalars['String'];
  Subscription: {};
  User: User;
  Void: Scalars['Void'];
  Webhook: Webhook;
  WebhookInput: WebhookInput;
  WebhookResponse: WebhookResponse;
};

export type ActivityResolvers<ContextType = any, ParentType extends ResolversParentTypes['Activity'] = ResolversParentTypes['Activity']> = {
  activityId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  competitionId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  endTime?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  startTime?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CompetitionResolvers<ContextType = any, ParentType extends ResolversParentTypes['Competition'] = ResolversParentTypes['Competition']> = {
  activities?: Resolver<Maybe<Array<ResolversTypes['Activity']>>, ParentType, ContextType, Partial<CompetitionActivitiesArgs>>;
  competitionAccess?: Resolver<Maybe<Array<ResolversTypes['CompetitionAccess']>>, ParentType, ContextType>;
  country?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  endDate?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  startDate?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  webhooks?: Resolver<Maybe<Array<ResolversTypes['Webhook']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CompetitionAccessResolvers<ContextType = any, ParentType extends ResolversParentTypes['CompetitionAccess'] = ResolversParentTypes['CompetitionAccess']> = {
  competitionId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  roomId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export type HeaderResolvers<ContextType = any, ParentType extends ResolversParentTypes['Header'] = ResolversParentTypes['Header']> = {
  key?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  value?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface JsonScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['JSON'], any> {
  name: 'JSON';
}

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  createWebhook?: Resolver<ResolversTypes['Webhook'], ParentType, ContextType, RequireFields<MutationCreateWebhookArgs, 'competitionId' | 'webhook'>>;
  deleteWebhook?: Resolver<Maybe<ResolversTypes['Void']>, ParentType, ContextType, RequireFields<MutationDeleteWebhookArgs, 'id'>>;
  importCompetition?: Resolver<Maybe<ResolversTypes['Competition']>, ParentType, ContextType, RequireFields<MutationImportCompetitionArgs, 'competitionId'>>;
  resetActivities?: Resolver<Maybe<Array<Maybe<ResolversTypes['Activity']>>>, ParentType, ContextType, RequireFields<MutationResetActivitiesArgs, 'competitionId'>>;
  resetActivity?: Resolver<Maybe<ResolversTypes['Activity']>, ParentType, ContextType, RequireFields<MutationResetActivityArgs, 'activityId' | 'competitionId'>>;
  startActivities?: Resolver<Maybe<Array<Maybe<ResolversTypes['Activity']>>>, ParentType, ContextType, RequireFields<MutationStartActivitiesArgs, 'activityIds' | 'competitionId'>>;
  startActivity?: Resolver<Maybe<ResolversTypes['Activity']>, ParentType, ContextType, RequireFields<MutationStartActivityArgs, 'activityId' | 'competitionId'>>;
  stopActivity?: Resolver<Maybe<ResolversTypes['Activity']>, ParentType, ContextType, RequireFields<MutationStopActivityArgs, 'activityId' | 'competitionId'>>;
  testEditingWebhook?: Resolver<Maybe<ResolversTypes['WebhookResponse']>, ParentType, ContextType, RequireFields<MutationTestEditingWebhookArgs, 'competitionId' | 'webhook'>>;
  testWebhook?: Resolver<Maybe<ResolversTypes['WebhookResponse']>, ParentType, ContextType, RequireFields<MutationTestWebhookArgs, 'id'>>;
  testWebhooks?: Resolver<Array<Maybe<ResolversTypes['WebhookResponse']>>, ParentType, ContextType, RequireFields<MutationTestWebhooksArgs, 'competitionId'>>;
  updateWebhook?: Resolver<ResolversTypes['Webhook'], ParentType, ContextType, RequireFields<MutationUpdateWebhookArgs, 'id' | 'webhook'>>;
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  activities?: Resolver<Array<Maybe<ResolversTypes['Activity']>>, ParentType, ContextType, RequireFields<QueryActivitiesArgs, 'competitionId'>>;
  competition?: Resolver<Maybe<ResolversTypes['Competition']>, ParentType, ContextType, RequireFields<QueryCompetitionArgs, 'competitionId'>>;
  competitions?: Resolver<Array<Maybe<ResolversTypes['Competition']>>, ParentType, ContextType, Partial<QueryCompetitionsArgs>>;
  currentUser?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
};

export type SubscriptionResolvers<ContextType = any, ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']> = {
  activities?: SubscriptionResolver<Maybe<Array<Maybe<ResolversTypes['Activity']>>>, "activities", ParentType, ContextType, RequireFields<SubscriptionActivitiesArgs, 'competitionIds'>>;
  activityStarted?: SubscriptionResolver<Maybe<ResolversTypes['Activity']>, "activityStarted", ParentType, ContextType, RequireFields<SubscriptionActivityStartedArgs, 'competitionId'>>;
  activityStopped?: SubscriptionResolver<Maybe<ResolversTypes['Activity']>, "activityStopped", ParentType, ContextType, RequireFields<SubscriptionActivityStoppedArgs, 'competitionId'>>;
  activityUpdated?: SubscriptionResolver<Maybe<ResolversTypes['Activity']>, "activityUpdated", ParentType, ContextType, RequireFields<SubscriptionActivityUpdatedArgs, 'competitionIds'>>;
};

export type UserResolvers<ContextType = any, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
  competitions?: Resolver<Maybe<Array<ResolversTypes['Competition']>>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface VoidScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Void'], any> {
  name: 'Void';
}

export type WebhookResolvers<ContextType = any, ParentType extends ResolversParentTypes['Webhook'] = ResolversParentTypes['Webhook']> = {
  headers?: Resolver<Maybe<Array<ResolversTypes['Header']>>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  method?: Resolver<ResolversTypes['HTTPMethod'], ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type WebhookResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['WebhookResponse'] = ResolversParentTypes['WebhookResponse']> = {
  body?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  statusText?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
  Activity?: ActivityResolvers<ContextType>;
  Competition?: CompetitionResolvers<ContextType>;
  CompetitionAccess?: CompetitionAccessResolvers<ContextType>;
  DateTime?: GraphQLScalarType;
  Header?: HeaderResolvers<ContextType>;
  JSON?: GraphQLScalarType;
  Mutation?: MutationResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Subscription?: SubscriptionResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
  Void?: GraphQLScalarType;
  Webhook?: WebhookResolvers<ContextType>;
  WebhookResponse?: WebhookResponseResolvers<ContextType>;
};

