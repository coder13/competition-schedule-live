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
  JSON: any;
};

export type ActivityHistory = {
  __typename?: 'ActivityHistory';
  activityId: Scalars['Int'];
  competitionId: Scalars['Int'];
  endTime?: Maybe<Scalars['Int']>;
  startTime: Scalars['Int'];
};

export type Competition = {
  __typename?: 'Competition';
  id: Scalars['String'];
  name: Scalars['String'];
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

export type Query = {
  __typename?: 'Query';
  activityHistory: Array<Maybe<ActivityHistory>>;
  competition?: Maybe<Competition>;
  competitionAccess?: Maybe<Array<CompetitionAccess>>;
  webhooks: Array<Maybe<Webhook>>;
};


export type QueryActivityHistoryArgs = {
  competitionId: Scalars['String'];
};


export type QueryCompetitionAccessArgs = {
  competitionId: Scalars['String'];
};


export type QueryWebhooksArgs = {
  competitionId: Scalars['String'];
};

export type Webhook = {
  __typename?: 'Webhook';
  competitionId: Scalars['String'];
  headers?: Maybe<Scalars['JSON']>;
  id: Scalars['ID'];
  method: HttpMethod;
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
  ActivityHistory: ResolverTypeWrapper<ActivityHistory>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  Competition: ResolverTypeWrapper<Competition>;
  CompetitionAccess: ResolverTypeWrapper<CompetitionAccess>;
  HTTPMethod: HttpMethod;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  JSON: ResolverTypeWrapper<Scalars['JSON']>;
  Query: ResolverTypeWrapper<{}>;
  String: ResolverTypeWrapper<Scalars['String']>;
  Webhook: ResolverTypeWrapper<Webhook>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  ActivityHistory: ActivityHistory;
  Boolean: Scalars['Boolean'];
  Competition: Competition;
  CompetitionAccess: CompetitionAccess;
  ID: Scalars['ID'];
  Int: Scalars['Int'];
  JSON: Scalars['JSON'];
  Query: {};
  String: Scalars['String'];
  Webhook: Webhook;
};

export type ActivityHistoryResolvers<ContextType = any, ParentType extends ResolversParentTypes['ActivityHistory'] = ResolversParentTypes['ActivityHistory']> = {
  activityId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  competitionId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  endTime?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  startTime?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CompetitionResolvers<ContextType = any, ParentType extends ResolversParentTypes['Competition'] = ResolversParentTypes['Competition']> = {
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CompetitionAccessResolvers<ContextType = any, ParentType extends ResolversParentTypes['CompetitionAccess'] = ResolversParentTypes['CompetitionAccess']> = {
  competitionId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  roomId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface JsonScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['JSON'], any> {
  name: 'JSON';
}

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  activityHistory?: Resolver<Array<Maybe<ResolversTypes['ActivityHistory']>>, ParentType, ContextType, RequireFields<QueryActivityHistoryArgs, 'competitionId'>>;
  competition?: Resolver<Maybe<ResolversTypes['Competition']>, ParentType, ContextType>;
  competitionAccess?: Resolver<Maybe<Array<ResolversTypes['CompetitionAccess']>>, ParentType, ContextType, RequireFields<QueryCompetitionAccessArgs, 'competitionId'>>;
  webhooks?: Resolver<Array<Maybe<ResolversTypes['Webhook']>>, ParentType, ContextType, RequireFields<QueryWebhooksArgs, 'competitionId'>>;
};

export type WebhookResolvers<ContextType = any, ParentType extends ResolversParentTypes['Webhook'] = ResolversParentTypes['Webhook']> = {
  competitionId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  headers?: Resolver<Maybe<ResolversTypes['JSON']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  method?: Resolver<ResolversTypes['HTTPMethod'], ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
  ActivityHistory?: ActivityHistoryResolvers<ContextType>;
  Competition?: CompetitionResolvers<ContextType>;
  CompetitionAccess?: CompetitionAccessResolvers<ContextType>;
  JSON?: GraphQLScalarType;
  Query?: QueryResolvers<ContextType>;
  Webhook?: WebhookResolvers<ContextType>;
};

