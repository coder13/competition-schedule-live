
/**
 * Client
**/

import * as runtime from './runtime/library';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions

export type PrismaPromise<T> = $Public.PrismaPromise<T>


export type AuditLogPayload<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
  name: "AuditLog"
  objects: {
    user: UserPayload<ExtArgs>
  }
  scalars: $Extensions.GetResult<{
    id: number
    action: string
    createdAt: Date
    updatedAt: Date
    userId: number
    competitionId: string
  }, ExtArgs["result"]["auditLog"]>
  composites: {}
}

/**
 * Model AuditLog
 * 
 */
export type AuditLog = runtime.Types.DefaultSelection<AuditLogPayload>
export type UserPayload<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
  name: "User"
  objects: {
    AuditLog: AuditLogPayload<ExtArgs>[]
    CompetitionSubscription: CompetitionSubscriptionPayload<ExtArgs>[]
    CompetitorSubscription: CompetitorSubscriptionPayload<ExtArgs>[]
  }
  scalars: $Extensions.GetResult<{
    id: number
    phoneNumber: string
  }, ExtArgs["result"]["user"]>
  composites: {}
}

/**
 * Model User
 * 
 */
export type User = runtime.Types.DefaultSelection<UserPayload>
export type SessionPayload<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
  name: "Session"
  objects: {}
  scalars: $Extensions.GetResult<{
    id: string
    sid: string
    data: string
    expiresAt: Date
  }, ExtArgs["result"]["session"]>
  composites: {}
}

/**
 * Model Session
 * 
 */
export type Session = runtime.Types.DefaultSelection<SessionPayload>
export type CompetitionSubscriptionPayload<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
  name: "CompetitionSubscription"
  objects: {
    user: UserPayload<ExtArgs>
  }
  scalars: $Extensions.GetResult<{
    id: number
    createdAt: Date
    updatedAt: Date
    userId: number
    competitionId: string
    type: CompetitionSubscriptionType
    value: string
  }, ExtArgs["result"]["competitionSubscription"]>
  composites: {}
}

/**
 * Model CompetitionSubscription
 * 
 */
export type CompetitionSubscription = runtime.Types.DefaultSelection<CompetitionSubscriptionPayload>
export type CompetitorSubscriptionPayload<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
  name: "CompetitorSubscription"
  objects: {
    user: UserPayload<ExtArgs>
  }
  scalars: $Extensions.GetResult<{
    id: number
    createdAt: Date
    updatedAt: Date
    userId: number
    wcaUserId: number
    verified: boolean
    code: string
  }, ExtArgs["result"]["competitorSubscription"]>
  composites: {}
}

/**
 * Model CompetitorSubscription
 * 
 */
export type CompetitorSubscription = runtime.Types.DefaultSelection<CompetitorSubscriptionPayload>
export type CompetitionSidPayload<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
  name: "CompetitionSid"
  objects: {}
  scalars: $Extensions.GetResult<{
    createdAt: Date
    updatedAt: Date
    competitionId: string
    sid: string
  }, ExtArgs["result"]["competitionSid"]>
  composites: {}
}

/**
 * Model CompetitionSid
 * 
 */
export type CompetitionSid = runtime.Types.DefaultSelection<CompetitionSidPayload>

/**
 * Enums
 */

export const CompetitionSubscriptionType: {
  activity: 'activity',
  competitor: 'competitor'
};

export type CompetitionSubscriptionType = (typeof CompetitionSubscriptionType)[keyof typeof CompetitionSubscriptionType]


/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more AuditLogs
 * const auditLogs = await prisma.auditLog.findMany()
 * ```
 *
 * 
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  T extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof T ? T['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<T['log']> : never : never,
  GlobalReject extends Prisma.RejectOnNotFound | Prisma.RejectPerOperation | false | undefined = 'rejectOnNotFound' extends keyof T
    ? T['rejectOnNotFound']
    : false,
  ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   * 
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more AuditLogs
   * const auditLogs = await prisma.auditLog.findMany()
   * ```
   *
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<T, Prisma.PrismaClientOptions>);
  $on<V extends (U | 'beforeExit')>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : V extends 'beforeExit' ? () => Promise<void> : Prisma.LogEvent) => void): void;

  /**
   * Connect with the database
   */
  $connect(): Promise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): Promise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): Promise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => Promise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): Promise<R>


  $extends: $Extensions.ExtendsHook<'extends', Prisma.TypeMapCb, ExtArgs>

      /**
   * `prisma.auditLog`: Exposes CRUD operations for the **AuditLog** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AuditLogs
    * const auditLogs = await prisma.auditLog.findMany()
    * ```
    */
  get auditLog(): Prisma.AuditLogDelegate<GlobalReject, ExtArgs>;

  /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<GlobalReject, ExtArgs>;

  /**
   * `prisma.session`: Exposes CRUD operations for the **Session** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Sessions
    * const sessions = await prisma.session.findMany()
    * ```
    */
  get session(): Prisma.SessionDelegate<GlobalReject, ExtArgs>;

  /**
   * `prisma.competitionSubscription`: Exposes CRUD operations for the **CompetitionSubscription** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CompetitionSubscriptions
    * const competitionSubscriptions = await prisma.competitionSubscription.findMany()
    * ```
    */
  get competitionSubscription(): Prisma.CompetitionSubscriptionDelegate<GlobalReject, ExtArgs>;

  /**
   * `prisma.competitorSubscription`: Exposes CRUD operations for the **CompetitorSubscription** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CompetitorSubscriptions
    * const competitorSubscriptions = await prisma.competitorSubscription.findMany()
    * ```
    */
  get competitorSubscription(): Prisma.CompetitorSubscriptionDelegate<GlobalReject, ExtArgs>;

  /**
   * `prisma.competitionSid`: Exposes CRUD operations for the **CompetitionSid** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CompetitionSids
    * const competitionSids = await prisma.competitionSid.findMany()
    * ```
    */
  get competitionSid(): Prisma.CompetitionSidDelegate<GlobalReject, ExtArgs>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError
  export import NotFoundError = runtime.NotFoundError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql

  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics 
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export type Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export type Args<T, F extends $Public.Operation> = $Public.Args<T, F>
  export type Payload<T, F extends $Public.Operation> = $Public.Payload<T, F>
  export type Result<T, A, F extends $Public.Operation> = $Public.Result<T, A, F>
  export type Exact<T, W> = $Public.Exact<T, W>

  /**
   * Prisma Client JS version: 4.16.2
   * Query Engine version: 4bc8b6e1b66cb932731fb1bdbbc550d1e010de81
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion 

  /**
   * Utility Types
   */

  /**
   * From https://github.com/sindresorhus/type-fest/
   * Matches a JSON object.
   * This type can be useful to enforce some input to be JSON-compatible or as a super-type to be extended from. 
   */
  export type JsonObject = {[Key in string]?: JsonValue}

  /**
   * From https://github.com/sindresorhus/type-fest/
   * Matches a JSON array.
   */
  export interface JsonArray extends Array<JsonValue> {}

  /**
   * From https://github.com/sindresorhus/type-fest/
   * Matches any valid JSON value.
   */
  export type JsonValue = string | number | boolean | JsonObject | JsonArray | null

  /**
   * Matches a JSON object.
   * Unlike `JsonObject`, this type allows undefined and read-only properties.
   */
  export type InputJsonObject = {readonly [Key in string]?: InputJsonValue | null}

  /**
   * Matches a JSON array.
   * Unlike `JsonArray`, readonly arrays are assignable to this type.
   */
  export interface InputJsonArray extends ReadonlyArray<InputJsonValue | null> {}

  /**
   * Matches any valid value that can be used as an input for operations like
   * create and update as the value of a JSON field. Unlike `JsonValue`, this
   * type allows read-only arrays and read-only object properties and disallows
   * `null` at the top level.
   *
   * `null` cannot be used as the value of a JSON field because its meaning
   * would be ambiguous. Use `Prisma.JsonNull` to store the JSON null value or
   * `Prisma.DbNull` to clear the JSON value and set the field to the database
   * NULL value instead.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-by-null-values
   */
  export type InputJsonValue = string | number | boolean | InputJsonObject | InputJsonArray

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }
  type HasSelect = {
    select: any
  }
  type HasInclude = {
    include: any
  }
  type CheckSelect<T, S, U> = T extends SelectAndInclude
    ? 'Please either choose `select` or `include`'
    : T extends HasSelect
    ? U
    : T extends HasInclude
    ? U
    : S

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => Promise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? K : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but with an array
   */
  type PickArray<T, K extends Array<keyof T>> = Prisma__Pick<T, TupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    AuditLog: 'AuditLog',
    User: 'User',
    Session: 'Session',
    CompetitionSubscription: 'CompetitionSubscription',
    CompetitorSubscription: 'CompetitorSubscription',
    CompetitionSid: 'CompetitionSid'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }


  interface TypeMapCb extends $Utils.Fn<{extArgs: $Extensions.Args}, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs']>
  }

  export type TypeMap<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    meta: {
      modelProps: 'auditLog' | 'user' | 'session' | 'competitionSubscription' | 'competitorSubscription' | 'competitionSid'
      txIsolationLevel: Prisma.TransactionIsolationLevel
    },
    model: {
      AuditLog: {
        payload: AuditLogPayload<ExtArgs>
        operations: {
          findUnique: {
            args: Prisma.AuditLogFindUniqueArgs<ExtArgs>,
            result: $Utils.PayloadToResult<AuditLogPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AuditLogFindUniqueOrThrowArgs<ExtArgs>,
            result: $Utils.PayloadToResult<AuditLogPayload>
          }
          findFirst: {
            args: Prisma.AuditLogFindFirstArgs<ExtArgs>,
            result: $Utils.PayloadToResult<AuditLogPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AuditLogFindFirstOrThrowArgs<ExtArgs>,
            result: $Utils.PayloadToResult<AuditLogPayload>
          }
          findMany: {
            args: Prisma.AuditLogFindManyArgs<ExtArgs>,
            result: $Utils.PayloadToResult<AuditLogPayload>[]
          }
          create: {
            args: Prisma.AuditLogCreateArgs<ExtArgs>,
            result: $Utils.PayloadToResult<AuditLogPayload>
          }
          createMany: {
            args: Prisma.AuditLogCreateManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          delete: {
            args: Prisma.AuditLogDeleteArgs<ExtArgs>,
            result: $Utils.PayloadToResult<AuditLogPayload>
          }
          update: {
            args: Prisma.AuditLogUpdateArgs<ExtArgs>,
            result: $Utils.PayloadToResult<AuditLogPayload>
          }
          deleteMany: {
            args: Prisma.AuditLogDeleteManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          updateMany: {
            args: Prisma.AuditLogUpdateManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          upsert: {
            args: Prisma.AuditLogUpsertArgs<ExtArgs>,
            result: $Utils.PayloadToResult<AuditLogPayload>
          }
          aggregate: {
            args: Prisma.AuditLogAggregateArgs<ExtArgs>,
            result: $Utils.Optional<AggregateAuditLog>
          }
          groupBy: {
            args: Prisma.AuditLogGroupByArgs<ExtArgs>,
            result: $Utils.Optional<AuditLogGroupByOutputType>[]
          }
          count: {
            args: Prisma.AuditLogCountArgs<ExtArgs>,
            result: $Utils.Optional<AuditLogCountAggregateOutputType> | number
          }
        }
      }
      User: {
        payload: UserPayload<ExtArgs>
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>,
            result: $Utils.PayloadToResult<UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>,
            result: $Utils.PayloadToResult<UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>,
            result: $Utils.PayloadToResult<UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>,
            result: $Utils.PayloadToResult<UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>,
            result: $Utils.PayloadToResult<UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>,
            result: $Utils.PayloadToResult<UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>,
            result: $Utils.PayloadToResult<UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>,
            result: $Utils.PayloadToResult<UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>,
            result: $Utils.PayloadToResult<UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>,
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>,
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>,
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      Session: {
        payload: SessionPayload<ExtArgs>
        operations: {
          findUnique: {
            args: Prisma.SessionFindUniqueArgs<ExtArgs>,
            result: $Utils.PayloadToResult<SessionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SessionFindUniqueOrThrowArgs<ExtArgs>,
            result: $Utils.PayloadToResult<SessionPayload>
          }
          findFirst: {
            args: Prisma.SessionFindFirstArgs<ExtArgs>,
            result: $Utils.PayloadToResult<SessionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SessionFindFirstOrThrowArgs<ExtArgs>,
            result: $Utils.PayloadToResult<SessionPayload>
          }
          findMany: {
            args: Prisma.SessionFindManyArgs<ExtArgs>,
            result: $Utils.PayloadToResult<SessionPayload>[]
          }
          create: {
            args: Prisma.SessionCreateArgs<ExtArgs>,
            result: $Utils.PayloadToResult<SessionPayload>
          }
          createMany: {
            args: Prisma.SessionCreateManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          delete: {
            args: Prisma.SessionDeleteArgs<ExtArgs>,
            result: $Utils.PayloadToResult<SessionPayload>
          }
          update: {
            args: Prisma.SessionUpdateArgs<ExtArgs>,
            result: $Utils.PayloadToResult<SessionPayload>
          }
          deleteMany: {
            args: Prisma.SessionDeleteManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          updateMany: {
            args: Prisma.SessionUpdateManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          upsert: {
            args: Prisma.SessionUpsertArgs<ExtArgs>,
            result: $Utils.PayloadToResult<SessionPayload>
          }
          aggregate: {
            args: Prisma.SessionAggregateArgs<ExtArgs>,
            result: $Utils.Optional<AggregateSession>
          }
          groupBy: {
            args: Prisma.SessionGroupByArgs<ExtArgs>,
            result: $Utils.Optional<SessionGroupByOutputType>[]
          }
          count: {
            args: Prisma.SessionCountArgs<ExtArgs>,
            result: $Utils.Optional<SessionCountAggregateOutputType> | number
          }
        }
      }
      CompetitionSubscription: {
        payload: CompetitionSubscriptionPayload<ExtArgs>
        operations: {
          findUnique: {
            args: Prisma.CompetitionSubscriptionFindUniqueArgs<ExtArgs>,
            result: $Utils.PayloadToResult<CompetitionSubscriptionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CompetitionSubscriptionFindUniqueOrThrowArgs<ExtArgs>,
            result: $Utils.PayloadToResult<CompetitionSubscriptionPayload>
          }
          findFirst: {
            args: Prisma.CompetitionSubscriptionFindFirstArgs<ExtArgs>,
            result: $Utils.PayloadToResult<CompetitionSubscriptionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CompetitionSubscriptionFindFirstOrThrowArgs<ExtArgs>,
            result: $Utils.PayloadToResult<CompetitionSubscriptionPayload>
          }
          findMany: {
            args: Prisma.CompetitionSubscriptionFindManyArgs<ExtArgs>,
            result: $Utils.PayloadToResult<CompetitionSubscriptionPayload>[]
          }
          create: {
            args: Prisma.CompetitionSubscriptionCreateArgs<ExtArgs>,
            result: $Utils.PayloadToResult<CompetitionSubscriptionPayload>
          }
          createMany: {
            args: Prisma.CompetitionSubscriptionCreateManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          delete: {
            args: Prisma.CompetitionSubscriptionDeleteArgs<ExtArgs>,
            result: $Utils.PayloadToResult<CompetitionSubscriptionPayload>
          }
          update: {
            args: Prisma.CompetitionSubscriptionUpdateArgs<ExtArgs>,
            result: $Utils.PayloadToResult<CompetitionSubscriptionPayload>
          }
          deleteMany: {
            args: Prisma.CompetitionSubscriptionDeleteManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          updateMany: {
            args: Prisma.CompetitionSubscriptionUpdateManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          upsert: {
            args: Prisma.CompetitionSubscriptionUpsertArgs<ExtArgs>,
            result: $Utils.PayloadToResult<CompetitionSubscriptionPayload>
          }
          aggregate: {
            args: Prisma.CompetitionSubscriptionAggregateArgs<ExtArgs>,
            result: $Utils.Optional<AggregateCompetitionSubscription>
          }
          groupBy: {
            args: Prisma.CompetitionSubscriptionGroupByArgs<ExtArgs>,
            result: $Utils.Optional<CompetitionSubscriptionGroupByOutputType>[]
          }
          count: {
            args: Prisma.CompetitionSubscriptionCountArgs<ExtArgs>,
            result: $Utils.Optional<CompetitionSubscriptionCountAggregateOutputType> | number
          }
        }
      }
      CompetitorSubscription: {
        payload: CompetitorSubscriptionPayload<ExtArgs>
        operations: {
          findUnique: {
            args: Prisma.CompetitorSubscriptionFindUniqueArgs<ExtArgs>,
            result: $Utils.PayloadToResult<CompetitorSubscriptionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CompetitorSubscriptionFindUniqueOrThrowArgs<ExtArgs>,
            result: $Utils.PayloadToResult<CompetitorSubscriptionPayload>
          }
          findFirst: {
            args: Prisma.CompetitorSubscriptionFindFirstArgs<ExtArgs>,
            result: $Utils.PayloadToResult<CompetitorSubscriptionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CompetitorSubscriptionFindFirstOrThrowArgs<ExtArgs>,
            result: $Utils.PayloadToResult<CompetitorSubscriptionPayload>
          }
          findMany: {
            args: Prisma.CompetitorSubscriptionFindManyArgs<ExtArgs>,
            result: $Utils.PayloadToResult<CompetitorSubscriptionPayload>[]
          }
          create: {
            args: Prisma.CompetitorSubscriptionCreateArgs<ExtArgs>,
            result: $Utils.PayloadToResult<CompetitorSubscriptionPayload>
          }
          createMany: {
            args: Prisma.CompetitorSubscriptionCreateManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          delete: {
            args: Prisma.CompetitorSubscriptionDeleteArgs<ExtArgs>,
            result: $Utils.PayloadToResult<CompetitorSubscriptionPayload>
          }
          update: {
            args: Prisma.CompetitorSubscriptionUpdateArgs<ExtArgs>,
            result: $Utils.PayloadToResult<CompetitorSubscriptionPayload>
          }
          deleteMany: {
            args: Prisma.CompetitorSubscriptionDeleteManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          updateMany: {
            args: Prisma.CompetitorSubscriptionUpdateManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          upsert: {
            args: Prisma.CompetitorSubscriptionUpsertArgs<ExtArgs>,
            result: $Utils.PayloadToResult<CompetitorSubscriptionPayload>
          }
          aggregate: {
            args: Prisma.CompetitorSubscriptionAggregateArgs<ExtArgs>,
            result: $Utils.Optional<AggregateCompetitorSubscription>
          }
          groupBy: {
            args: Prisma.CompetitorSubscriptionGroupByArgs<ExtArgs>,
            result: $Utils.Optional<CompetitorSubscriptionGroupByOutputType>[]
          }
          count: {
            args: Prisma.CompetitorSubscriptionCountArgs<ExtArgs>,
            result: $Utils.Optional<CompetitorSubscriptionCountAggregateOutputType> | number
          }
        }
      }
      CompetitionSid: {
        payload: CompetitionSidPayload<ExtArgs>
        operations: {
          findUnique: {
            args: Prisma.CompetitionSidFindUniqueArgs<ExtArgs>,
            result: $Utils.PayloadToResult<CompetitionSidPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CompetitionSidFindUniqueOrThrowArgs<ExtArgs>,
            result: $Utils.PayloadToResult<CompetitionSidPayload>
          }
          findFirst: {
            args: Prisma.CompetitionSidFindFirstArgs<ExtArgs>,
            result: $Utils.PayloadToResult<CompetitionSidPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CompetitionSidFindFirstOrThrowArgs<ExtArgs>,
            result: $Utils.PayloadToResult<CompetitionSidPayload>
          }
          findMany: {
            args: Prisma.CompetitionSidFindManyArgs<ExtArgs>,
            result: $Utils.PayloadToResult<CompetitionSidPayload>[]
          }
          create: {
            args: Prisma.CompetitionSidCreateArgs<ExtArgs>,
            result: $Utils.PayloadToResult<CompetitionSidPayload>
          }
          createMany: {
            args: Prisma.CompetitionSidCreateManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          delete: {
            args: Prisma.CompetitionSidDeleteArgs<ExtArgs>,
            result: $Utils.PayloadToResult<CompetitionSidPayload>
          }
          update: {
            args: Prisma.CompetitionSidUpdateArgs<ExtArgs>,
            result: $Utils.PayloadToResult<CompetitionSidPayload>
          }
          deleteMany: {
            args: Prisma.CompetitionSidDeleteManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          updateMany: {
            args: Prisma.CompetitionSidUpdateManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          upsert: {
            args: Prisma.CompetitionSidUpsertArgs<ExtArgs>,
            result: $Utils.PayloadToResult<CompetitionSidPayload>
          }
          aggregate: {
            args: Prisma.CompetitionSidAggregateArgs<ExtArgs>,
            result: $Utils.Optional<AggregateCompetitionSid>
          }
          groupBy: {
            args: Prisma.CompetitionSidGroupByArgs<ExtArgs>,
            result: $Utils.Optional<CompetitionSidGroupByOutputType>[]
          }
          count: {
            args: Prisma.CompetitionSidCountArgs<ExtArgs>,
            result: $Utils.Optional<CompetitionSidCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<'define', Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type RejectOnNotFound = boolean | ((error: Error) => Error)
  export type RejectPerModel = { [P in ModelName]?: RejectOnNotFound }
  export type RejectPerOperation =  { [P in "findUnique" | "findFirst"]?: RejectPerModel | RejectOnNotFound } 
  type IsReject<T> = T extends true ? True : T extends (err: Error) => Error ? True : False
  export type HasReject<
    GlobalRejectSettings extends Prisma.PrismaClientOptions['rejectOnNotFound'],
    LocalRejectSettings,
    Action extends PrismaAction,
    Model extends ModelName
  > = LocalRejectSettings extends RejectOnNotFound
    ? IsReject<LocalRejectSettings>
    : GlobalRejectSettings extends RejectPerOperation
    ? Action extends keyof GlobalRejectSettings
      ? GlobalRejectSettings[Action] extends RejectOnNotFound
        ? IsReject<GlobalRejectSettings[Action]>
        : GlobalRejectSettings[Action] extends RejectPerModel
        ? Model extends keyof GlobalRejectSettings[Action]
          ? IsReject<GlobalRejectSettings[Action][Model]>
          : False
        : False
      : False
    : IsReject<GlobalRejectSettings>
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'

  export interface PrismaClientOptions {
    /**
     * Configure findUnique/findFirst to throw an error if the query returns null. 
     * @deprecated since 4.0.0. Use `findUniqueOrThrow`/`findFirstOrThrow` methods instead.
     * @example
     * ```
     * // Reject on both findUnique/findFirst
     * rejectOnNotFound: true
     * // Reject only on findFirst with a custom error
     * rejectOnNotFound: { findFirst: (err) => new Error("Custom Error")}
     * // Reject on user.findUnique with a custom error
     * rejectOnNotFound: { findUnique: {User: (err) => new Error("User not found")}}
     * ```
     */
    rejectOnNotFound?: RejectOnNotFound | RejectPerOperation
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources

    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat

    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: Array<LogLevel | LogDefinition>
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findMany'
    | 'findFirst'
    | 'create'
    | 'createMany'
    | 'update'
    | 'updateMany'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => Promise<T>,
  ) => Promise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type UserCountOutputType
   */


  export type UserCountOutputType = {
    AuditLog: number
    CompetitionSubscription: number
    CompetitorSubscription: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    AuditLog?: boolean | UserCountOutputTypeCountAuditLogArgs
    CompetitionSubscription?: boolean | UserCountOutputTypeCountCompetitionSubscriptionArgs
    CompetitorSubscription?: boolean | UserCountOutputTypeCountCompetitorSubscriptionArgs
  }

  // Custom InputTypes

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }


  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountAuditLogArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    where?: AuditLogWhereInput
  }


  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountCompetitionSubscriptionArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    where?: CompetitionSubscriptionWhereInput
  }


  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountCompetitorSubscriptionArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    where?: CompetitorSubscriptionWhereInput
  }



  /**
   * Models
   */

  /**
   * Model AuditLog
   */


  export type AggregateAuditLog = {
    _count: AuditLogCountAggregateOutputType | null
    _avg: AuditLogAvgAggregateOutputType | null
    _sum: AuditLogSumAggregateOutputType | null
    _min: AuditLogMinAggregateOutputType | null
    _max: AuditLogMaxAggregateOutputType | null
  }

  export type AuditLogAvgAggregateOutputType = {
    id: number | null
    userId: number | null
  }

  export type AuditLogSumAggregateOutputType = {
    id: number | null
    userId: number | null
  }

  export type AuditLogMinAggregateOutputType = {
    id: number | null
    action: string | null
    createdAt: Date | null
    updatedAt: Date | null
    userId: number | null
    competitionId: string | null
  }

  export type AuditLogMaxAggregateOutputType = {
    id: number | null
    action: string | null
    createdAt: Date | null
    updatedAt: Date | null
    userId: number | null
    competitionId: string | null
  }

  export type AuditLogCountAggregateOutputType = {
    id: number
    action: number
    createdAt: number
    updatedAt: number
    userId: number
    competitionId: number
    _all: number
  }


  export type AuditLogAvgAggregateInputType = {
    id?: true
    userId?: true
  }

  export type AuditLogSumAggregateInputType = {
    id?: true
    userId?: true
  }

  export type AuditLogMinAggregateInputType = {
    id?: true
    action?: true
    createdAt?: true
    updatedAt?: true
    userId?: true
    competitionId?: true
  }

  export type AuditLogMaxAggregateInputType = {
    id?: true
    action?: true
    createdAt?: true
    updatedAt?: true
    userId?: true
    competitionId?: true
  }

  export type AuditLogCountAggregateInputType = {
    id?: true
    action?: true
    createdAt?: true
    updatedAt?: true
    userId?: true
    competitionId?: true
    _all?: true
  }

  export type AuditLogAggregateArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Filter which AuditLog to aggregate.
     */
    where?: AuditLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuditLogs to fetch.
     */
    orderBy?: Enumerable<AuditLogOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AuditLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuditLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuditLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AuditLogs
    **/
    _count?: true | AuditLogCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: AuditLogAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: AuditLogSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AuditLogMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AuditLogMaxAggregateInputType
  }

  export type GetAuditLogAggregateType<T extends AuditLogAggregateArgs> = {
        [P in keyof T & keyof AggregateAuditLog]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAuditLog[P]>
      : GetScalarType<T[P], AggregateAuditLog[P]>
  }




  export type AuditLogGroupByArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    where?: AuditLogWhereInput
    orderBy?: Enumerable<AuditLogOrderByWithAggregationInput>
    by: AuditLogScalarFieldEnum[]
    having?: AuditLogScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AuditLogCountAggregateInputType | true
    _avg?: AuditLogAvgAggregateInputType
    _sum?: AuditLogSumAggregateInputType
    _min?: AuditLogMinAggregateInputType
    _max?: AuditLogMaxAggregateInputType
  }


  export type AuditLogGroupByOutputType = {
    id: number
    action: string
    createdAt: Date
    updatedAt: Date
    userId: number
    competitionId: string
    _count: AuditLogCountAggregateOutputType | null
    _avg: AuditLogAvgAggregateOutputType | null
    _sum: AuditLogSumAggregateOutputType | null
    _min: AuditLogMinAggregateOutputType | null
    _max: AuditLogMaxAggregateOutputType | null
  }

  type GetAuditLogGroupByPayload<T extends AuditLogGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickArray<AuditLogGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AuditLogGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AuditLogGroupByOutputType[P]>
            : GetScalarType<T[P], AuditLogGroupByOutputType[P]>
        }
      >
    >


  export type AuditLogSelect<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    action?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    userId?: boolean
    competitionId?: boolean
    user?: boolean | UserArgs<ExtArgs>
  }, ExtArgs["result"]["auditLog"]>

  export type AuditLogSelectScalar = {
    id?: boolean
    action?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    userId?: boolean
    competitionId?: boolean
  }

  export type AuditLogInclude<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    user?: boolean | UserArgs<ExtArgs>
  }


  type AuditLogGetPayload<S extends boolean | null | undefined | AuditLogArgs> = $Types.GetResult<AuditLogPayload, S>

  type AuditLogCountArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = 
    Omit<AuditLogFindManyArgs, 'select' | 'include'> & {
      select?: AuditLogCountAggregateInputType | true
    }

  export interface AuditLogDelegate<GlobalRejectSettings extends Prisma.RejectOnNotFound | Prisma.RejectPerOperation | false | undefined, ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AuditLog'], meta: { name: 'AuditLog' } }
    /**
     * Find zero or one AuditLog that matches the filter.
     * @param {AuditLogFindUniqueArgs} args - Arguments to find a AuditLog
     * @example
     * // Get one AuditLog
     * const auditLog = await prisma.auditLog.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUnique<T extends AuditLogFindUniqueArgs<ExtArgs>, LocalRejectSettings = T["rejectOnNotFound"] extends RejectOnNotFound ? T['rejectOnNotFound'] : undefined>(
      args: SelectSubset<T, AuditLogFindUniqueArgs<ExtArgs>>
    ): HasReject<GlobalRejectSettings, LocalRejectSettings, 'findUnique', 'AuditLog'> extends True ? Prisma__AuditLogClient<$Types.GetResult<AuditLogPayload<ExtArgs>, T, 'findUnique', never>, never, ExtArgs> : Prisma__AuditLogClient<$Types.GetResult<AuditLogPayload<ExtArgs>, T, 'findUnique', never> | null, null, ExtArgs>

    /**
     * Find one AuditLog that matches the filter or throw an error  with `error.code='P2025'` 
     *     if no matches were found.
     * @param {AuditLogFindUniqueOrThrowArgs} args - Arguments to find a AuditLog
     * @example
     * // Get one AuditLog
     * const auditLog = await prisma.auditLog.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUniqueOrThrow<T extends AuditLogFindUniqueOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, AuditLogFindUniqueOrThrowArgs<ExtArgs>>
    ): Prisma__AuditLogClient<$Types.GetResult<AuditLogPayload<ExtArgs>, T, 'findUniqueOrThrow', never>, never, ExtArgs>

    /**
     * Find the first AuditLog that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogFindFirstArgs} args - Arguments to find a AuditLog
     * @example
     * // Get one AuditLog
     * const auditLog = await prisma.auditLog.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirst<T extends AuditLogFindFirstArgs<ExtArgs>, LocalRejectSettings = T["rejectOnNotFound"] extends RejectOnNotFound ? T['rejectOnNotFound'] : undefined>(
      args?: SelectSubset<T, AuditLogFindFirstArgs<ExtArgs>>
    ): HasReject<GlobalRejectSettings, LocalRejectSettings, 'findFirst', 'AuditLog'> extends True ? Prisma__AuditLogClient<$Types.GetResult<AuditLogPayload<ExtArgs>, T, 'findFirst', never>, never, ExtArgs> : Prisma__AuditLogClient<$Types.GetResult<AuditLogPayload<ExtArgs>, T, 'findFirst', never> | null, null, ExtArgs>

    /**
     * Find the first AuditLog that matches the filter or
     * throw `NotFoundError` if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogFindFirstOrThrowArgs} args - Arguments to find a AuditLog
     * @example
     * // Get one AuditLog
     * const auditLog = await prisma.auditLog.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirstOrThrow<T extends AuditLogFindFirstOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, AuditLogFindFirstOrThrowArgs<ExtArgs>>
    ): Prisma__AuditLogClient<$Types.GetResult<AuditLogPayload<ExtArgs>, T, 'findFirstOrThrow', never>, never, ExtArgs>

    /**
     * Find zero or more AuditLogs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogFindManyArgs=} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AuditLogs
     * const auditLogs = await prisma.auditLog.findMany()
     * 
     * // Get first 10 AuditLogs
     * const auditLogs = await prisma.auditLog.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const auditLogWithIdOnly = await prisma.auditLog.findMany({ select: { id: true } })
     * 
    **/
    findMany<T extends AuditLogFindManyArgs<ExtArgs>>(
      args?: SelectSubset<T, AuditLogFindManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Types.GetResult<AuditLogPayload<ExtArgs>, T, 'findMany', never>>

    /**
     * Create a AuditLog.
     * @param {AuditLogCreateArgs} args - Arguments to create a AuditLog.
     * @example
     * // Create one AuditLog
     * const AuditLog = await prisma.auditLog.create({
     *   data: {
     *     // ... data to create a AuditLog
     *   }
     * })
     * 
    **/
    create<T extends AuditLogCreateArgs<ExtArgs>>(
      args: SelectSubset<T, AuditLogCreateArgs<ExtArgs>>
    ): Prisma__AuditLogClient<$Types.GetResult<AuditLogPayload<ExtArgs>, T, 'create', never>, never, ExtArgs>

    /**
     * Create many AuditLogs.
     *     @param {AuditLogCreateManyArgs} args - Arguments to create many AuditLogs.
     *     @example
     *     // Create many AuditLogs
     *     const auditLog = await prisma.auditLog.createMany({
     *       data: {
     *         // ... provide data here
     *       }
     *     })
     *     
    **/
    createMany<T extends AuditLogCreateManyArgs<ExtArgs>>(
      args?: SelectSubset<T, AuditLogCreateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a AuditLog.
     * @param {AuditLogDeleteArgs} args - Arguments to delete one AuditLog.
     * @example
     * // Delete one AuditLog
     * const AuditLog = await prisma.auditLog.delete({
     *   where: {
     *     // ... filter to delete one AuditLog
     *   }
     * })
     * 
    **/
    delete<T extends AuditLogDeleteArgs<ExtArgs>>(
      args: SelectSubset<T, AuditLogDeleteArgs<ExtArgs>>
    ): Prisma__AuditLogClient<$Types.GetResult<AuditLogPayload<ExtArgs>, T, 'delete', never>, never, ExtArgs>

    /**
     * Update one AuditLog.
     * @param {AuditLogUpdateArgs} args - Arguments to update one AuditLog.
     * @example
     * // Update one AuditLog
     * const auditLog = await prisma.auditLog.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    update<T extends AuditLogUpdateArgs<ExtArgs>>(
      args: SelectSubset<T, AuditLogUpdateArgs<ExtArgs>>
    ): Prisma__AuditLogClient<$Types.GetResult<AuditLogPayload<ExtArgs>, T, 'update', never>, never, ExtArgs>

    /**
     * Delete zero or more AuditLogs.
     * @param {AuditLogDeleteManyArgs} args - Arguments to filter AuditLogs to delete.
     * @example
     * // Delete a few AuditLogs
     * const { count } = await prisma.auditLog.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
    **/
    deleteMany<T extends AuditLogDeleteManyArgs<ExtArgs>>(
      args?: SelectSubset<T, AuditLogDeleteManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AuditLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AuditLogs
     * const auditLog = await prisma.auditLog.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    updateMany<T extends AuditLogUpdateManyArgs<ExtArgs>>(
      args: SelectSubset<T, AuditLogUpdateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one AuditLog.
     * @param {AuditLogUpsertArgs} args - Arguments to update or create a AuditLog.
     * @example
     * // Update or create a AuditLog
     * const auditLog = await prisma.auditLog.upsert({
     *   create: {
     *     // ... data to create a AuditLog
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AuditLog we want to update
     *   }
     * })
    **/
    upsert<T extends AuditLogUpsertArgs<ExtArgs>>(
      args: SelectSubset<T, AuditLogUpsertArgs<ExtArgs>>
    ): Prisma__AuditLogClient<$Types.GetResult<AuditLogPayload<ExtArgs>, T, 'upsert', never>, never, ExtArgs>

    /**
     * Count the number of AuditLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogCountArgs} args - Arguments to filter AuditLogs to count.
     * @example
     * // Count the number of AuditLogs
     * const count = await prisma.auditLog.count({
     *   where: {
     *     // ... the filter for the AuditLogs we want to count
     *   }
     * })
    **/
    count<T extends AuditLogCountArgs>(
      args?: Subset<T, AuditLogCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AuditLogCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AuditLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AuditLogAggregateArgs>(args: Subset<T, AuditLogAggregateArgs>): Prisma.PrismaPromise<GetAuditLogAggregateType<T>>

    /**
     * Group by AuditLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AuditLogGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AuditLogGroupByArgs['orderBy'] }
        : { orderBy?: AuditLogGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends TupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AuditLogGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAuditLogGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>

  }

  /**
   * The delegate class that acts as a "Promise-like" for AuditLog.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export class Prisma__AuditLogClient<T, Null = never, ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> implements Prisma.PrismaPromise<T> {
    private readonly _dmmf;
    private readonly _queryType;
    private readonly _rootField;
    private readonly _clientMethod;
    private readonly _args;
    private readonly _dataPath;
    private readonly _errorFormat;
    private readonly _measurePerformance?;
    private _isList;
    private _callsite;
    private _requestPromise?;
    readonly [Symbol.toStringTag]: 'PrismaPromise';
    constructor(_dmmf: runtime.DMMFClass, _queryType: 'query' | 'mutation', _rootField: string, _clientMethod: string, _args: any, _dataPath: string[], _errorFormat: ErrorFormat, _measurePerformance?: boolean | undefined, _isList?: boolean);

    user<T extends UserArgs<ExtArgs> = {}>(args?: Subset<T, UserArgs<ExtArgs>>): Prisma__UserClient<$Types.GetResult<UserPayload<ExtArgs>, T, 'findUnique', never> | Null, never, ExtArgs>;

    private get _document();
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): Promise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): Promise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): Promise<T>;
  }



  // Custom InputTypes

  /**
   * AuditLog base type for findUnique actions
   */
  export type AuditLogFindUniqueArgsBase<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: AuditLogInclude<ExtArgs> | null
    /**
     * Filter, which AuditLog to fetch.
     */
    where: AuditLogWhereUniqueInput
  }

  /**
   * AuditLog findUnique
   */
  export interface AuditLogFindUniqueArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> extends AuditLogFindUniqueArgsBase<ExtArgs> {
   /**
    * Throw an Error if query returns no results
    * @deprecated since 4.0.0: use `findUniqueOrThrow` method instead
    */
    rejectOnNotFound?: RejectOnNotFound
  }
      

  /**
   * AuditLog findUniqueOrThrow
   */
  export type AuditLogFindUniqueOrThrowArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: AuditLogInclude<ExtArgs> | null
    /**
     * Filter, which AuditLog to fetch.
     */
    where: AuditLogWhereUniqueInput
  }


  /**
   * AuditLog base type for findFirst actions
   */
  export type AuditLogFindFirstArgsBase<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: AuditLogInclude<ExtArgs> | null
    /**
     * Filter, which AuditLog to fetch.
     */
    where?: AuditLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuditLogs to fetch.
     */
    orderBy?: Enumerable<AuditLogOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AuditLogs.
     */
    cursor?: AuditLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuditLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuditLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AuditLogs.
     */
    distinct?: Enumerable<AuditLogScalarFieldEnum>
  }

  /**
   * AuditLog findFirst
   */
  export interface AuditLogFindFirstArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> extends AuditLogFindFirstArgsBase<ExtArgs> {
   /**
    * Throw an Error if query returns no results
    * @deprecated since 4.0.0: use `findFirstOrThrow` method instead
    */
    rejectOnNotFound?: RejectOnNotFound
  }
      

  /**
   * AuditLog findFirstOrThrow
   */
  export type AuditLogFindFirstOrThrowArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: AuditLogInclude<ExtArgs> | null
    /**
     * Filter, which AuditLog to fetch.
     */
    where?: AuditLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuditLogs to fetch.
     */
    orderBy?: Enumerable<AuditLogOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AuditLogs.
     */
    cursor?: AuditLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuditLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuditLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AuditLogs.
     */
    distinct?: Enumerable<AuditLogScalarFieldEnum>
  }


  /**
   * AuditLog findMany
   */
  export type AuditLogFindManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: AuditLogInclude<ExtArgs> | null
    /**
     * Filter, which AuditLogs to fetch.
     */
    where?: AuditLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuditLogs to fetch.
     */
    orderBy?: Enumerable<AuditLogOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AuditLogs.
     */
    cursor?: AuditLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuditLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuditLogs.
     */
    skip?: number
    distinct?: Enumerable<AuditLogScalarFieldEnum>
  }


  /**
   * AuditLog create
   */
  export type AuditLogCreateArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: AuditLogInclude<ExtArgs> | null
    /**
     * The data needed to create a AuditLog.
     */
    data: XOR<AuditLogCreateInput, AuditLogUncheckedCreateInput>
  }


  /**
   * AuditLog createMany
   */
  export type AuditLogCreateManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AuditLogs.
     */
    data: Enumerable<AuditLogCreateManyInput>
    skipDuplicates?: boolean
  }


  /**
   * AuditLog update
   */
  export type AuditLogUpdateArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: AuditLogInclude<ExtArgs> | null
    /**
     * The data needed to update a AuditLog.
     */
    data: XOR<AuditLogUpdateInput, AuditLogUncheckedUpdateInput>
    /**
     * Choose, which AuditLog to update.
     */
    where: AuditLogWhereUniqueInput
  }


  /**
   * AuditLog updateMany
   */
  export type AuditLogUpdateManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AuditLogs.
     */
    data: XOR<AuditLogUpdateManyMutationInput, AuditLogUncheckedUpdateManyInput>
    /**
     * Filter which AuditLogs to update
     */
    where?: AuditLogWhereInput
  }


  /**
   * AuditLog upsert
   */
  export type AuditLogUpsertArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: AuditLogInclude<ExtArgs> | null
    /**
     * The filter to search for the AuditLog to update in case it exists.
     */
    where: AuditLogWhereUniqueInput
    /**
     * In case the AuditLog found by the `where` argument doesn't exist, create a new AuditLog with this data.
     */
    create: XOR<AuditLogCreateInput, AuditLogUncheckedCreateInput>
    /**
     * In case the AuditLog was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AuditLogUpdateInput, AuditLogUncheckedUpdateInput>
  }


  /**
   * AuditLog delete
   */
  export type AuditLogDeleteArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: AuditLogInclude<ExtArgs> | null
    /**
     * Filter which AuditLog to delete.
     */
    where: AuditLogWhereUniqueInput
  }


  /**
   * AuditLog deleteMany
   */
  export type AuditLogDeleteManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Filter which AuditLogs to delete
     */
    where?: AuditLogWhereInput
  }


  /**
   * AuditLog without action
   */
  export type AuditLogArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: AuditLogInclude<ExtArgs> | null
  }



  /**
   * Model User
   */


  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _avg: UserAvgAggregateOutputType | null
    _sum: UserSumAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserAvgAggregateOutputType = {
    id: number | null
  }

  export type UserSumAggregateOutputType = {
    id: number | null
  }

  export type UserMinAggregateOutputType = {
    id: number | null
    phoneNumber: string | null
  }

  export type UserMaxAggregateOutputType = {
    id: number | null
    phoneNumber: string | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    phoneNumber: number
    _all: number
  }


  export type UserAvgAggregateInputType = {
    id?: true
  }

  export type UserSumAggregateInputType = {
    id?: true
  }

  export type UserMinAggregateInputType = {
    id?: true
    phoneNumber?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    phoneNumber?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    phoneNumber?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: Enumerable<UserOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UserAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UserSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: Enumerable<UserOrderByWithAggregationInput>
    by: UserScalarFieldEnum[]
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _avg?: UserAvgAggregateInputType
    _sum?: UserSumAggregateInputType
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }


  export type UserGroupByOutputType = {
    id: number
    phoneNumber: string
    _count: UserCountAggregateOutputType | null
    _avg: UserAvgAggregateOutputType | null
    _sum: UserSumAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickArray<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    phoneNumber?: boolean
    AuditLog?: boolean | User$AuditLogArgs<ExtArgs>
    CompetitionSubscription?: boolean | User$CompetitionSubscriptionArgs<ExtArgs>
    CompetitorSubscription?: boolean | User$CompetitorSubscriptionArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    phoneNumber?: boolean
  }

  export type UserInclude<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    AuditLog?: boolean | User$AuditLogArgs<ExtArgs>
    CompetitionSubscription?: boolean | User$CompetitionSubscriptionArgs<ExtArgs>
    CompetitorSubscription?: boolean | User$CompetitorSubscriptionArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeArgs<ExtArgs>
  }


  type UserGetPayload<S extends boolean | null | undefined | UserArgs> = $Types.GetResult<UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = 
    Omit<UserFindManyArgs, 'select' | 'include'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<GlobalRejectSettings extends Prisma.RejectOnNotFound | Prisma.RejectPerOperation | false | undefined, ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUnique<T extends UserFindUniqueArgs<ExtArgs>, LocalRejectSettings = T["rejectOnNotFound"] extends RejectOnNotFound ? T['rejectOnNotFound'] : undefined>(
      args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>
    ): HasReject<GlobalRejectSettings, LocalRejectSettings, 'findUnique', 'User'> extends True ? Prisma__UserClient<$Types.GetResult<UserPayload<ExtArgs>, T, 'findUnique', never>, never, ExtArgs> : Prisma__UserClient<$Types.GetResult<UserPayload<ExtArgs>, T, 'findUnique', never> | null, null, ExtArgs>

    /**
     * Find one User that matches the filter or throw an error  with `error.code='P2025'` 
     *     if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>
    ): Prisma__UserClient<$Types.GetResult<UserPayload<ExtArgs>, T, 'findUniqueOrThrow', never>, never, ExtArgs>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirst<T extends UserFindFirstArgs<ExtArgs>, LocalRejectSettings = T["rejectOnNotFound"] extends RejectOnNotFound ? T['rejectOnNotFound'] : undefined>(
      args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>
    ): HasReject<GlobalRejectSettings, LocalRejectSettings, 'findFirst', 'User'> extends True ? Prisma__UserClient<$Types.GetResult<UserPayload<ExtArgs>, T, 'findFirst', never>, never, ExtArgs> : Prisma__UserClient<$Types.GetResult<UserPayload<ExtArgs>, T, 'findFirst', never> | null, null, ExtArgs>

    /**
     * Find the first User that matches the filter or
     * throw `NotFoundError` if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>
    ): Prisma__UserClient<$Types.GetResult<UserPayload<ExtArgs>, T, 'findFirstOrThrow', never>, never, ExtArgs>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs=} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
    **/
    findMany<T extends UserFindManyArgs<ExtArgs>>(
      args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Types.GetResult<UserPayload<ExtArgs>, T, 'findMany', never>>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
    **/
    create<T extends UserCreateArgs<ExtArgs>>(
      args: SelectSubset<T, UserCreateArgs<ExtArgs>>
    ): Prisma__UserClient<$Types.GetResult<UserPayload<ExtArgs>, T, 'create', never>, never, ExtArgs>

    /**
     * Create many Users.
     *     @param {UserCreateManyArgs} args - Arguments to create many Users.
     *     @example
     *     // Create many Users
     *     const user = await prisma.user.createMany({
     *       data: {
     *         // ... provide data here
     *       }
     *     })
     *     
    **/
    createMany<T extends UserCreateManyArgs<ExtArgs>>(
      args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
    **/
    delete<T extends UserDeleteArgs<ExtArgs>>(
      args: SelectSubset<T, UserDeleteArgs<ExtArgs>>
    ): Prisma__UserClient<$Types.GetResult<UserPayload<ExtArgs>, T, 'delete', never>, never, ExtArgs>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    update<T extends UserUpdateArgs<ExtArgs>>(
      args: SelectSubset<T, UserUpdateArgs<ExtArgs>>
    ): Prisma__UserClient<$Types.GetResult<UserPayload<ExtArgs>, T, 'update', never>, never, ExtArgs>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
    **/
    deleteMany<T extends UserDeleteManyArgs<ExtArgs>>(
      args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    updateMany<T extends UserUpdateManyArgs<ExtArgs>>(
      args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
    **/
    upsert<T extends UserUpsertArgs<ExtArgs>>(
      args: SelectSubset<T, UserUpsertArgs<ExtArgs>>
    ): Prisma__UserClient<$Types.GetResult<UserPayload<ExtArgs>, T, 'upsert', never>, never, ExtArgs>

    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends TupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>

  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export class Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> implements Prisma.PrismaPromise<T> {
    private readonly _dmmf;
    private readonly _queryType;
    private readonly _rootField;
    private readonly _clientMethod;
    private readonly _args;
    private readonly _dataPath;
    private readonly _errorFormat;
    private readonly _measurePerformance?;
    private _isList;
    private _callsite;
    private _requestPromise?;
    readonly [Symbol.toStringTag]: 'PrismaPromise';
    constructor(_dmmf: runtime.DMMFClass, _queryType: 'query' | 'mutation', _rootField: string, _clientMethod: string, _args: any, _dataPath: string[], _errorFormat: ErrorFormat, _measurePerformance?: boolean | undefined, _isList?: boolean);

    AuditLog<T extends User$AuditLogArgs<ExtArgs> = {}>(args?: Subset<T, User$AuditLogArgs<ExtArgs>>): Prisma.PrismaPromise<$Types.GetResult<AuditLogPayload<ExtArgs>, T, 'findMany', never>| Null>;

    CompetitionSubscription<T extends User$CompetitionSubscriptionArgs<ExtArgs> = {}>(args?: Subset<T, User$CompetitionSubscriptionArgs<ExtArgs>>): Prisma.PrismaPromise<$Types.GetResult<CompetitionSubscriptionPayload<ExtArgs>, T, 'findMany', never>| Null>;

    CompetitorSubscription<T extends User$CompetitorSubscriptionArgs<ExtArgs> = {}>(args?: Subset<T, User$CompetitorSubscriptionArgs<ExtArgs>>): Prisma.PrismaPromise<$Types.GetResult<CompetitorSubscriptionPayload<ExtArgs>, T, 'findMany', never>| Null>;

    private get _document();
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): Promise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): Promise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): Promise<T>;
  }



  // Custom InputTypes

  /**
   * User base type for findUnique actions
   */
  export type UserFindUniqueArgsBase<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUnique
   */
  export interface UserFindUniqueArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> extends UserFindUniqueArgsBase<ExtArgs> {
   /**
    * Throw an Error if query returns no results
    * @deprecated since 4.0.0: use `findUniqueOrThrow` method instead
    */
    rejectOnNotFound?: RejectOnNotFound
  }
      

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }


  /**
   * User base type for findFirst actions
   */
  export type UserFindFirstArgsBase<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: Enumerable<UserOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: Enumerable<UserScalarFieldEnum>
  }

  /**
   * User findFirst
   */
  export interface UserFindFirstArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> extends UserFindFirstArgsBase<ExtArgs> {
   /**
    * Throw an Error if query returns no results
    * @deprecated since 4.0.0: use `findFirstOrThrow` method instead
    */
    rejectOnNotFound?: RejectOnNotFound
  }
      

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: Enumerable<UserOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: Enumerable<UserScalarFieldEnum>
  }


  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: Enumerable<UserOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: Enumerable<UserScalarFieldEnum>
  }


  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }


  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: Enumerable<UserCreateManyInput>
    skipDuplicates?: boolean
  }


  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }


  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
  }


  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }


  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }


  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
  }


  /**
   * User.AuditLog
   */
  export type User$AuditLogArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: AuditLogInclude<ExtArgs> | null
    where?: AuditLogWhereInput
    orderBy?: Enumerable<AuditLogOrderByWithRelationInput>
    cursor?: AuditLogWhereUniqueInput
    take?: number
    skip?: number
    distinct?: Enumerable<AuditLogScalarFieldEnum>
  }


  /**
   * User.CompetitionSubscription
   */
  export type User$CompetitionSubscriptionArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CompetitionSubscription
     */
    select?: CompetitionSubscriptionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: CompetitionSubscriptionInclude<ExtArgs> | null
    where?: CompetitionSubscriptionWhereInput
    orderBy?: Enumerable<CompetitionSubscriptionOrderByWithRelationInput>
    cursor?: CompetitionSubscriptionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: Enumerable<CompetitionSubscriptionScalarFieldEnum>
  }


  /**
   * User.CompetitorSubscription
   */
  export type User$CompetitorSubscriptionArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CompetitorSubscription
     */
    select?: CompetitorSubscriptionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: CompetitorSubscriptionInclude<ExtArgs> | null
    where?: CompetitorSubscriptionWhereInput
    orderBy?: Enumerable<CompetitorSubscriptionOrderByWithRelationInput>
    cursor?: CompetitorSubscriptionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: Enumerable<CompetitorSubscriptionScalarFieldEnum>
  }


  /**
   * User without action
   */
  export type UserArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: UserInclude<ExtArgs> | null
  }



  /**
   * Model Session
   */


  export type AggregateSession = {
    _count: SessionCountAggregateOutputType | null
    _min: SessionMinAggregateOutputType | null
    _max: SessionMaxAggregateOutputType | null
  }

  export type SessionMinAggregateOutputType = {
    id: string | null
    sid: string | null
    data: string | null
    expiresAt: Date | null
  }

  export type SessionMaxAggregateOutputType = {
    id: string | null
    sid: string | null
    data: string | null
    expiresAt: Date | null
  }

  export type SessionCountAggregateOutputType = {
    id: number
    sid: number
    data: number
    expiresAt: number
    _all: number
  }


  export type SessionMinAggregateInputType = {
    id?: true
    sid?: true
    data?: true
    expiresAt?: true
  }

  export type SessionMaxAggregateInputType = {
    id?: true
    sid?: true
    data?: true
    expiresAt?: true
  }

  export type SessionCountAggregateInputType = {
    id?: true
    sid?: true
    data?: true
    expiresAt?: true
    _all?: true
  }

  export type SessionAggregateArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Filter which Session to aggregate.
     */
    where?: SessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Sessions to fetch.
     */
    orderBy?: Enumerable<SessionOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Sessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Sessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Sessions
    **/
    _count?: true | SessionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SessionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SessionMaxAggregateInputType
  }

  export type GetSessionAggregateType<T extends SessionAggregateArgs> = {
        [P in keyof T & keyof AggregateSession]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSession[P]>
      : GetScalarType<T[P], AggregateSession[P]>
  }




  export type SessionGroupByArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    where?: SessionWhereInput
    orderBy?: Enumerable<SessionOrderByWithAggregationInput>
    by: SessionScalarFieldEnum[]
    having?: SessionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SessionCountAggregateInputType | true
    _min?: SessionMinAggregateInputType
    _max?: SessionMaxAggregateInputType
  }


  export type SessionGroupByOutputType = {
    id: string
    sid: string
    data: string
    expiresAt: Date
    _count: SessionCountAggregateOutputType | null
    _min: SessionMinAggregateOutputType | null
    _max: SessionMaxAggregateOutputType | null
  }

  type GetSessionGroupByPayload<T extends SessionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickArray<SessionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SessionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SessionGroupByOutputType[P]>
            : GetScalarType<T[P], SessionGroupByOutputType[P]>
        }
      >
    >


  export type SessionSelect<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sid?: boolean
    data?: boolean
    expiresAt?: boolean
  }, ExtArgs["result"]["session"]>

  export type SessionSelectScalar = {
    id?: boolean
    sid?: boolean
    data?: boolean
    expiresAt?: boolean
  }


  type SessionGetPayload<S extends boolean | null | undefined | SessionArgs> = $Types.GetResult<SessionPayload, S>

  type SessionCountArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = 
    Omit<SessionFindManyArgs, 'select' | 'include'> & {
      select?: SessionCountAggregateInputType | true
    }

  export interface SessionDelegate<GlobalRejectSettings extends Prisma.RejectOnNotFound | Prisma.RejectPerOperation | false | undefined, ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Session'], meta: { name: 'Session' } }
    /**
     * Find zero or one Session that matches the filter.
     * @param {SessionFindUniqueArgs} args - Arguments to find a Session
     * @example
     * // Get one Session
     * const session = await prisma.session.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUnique<T extends SessionFindUniqueArgs<ExtArgs>, LocalRejectSettings = T["rejectOnNotFound"] extends RejectOnNotFound ? T['rejectOnNotFound'] : undefined>(
      args: SelectSubset<T, SessionFindUniqueArgs<ExtArgs>>
    ): HasReject<GlobalRejectSettings, LocalRejectSettings, 'findUnique', 'Session'> extends True ? Prisma__SessionClient<$Types.GetResult<SessionPayload<ExtArgs>, T, 'findUnique', never>, never, ExtArgs> : Prisma__SessionClient<$Types.GetResult<SessionPayload<ExtArgs>, T, 'findUnique', never> | null, null, ExtArgs>

    /**
     * Find one Session that matches the filter or throw an error  with `error.code='P2025'` 
     *     if no matches were found.
     * @param {SessionFindUniqueOrThrowArgs} args - Arguments to find a Session
     * @example
     * // Get one Session
     * const session = await prisma.session.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUniqueOrThrow<T extends SessionFindUniqueOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, SessionFindUniqueOrThrowArgs<ExtArgs>>
    ): Prisma__SessionClient<$Types.GetResult<SessionPayload<ExtArgs>, T, 'findUniqueOrThrow', never>, never, ExtArgs>

    /**
     * Find the first Session that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionFindFirstArgs} args - Arguments to find a Session
     * @example
     * // Get one Session
     * const session = await prisma.session.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirst<T extends SessionFindFirstArgs<ExtArgs>, LocalRejectSettings = T["rejectOnNotFound"] extends RejectOnNotFound ? T['rejectOnNotFound'] : undefined>(
      args?: SelectSubset<T, SessionFindFirstArgs<ExtArgs>>
    ): HasReject<GlobalRejectSettings, LocalRejectSettings, 'findFirst', 'Session'> extends True ? Prisma__SessionClient<$Types.GetResult<SessionPayload<ExtArgs>, T, 'findFirst', never>, never, ExtArgs> : Prisma__SessionClient<$Types.GetResult<SessionPayload<ExtArgs>, T, 'findFirst', never> | null, null, ExtArgs>

    /**
     * Find the first Session that matches the filter or
     * throw `NotFoundError` if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionFindFirstOrThrowArgs} args - Arguments to find a Session
     * @example
     * // Get one Session
     * const session = await prisma.session.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirstOrThrow<T extends SessionFindFirstOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, SessionFindFirstOrThrowArgs<ExtArgs>>
    ): Prisma__SessionClient<$Types.GetResult<SessionPayload<ExtArgs>, T, 'findFirstOrThrow', never>, never, ExtArgs>

    /**
     * Find zero or more Sessions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionFindManyArgs=} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Sessions
     * const sessions = await prisma.session.findMany()
     * 
     * // Get first 10 Sessions
     * const sessions = await prisma.session.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const sessionWithIdOnly = await prisma.session.findMany({ select: { id: true } })
     * 
    **/
    findMany<T extends SessionFindManyArgs<ExtArgs>>(
      args?: SelectSubset<T, SessionFindManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Types.GetResult<SessionPayload<ExtArgs>, T, 'findMany', never>>

    /**
     * Create a Session.
     * @param {SessionCreateArgs} args - Arguments to create a Session.
     * @example
     * // Create one Session
     * const Session = await prisma.session.create({
     *   data: {
     *     // ... data to create a Session
     *   }
     * })
     * 
    **/
    create<T extends SessionCreateArgs<ExtArgs>>(
      args: SelectSubset<T, SessionCreateArgs<ExtArgs>>
    ): Prisma__SessionClient<$Types.GetResult<SessionPayload<ExtArgs>, T, 'create', never>, never, ExtArgs>

    /**
     * Create many Sessions.
     *     @param {SessionCreateManyArgs} args - Arguments to create many Sessions.
     *     @example
     *     // Create many Sessions
     *     const session = await prisma.session.createMany({
     *       data: {
     *         // ... provide data here
     *       }
     *     })
     *     
    **/
    createMany<T extends SessionCreateManyArgs<ExtArgs>>(
      args?: SelectSubset<T, SessionCreateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Session.
     * @param {SessionDeleteArgs} args - Arguments to delete one Session.
     * @example
     * // Delete one Session
     * const Session = await prisma.session.delete({
     *   where: {
     *     // ... filter to delete one Session
     *   }
     * })
     * 
    **/
    delete<T extends SessionDeleteArgs<ExtArgs>>(
      args: SelectSubset<T, SessionDeleteArgs<ExtArgs>>
    ): Prisma__SessionClient<$Types.GetResult<SessionPayload<ExtArgs>, T, 'delete', never>, never, ExtArgs>

    /**
     * Update one Session.
     * @param {SessionUpdateArgs} args - Arguments to update one Session.
     * @example
     * // Update one Session
     * const session = await prisma.session.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    update<T extends SessionUpdateArgs<ExtArgs>>(
      args: SelectSubset<T, SessionUpdateArgs<ExtArgs>>
    ): Prisma__SessionClient<$Types.GetResult<SessionPayload<ExtArgs>, T, 'update', never>, never, ExtArgs>

    /**
     * Delete zero or more Sessions.
     * @param {SessionDeleteManyArgs} args - Arguments to filter Sessions to delete.
     * @example
     * // Delete a few Sessions
     * const { count } = await prisma.session.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
    **/
    deleteMany<T extends SessionDeleteManyArgs<ExtArgs>>(
      args?: SelectSubset<T, SessionDeleteManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Sessions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Sessions
     * const session = await prisma.session.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    updateMany<T extends SessionUpdateManyArgs<ExtArgs>>(
      args: SelectSubset<T, SessionUpdateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Session.
     * @param {SessionUpsertArgs} args - Arguments to update or create a Session.
     * @example
     * // Update or create a Session
     * const session = await prisma.session.upsert({
     *   create: {
     *     // ... data to create a Session
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Session we want to update
     *   }
     * })
    **/
    upsert<T extends SessionUpsertArgs<ExtArgs>>(
      args: SelectSubset<T, SessionUpsertArgs<ExtArgs>>
    ): Prisma__SessionClient<$Types.GetResult<SessionPayload<ExtArgs>, T, 'upsert', never>, never, ExtArgs>

    /**
     * Count the number of Sessions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionCountArgs} args - Arguments to filter Sessions to count.
     * @example
     * // Count the number of Sessions
     * const count = await prisma.session.count({
     *   where: {
     *     // ... the filter for the Sessions we want to count
     *   }
     * })
    **/
    count<T extends SessionCountArgs>(
      args?: Subset<T, SessionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SessionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Session.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SessionAggregateArgs>(args: Subset<T, SessionAggregateArgs>): Prisma.PrismaPromise<GetSessionAggregateType<T>>

    /**
     * Group by Session.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SessionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SessionGroupByArgs['orderBy'] }
        : { orderBy?: SessionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends TupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SessionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSessionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>

  }

  /**
   * The delegate class that acts as a "Promise-like" for Session.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export class Prisma__SessionClient<T, Null = never, ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> implements Prisma.PrismaPromise<T> {
    private readonly _dmmf;
    private readonly _queryType;
    private readonly _rootField;
    private readonly _clientMethod;
    private readonly _args;
    private readonly _dataPath;
    private readonly _errorFormat;
    private readonly _measurePerformance?;
    private _isList;
    private _callsite;
    private _requestPromise?;
    readonly [Symbol.toStringTag]: 'PrismaPromise';
    constructor(_dmmf: runtime.DMMFClass, _queryType: 'query' | 'mutation', _rootField: string, _clientMethod: string, _args: any, _dataPath: string[], _errorFormat: ErrorFormat, _measurePerformance?: boolean | undefined, _isList?: boolean);


    private get _document();
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): Promise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): Promise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): Promise<T>;
  }



  // Custom InputTypes

  /**
   * Session base type for findUnique actions
   */
  export type SessionFindUniqueArgsBase<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Filter, which Session to fetch.
     */
    where: SessionWhereUniqueInput
  }

  /**
   * Session findUnique
   */
  export interface SessionFindUniqueArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> extends SessionFindUniqueArgsBase<ExtArgs> {
   /**
    * Throw an Error if query returns no results
    * @deprecated since 4.0.0: use `findUniqueOrThrow` method instead
    */
    rejectOnNotFound?: RejectOnNotFound
  }
      

  /**
   * Session findUniqueOrThrow
   */
  export type SessionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Filter, which Session to fetch.
     */
    where: SessionWhereUniqueInput
  }


  /**
   * Session base type for findFirst actions
   */
  export type SessionFindFirstArgsBase<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Filter, which Session to fetch.
     */
    where?: SessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Sessions to fetch.
     */
    orderBy?: Enumerable<SessionOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Sessions.
     */
    cursor?: SessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Sessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Sessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Sessions.
     */
    distinct?: Enumerable<SessionScalarFieldEnum>
  }

  /**
   * Session findFirst
   */
  export interface SessionFindFirstArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> extends SessionFindFirstArgsBase<ExtArgs> {
   /**
    * Throw an Error if query returns no results
    * @deprecated since 4.0.0: use `findFirstOrThrow` method instead
    */
    rejectOnNotFound?: RejectOnNotFound
  }
      

  /**
   * Session findFirstOrThrow
   */
  export type SessionFindFirstOrThrowArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Filter, which Session to fetch.
     */
    where?: SessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Sessions to fetch.
     */
    orderBy?: Enumerable<SessionOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Sessions.
     */
    cursor?: SessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Sessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Sessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Sessions.
     */
    distinct?: Enumerable<SessionScalarFieldEnum>
  }


  /**
   * Session findMany
   */
  export type SessionFindManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Filter, which Sessions to fetch.
     */
    where?: SessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Sessions to fetch.
     */
    orderBy?: Enumerable<SessionOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Sessions.
     */
    cursor?: SessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Sessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Sessions.
     */
    skip?: number
    distinct?: Enumerable<SessionScalarFieldEnum>
  }


  /**
   * Session create
   */
  export type SessionCreateArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * The data needed to create a Session.
     */
    data: XOR<SessionCreateInput, SessionUncheckedCreateInput>
  }


  /**
   * Session createMany
   */
  export type SessionCreateManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Sessions.
     */
    data: Enumerable<SessionCreateManyInput>
    skipDuplicates?: boolean
  }


  /**
   * Session update
   */
  export type SessionUpdateArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * The data needed to update a Session.
     */
    data: XOR<SessionUpdateInput, SessionUncheckedUpdateInput>
    /**
     * Choose, which Session to update.
     */
    where: SessionWhereUniqueInput
  }


  /**
   * Session updateMany
   */
  export type SessionUpdateManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Sessions.
     */
    data: XOR<SessionUpdateManyMutationInput, SessionUncheckedUpdateManyInput>
    /**
     * Filter which Sessions to update
     */
    where?: SessionWhereInput
  }


  /**
   * Session upsert
   */
  export type SessionUpsertArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * The filter to search for the Session to update in case it exists.
     */
    where: SessionWhereUniqueInput
    /**
     * In case the Session found by the `where` argument doesn't exist, create a new Session with this data.
     */
    create: XOR<SessionCreateInput, SessionUncheckedCreateInput>
    /**
     * In case the Session was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SessionUpdateInput, SessionUncheckedUpdateInput>
  }


  /**
   * Session delete
   */
  export type SessionDeleteArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Filter which Session to delete.
     */
    where: SessionWhereUniqueInput
  }


  /**
   * Session deleteMany
   */
  export type SessionDeleteManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Filter which Sessions to delete
     */
    where?: SessionWhereInput
  }


  /**
   * Session without action
   */
  export type SessionArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
  }



  /**
   * Model CompetitionSubscription
   */


  export type AggregateCompetitionSubscription = {
    _count: CompetitionSubscriptionCountAggregateOutputType | null
    _avg: CompetitionSubscriptionAvgAggregateOutputType | null
    _sum: CompetitionSubscriptionSumAggregateOutputType | null
    _min: CompetitionSubscriptionMinAggregateOutputType | null
    _max: CompetitionSubscriptionMaxAggregateOutputType | null
  }

  export type CompetitionSubscriptionAvgAggregateOutputType = {
    id: number | null
    userId: number | null
  }

  export type CompetitionSubscriptionSumAggregateOutputType = {
    id: number | null
    userId: number | null
  }

  export type CompetitionSubscriptionMinAggregateOutputType = {
    id: number | null
    createdAt: Date | null
    updatedAt: Date | null
    userId: number | null
    competitionId: string | null
    type: CompetitionSubscriptionType | null
    value: string | null
  }

  export type CompetitionSubscriptionMaxAggregateOutputType = {
    id: number | null
    createdAt: Date | null
    updatedAt: Date | null
    userId: number | null
    competitionId: string | null
    type: CompetitionSubscriptionType | null
    value: string | null
  }

  export type CompetitionSubscriptionCountAggregateOutputType = {
    id: number
    createdAt: number
    updatedAt: number
    userId: number
    competitionId: number
    type: number
    value: number
    _all: number
  }


  export type CompetitionSubscriptionAvgAggregateInputType = {
    id?: true
    userId?: true
  }

  export type CompetitionSubscriptionSumAggregateInputType = {
    id?: true
    userId?: true
  }

  export type CompetitionSubscriptionMinAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    userId?: true
    competitionId?: true
    type?: true
    value?: true
  }

  export type CompetitionSubscriptionMaxAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    userId?: true
    competitionId?: true
    type?: true
    value?: true
  }

  export type CompetitionSubscriptionCountAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    userId?: true
    competitionId?: true
    type?: true
    value?: true
    _all?: true
  }

  export type CompetitionSubscriptionAggregateArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Filter which CompetitionSubscription to aggregate.
     */
    where?: CompetitionSubscriptionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CompetitionSubscriptions to fetch.
     */
    orderBy?: Enumerable<CompetitionSubscriptionOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CompetitionSubscriptionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CompetitionSubscriptions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CompetitionSubscriptions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CompetitionSubscriptions
    **/
    _count?: true | CompetitionSubscriptionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CompetitionSubscriptionAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CompetitionSubscriptionSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CompetitionSubscriptionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CompetitionSubscriptionMaxAggregateInputType
  }

  export type GetCompetitionSubscriptionAggregateType<T extends CompetitionSubscriptionAggregateArgs> = {
        [P in keyof T & keyof AggregateCompetitionSubscription]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCompetitionSubscription[P]>
      : GetScalarType<T[P], AggregateCompetitionSubscription[P]>
  }




  export type CompetitionSubscriptionGroupByArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    where?: CompetitionSubscriptionWhereInput
    orderBy?: Enumerable<CompetitionSubscriptionOrderByWithAggregationInput>
    by: CompetitionSubscriptionScalarFieldEnum[]
    having?: CompetitionSubscriptionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CompetitionSubscriptionCountAggregateInputType | true
    _avg?: CompetitionSubscriptionAvgAggregateInputType
    _sum?: CompetitionSubscriptionSumAggregateInputType
    _min?: CompetitionSubscriptionMinAggregateInputType
    _max?: CompetitionSubscriptionMaxAggregateInputType
  }


  export type CompetitionSubscriptionGroupByOutputType = {
    id: number
    createdAt: Date
    updatedAt: Date
    userId: number
    competitionId: string
    type: CompetitionSubscriptionType
    value: string
    _count: CompetitionSubscriptionCountAggregateOutputType | null
    _avg: CompetitionSubscriptionAvgAggregateOutputType | null
    _sum: CompetitionSubscriptionSumAggregateOutputType | null
    _min: CompetitionSubscriptionMinAggregateOutputType | null
    _max: CompetitionSubscriptionMaxAggregateOutputType | null
  }

  type GetCompetitionSubscriptionGroupByPayload<T extends CompetitionSubscriptionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickArray<CompetitionSubscriptionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CompetitionSubscriptionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CompetitionSubscriptionGroupByOutputType[P]>
            : GetScalarType<T[P], CompetitionSubscriptionGroupByOutputType[P]>
        }
      >
    >


  export type CompetitionSubscriptionSelect<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    userId?: boolean
    competitionId?: boolean
    type?: boolean
    value?: boolean
    user?: boolean | UserArgs<ExtArgs>
  }, ExtArgs["result"]["competitionSubscription"]>

  export type CompetitionSubscriptionSelectScalar = {
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    userId?: boolean
    competitionId?: boolean
    type?: boolean
    value?: boolean
  }

  export type CompetitionSubscriptionInclude<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    user?: boolean | UserArgs<ExtArgs>
  }


  type CompetitionSubscriptionGetPayload<S extends boolean | null | undefined | CompetitionSubscriptionArgs> = $Types.GetResult<CompetitionSubscriptionPayload, S>

  type CompetitionSubscriptionCountArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = 
    Omit<CompetitionSubscriptionFindManyArgs, 'select' | 'include'> & {
      select?: CompetitionSubscriptionCountAggregateInputType | true
    }

  export interface CompetitionSubscriptionDelegate<GlobalRejectSettings extends Prisma.RejectOnNotFound | Prisma.RejectPerOperation | false | undefined, ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CompetitionSubscription'], meta: { name: 'CompetitionSubscription' } }
    /**
     * Find zero or one CompetitionSubscription that matches the filter.
     * @param {CompetitionSubscriptionFindUniqueArgs} args - Arguments to find a CompetitionSubscription
     * @example
     * // Get one CompetitionSubscription
     * const competitionSubscription = await prisma.competitionSubscription.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUnique<T extends CompetitionSubscriptionFindUniqueArgs<ExtArgs>, LocalRejectSettings = T["rejectOnNotFound"] extends RejectOnNotFound ? T['rejectOnNotFound'] : undefined>(
      args: SelectSubset<T, CompetitionSubscriptionFindUniqueArgs<ExtArgs>>
    ): HasReject<GlobalRejectSettings, LocalRejectSettings, 'findUnique', 'CompetitionSubscription'> extends True ? Prisma__CompetitionSubscriptionClient<$Types.GetResult<CompetitionSubscriptionPayload<ExtArgs>, T, 'findUnique', never>, never, ExtArgs> : Prisma__CompetitionSubscriptionClient<$Types.GetResult<CompetitionSubscriptionPayload<ExtArgs>, T, 'findUnique', never> | null, null, ExtArgs>

    /**
     * Find one CompetitionSubscription that matches the filter or throw an error  with `error.code='P2025'` 
     *     if no matches were found.
     * @param {CompetitionSubscriptionFindUniqueOrThrowArgs} args - Arguments to find a CompetitionSubscription
     * @example
     * // Get one CompetitionSubscription
     * const competitionSubscription = await prisma.competitionSubscription.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUniqueOrThrow<T extends CompetitionSubscriptionFindUniqueOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, CompetitionSubscriptionFindUniqueOrThrowArgs<ExtArgs>>
    ): Prisma__CompetitionSubscriptionClient<$Types.GetResult<CompetitionSubscriptionPayload<ExtArgs>, T, 'findUniqueOrThrow', never>, never, ExtArgs>

    /**
     * Find the first CompetitionSubscription that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CompetitionSubscriptionFindFirstArgs} args - Arguments to find a CompetitionSubscription
     * @example
     * // Get one CompetitionSubscription
     * const competitionSubscription = await prisma.competitionSubscription.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirst<T extends CompetitionSubscriptionFindFirstArgs<ExtArgs>, LocalRejectSettings = T["rejectOnNotFound"] extends RejectOnNotFound ? T['rejectOnNotFound'] : undefined>(
      args?: SelectSubset<T, CompetitionSubscriptionFindFirstArgs<ExtArgs>>
    ): HasReject<GlobalRejectSettings, LocalRejectSettings, 'findFirst', 'CompetitionSubscription'> extends True ? Prisma__CompetitionSubscriptionClient<$Types.GetResult<CompetitionSubscriptionPayload<ExtArgs>, T, 'findFirst', never>, never, ExtArgs> : Prisma__CompetitionSubscriptionClient<$Types.GetResult<CompetitionSubscriptionPayload<ExtArgs>, T, 'findFirst', never> | null, null, ExtArgs>

    /**
     * Find the first CompetitionSubscription that matches the filter or
     * throw `NotFoundError` if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CompetitionSubscriptionFindFirstOrThrowArgs} args - Arguments to find a CompetitionSubscription
     * @example
     * // Get one CompetitionSubscription
     * const competitionSubscription = await prisma.competitionSubscription.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirstOrThrow<T extends CompetitionSubscriptionFindFirstOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, CompetitionSubscriptionFindFirstOrThrowArgs<ExtArgs>>
    ): Prisma__CompetitionSubscriptionClient<$Types.GetResult<CompetitionSubscriptionPayload<ExtArgs>, T, 'findFirstOrThrow', never>, never, ExtArgs>

    /**
     * Find zero or more CompetitionSubscriptions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CompetitionSubscriptionFindManyArgs=} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CompetitionSubscriptions
     * const competitionSubscriptions = await prisma.competitionSubscription.findMany()
     * 
     * // Get first 10 CompetitionSubscriptions
     * const competitionSubscriptions = await prisma.competitionSubscription.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const competitionSubscriptionWithIdOnly = await prisma.competitionSubscription.findMany({ select: { id: true } })
     * 
    **/
    findMany<T extends CompetitionSubscriptionFindManyArgs<ExtArgs>>(
      args?: SelectSubset<T, CompetitionSubscriptionFindManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Types.GetResult<CompetitionSubscriptionPayload<ExtArgs>, T, 'findMany', never>>

    /**
     * Create a CompetitionSubscription.
     * @param {CompetitionSubscriptionCreateArgs} args - Arguments to create a CompetitionSubscription.
     * @example
     * // Create one CompetitionSubscription
     * const CompetitionSubscription = await prisma.competitionSubscription.create({
     *   data: {
     *     // ... data to create a CompetitionSubscription
     *   }
     * })
     * 
    **/
    create<T extends CompetitionSubscriptionCreateArgs<ExtArgs>>(
      args: SelectSubset<T, CompetitionSubscriptionCreateArgs<ExtArgs>>
    ): Prisma__CompetitionSubscriptionClient<$Types.GetResult<CompetitionSubscriptionPayload<ExtArgs>, T, 'create', never>, never, ExtArgs>

    /**
     * Create many CompetitionSubscriptions.
     *     @param {CompetitionSubscriptionCreateManyArgs} args - Arguments to create many CompetitionSubscriptions.
     *     @example
     *     // Create many CompetitionSubscriptions
     *     const competitionSubscription = await prisma.competitionSubscription.createMany({
     *       data: {
     *         // ... provide data here
     *       }
     *     })
     *     
    **/
    createMany<T extends CompetitionSubscriptionCreateManyArgs<ExtArgs>>(
      args?: SelectSubset<T, CompetitionSubscriptionCreateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a CompetitionSubscription.
     * @param {CompetitionSubscriptionDeleteArgs} args - Arguments to delete one CompetitionSubscription.
     * @example
     * // Delete one CompetitionSubscription
     * const CompetitionSubscription = await prisma.competitionSubscription.delete({
     *   where: {
     *     // ... filter to delete one CompetitionSubscription
     *   }
     * })
     * 
    **/
    delete<T extends CompetitionSubscriptionDeleteArgs<ExtArgs>>(
      args: SelectSubset<T, CompetitionSubscriptionDeleteArgs<ExtArgs>>
    ): Prisma__CompetitionSubscriptionClient<$Types.GetResult<CompetitionSubscriptionPayload<ExtArgs>, T, 'delete', never>, never, ExtArgs>

    /**
     * Update one CompetitionSubscription.
     * @param {CompetitionSubscriptionUpdateArgs} args - Arguments to update one CompetitionSubscription.
     * @example
     * // Update one CompetitionSubscription
     * const competitionSubscription = await prisma.competitionSubscription.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    update<T extends CompetitionSubscriptionUpdateArgs<ExtArgs>>(
      args: SelectSubset<T, CompetitionSubscriptionUpdateArgs<ExtArgs>>
    ): Prisma__CompetitionSubscriptionClient<$Types.GetResult<CompetitionSubscriptionPayload<ExtArgs>, T, 'update', never>, never, ExtArgs>

    /**
     * Delete zero or more CompetitionSubscriptions.
     * @param {CompetitionSubscriptionDeleteManyArgs} args - Arguments to filter CompetitionSubscriptions to delete.
     * @example
     * // Delete a few CompetitionSubscriptions
     * const { count } = await prisma.competitionSubscription.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
    **/
    deleteMany<T extends CompetitionSubscriptionDeleteManyArgs<ExtArgs>>(
      args?: SelectSubset<T, CompetitionSubscriptionDeleteManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CompetitionSubscriptions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CompetitionSubscriptionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CompetitionSubscriptions
     * const competitionSubscription = await prisma.competitionSubscription.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    updateMany<T extends CompetitionSubscriptionUpdateManyArgs<ExtArgs>>(
      args: SelectSubset<T, CompetitionSubscriptionUpdateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one CompetitionSubscription.
     * @param {CompetitionSubscriptionUpsertArgs} args - Arguments to update or create a CompetitionSubscription.
     * @example
     * // Update or create a CompetitionSubscription
     * const competitionSubscription = await prisma.competitionSubscription.upsert({
     *   create: {
     *     // ... data to create a CompetitionSubscription
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CompetitionSubscription we want to update
     *   }
     * })
    **/
    upsert<T extends CompetitionSubscriptionUpsertArgs<ExtArgs>>(
      args: SelectSubset<T, CompetitionSubscriptionUpsertArgs<ExtArgs>>
    ): Prisma__CompetitionSubscriptionClient<$Types.GetResult<CompetitionSubscriptionPayload<ExtArgs>, T, 'upsert', never>, never, ExtArgs>

    /**
     * Count the number of CompetitionSubscriptions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CompetitionSubscriptionCountArgs} args - Arguments to filter CompetitionSubscriptions to count.
     * @example
     * // Count the number of CompetitionSubscriptions
     * const count = await prisma.competitionSubscription.count({
     *   where: {
     *     // ... the filter for the CompetitionSubscriptions we want to count
     *   }
     * })
    **/
    count<T extends CompetitionSubscriptionCountArgs>(
      args?: Subset<T, CompetitionSubscriptionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CompetitionSubscriptionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CompetitionSubscription.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CompetitionSubscriptionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CompetitionSubscriptionAggregateArgs>(args: Subset<T, CompetitionSubscriptionAggregateArgs>): Prisma.PrismaPromise<GetCompetitionSubscriptionAggregateType<T>>

    /**
     * Group by CompetitionSubscription.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CompetitionSubscriptionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CompetitionSubscriptionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CompetitionSubscriptionGroupByArgs['orderBy'] }
        : { orderBy?: CompetitionSubscriptionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends TupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CompetitionSubscriptionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCompetitionSubscriptionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>

  }

  /**
   * The delegate class that acts as a "Promise-like" for CompetitionSubscription.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export class Prisma__CompetitionSubscriptionClient<T, Null = never, ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> implements Prisma.PrismaPromise<T> {
    private readonly _dmmf;
    private readonly _queryType;
    private readonly _rootField;
    private readonly _clientMethod;
    private readonly _args;
    private readonly _dataPath;
    private readonly _errorFormat;
    private readonly _measurePerformance?;
    private _isList;
    private _callsite;
    private _requestPromise?;
    readonly [Symbol.toStringTag]: 'PrismaPromise';
    constructor(_dmmf: runtime.DMMFClass, _queryType: 'query' | 'mutation', _rootField: string, _clientMethod: string, _args: any, _dataPath: string[], _errorFormat: ErrorFormat, _measurePerformance?: boolean | undefined, _isList?: boolean);

    user<T extends UserArgs<ExtArgs> = {}>(args?: Subset<T, UserArgs<ExtArgs>>): Prisma__UserClient<$Types.GetResult<UserPayload<ExtArgs>, T, 'findUnique', never> | Null, never, ExtArgs>;

    private get _document();
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): Promise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): Promise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): Promise<T>;
  }



  // Custom InputTypes

  /**
   * CompetitionSubscription base type for findUnique actions
   */
  export type CompetitionSubscriptionFindUniqueArgsBase<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CompetitionSubscription
     */
    select?: CompetitionSubscriptionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: CompetitionSubscriptionInclude<ExtArgs> | null
    /**
     * Filter, which CompetitionSubscription to fetch.
     */
    where: CompetitionSubscriptionWhereUniqueInput
  }

  /**
   * CompetitionSubscription findUnique
   */
  export interface CompetitionSubscriptionFindUniqueArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> extends CompetitionSubscriptionFindUniqueArgsBase<ExtArgs> {
   /**
    * Throw an Error if query returns no results
    * @deprecated since 4.0.0: use `findUniqueOrThrow` method instead
    */
    rejectOnNotFound?: RejectOnNotFound
  }
      

  /**
   * CompetitionSubscription findUniqueOrThrow
   */
  export type CompetitionSubscriptionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CompetitionSubscription
     */
    select?: CompetitionSubscriptionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: CompetitionSubscriptionInclude<ExtArgs> | null
    /**
     * Filter, which CompetitionSubscription to fetch.
     */
    where: CompetitionSubscriptionWhereUniqueInput
  }


  /**
   * CompetitionSubscription base type for findFirst actions
   */
  export type CompetitionSubscriptionFindFirstArgsBase<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CompetitionSubscription
     */
    select?: CompetitionSubscriptionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: CompetitionSubscriptionInclude<ExtArgs> | null
    /**
     * Filter, which CompetitionSubscription to fetch.
     */
    where?: CompetitionSubscriptionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CompetitionSubscriptions to fetch.
     */
    orderBy?: Enumerable<CompetitionSubscriptionOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CompetitionSubscriptions.
     */
    cursor?: CompetitionSubscriptionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CompetitionSubscriptions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CompetitionSubscriptions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CompetitionSubscriptions.
     */
    distinct?: Enumerable<CompetitionSubscriptionScalarFieldEnum>
  }

  /**
   * CompetitionSubscription findFirst
   */
  export interface CompetitionSubscriptionFindFirstArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> extends CompetitionSubscriptionFindFirstArgsBase<ExtArgs> {
   /**
    * Throw an Error if query returns no results
    * @deprecated since 4.0.0: use `findFirstOrThrow` method instead
    */
    rejectOnNotFound?: RejectOnNotFound
  }
      

  /**
   * CompetitionSubscription findFirstOrThrow
   */
  export type CompetitionSubscriptionFindFirstOrThrowArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CompetitionSubscription
     */
    select?: CompetitionSubscriptionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: CompetitionSubscriptionInclude<ExtArgs> | null
    /**
     * Filter, which CompetitionSubscription to fetch.
     */
    where?: CompetitionSubscriptionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CompetitionSubscriptions to fetch.
     */
    orderBy?: Enumerable<CompetitionSubscriptionOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CompetitionSubscriptions.
     */
    cursor?: CompetitionSubscriptionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CompetitionSubscriptions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CompetitionSubscriptions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CompetitionSubscriptions.
     */
    distinct?: Enumerable<CompetitionSubscriptionScalarFieldEnum>
  }


  /**
   * CompetitionSubscription findMany
   */
  export type CompetitionSubscriptionFindManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CompetitionSubscription
     */
    select?: CompetitionSubscriptionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: CompetitionSubscriptionInclude<ExtArgs> | null
    /**
     * Filter, which CompetitionSubscriptions to fetch.
     */
    where?: CompetitionSubscriptionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CompetitionSubscriptions to fetch.
     */
    orderBy?: Enumerable<CompetitionSubscriptionOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CompetitionSubscriptions.
     */
    cursor?: CompetitionSubscriptionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CompetitionSubscriptions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CompetitionSubscriptions.
     */
    skip?: number
    distinct?: Enumerable<CompetitionSubscriptionScalarFieldEnum>
  }


  /**
   * CompetitionSubscription create
   */
  export type CompetitionSubscriptionCreateArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CompetitionSubscription
     */
    select?: CompetitionSubscriptionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: CompetitionSubscriptionInclude<ExtArgs> | null
    /**
     * The data needed to create a CompetitionSubscription.
     */
    data: XOR<CompetitionSubscriptionCreateInput, CompetitionSubscriptionUncheckedCreateInput>
  }


  /**
   * CompetitionSubscription createMany
   */
  export type CompetitionSubscriptionCreateManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CompetitionSubscriptions.
     */
    data: Enumerable<CompetitionSubscriptionCreateManyInput>
    skipDuplicates?: boolean
  }


  /**
   * CompetitionSubscription update
   */
  export type CompetitionSubscriptionUpdateArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CompetitionSubscription
     */
    select?: CompetitionSubscriptionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: CompetitionSubscriptionInclude<ExtArgs> | null
    /**
     * The data needed to update a CompetitionSubscription.
     */
    data: XOR<CompetitionSubscriptionUpdateInput, CompetitionSubscriptionUncheckedUpdateInput>
    /**
     * Choose, which CompetitionSubscription to update.
     */
    where: CompetitionSubscriptionWhereUniqueInput
  }


  /**
   * CompetitionSubscription updateMany
   */
  export type CompetitionSubscriptionUpdateManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CompetitionSubscriptions.
     */
    data: XOR<CompetitionSubscriptionUpdateManyMutationInput, CompetitionSubscriptionUncheckedUpdateManyInput>
    /**
     * Filter which CompetitionSubscriptions to update
     */
    where?: CompetitionSubscriptionWhereInput
  }


  /**
   * CompetitionSubscription upsert
   */
  export type CompetitionSubscriptionUpsertArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CompetitionSubscription
     */
    select?: CompetitionSubscriptionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: CompetitionSubscriptionInclude<ExtArgs> | null
    /**
     * The filter to search for the CompetitionSubscription to update in case it exists.
     */
    where: CompetitionSubscriptionWhereUniqueInput
    /**
     * In case the CompetitionSubscription found by the `where` argument doesn't exist, create a new CompetitionSubscription with this data.
     */
    create: XOR<CompetitionSubscriptionCreateInput, CompetitionSubscriptionUncheckedCreateInput>
    /**
     * In case the CompetitionSubscription was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CompetitionSubscriptionUpdateInput, CompetitionSubscriptionUncheckedUpdateInput>
  }


  /**
   * CompetitionSubscription delete
   */
  export type CompetitionSubscriptionDeleteArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CompetitionSubscription
     */
    select?: CompetitionSubscriptionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: CompetitionSubscriptionInclude<ExtArgs> | null
    /**
     * Filter which CompetitionSubscription to delete.
     */
    where: CompetitionSubscriptionWhereUniqueInput
  }


  /**
   * CompetitionSubscription deleteMany
   */
  export type CompetitionSubscriptionDeleteManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Filter which CompetitionSubscriptions to delete
     */
    where?: CompetitionSubscriptionWhereInput
  }


  /**
   * CompetitionSubscription without action
   */
  export type CompetitionSubscriptionArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CompetitionSubscription
     */
    select?: CompetitionSubscriptionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: CompetitionSubscriptionInclude<ExtArgs> | null
  }



  /**
   * Model CompetitorSubscription
   */


  export type AggregateCompetitorSubscription = {
    _count: CompetitorSubscriptionCountAggregateOutputType | null
    _avg: CompetitorSubscriptionAvgAggregateOutputType | null
    _sum: CompetitorSubscriptionSumAggregateOutputType | null
    _min: CompetitorSubscriptionMinAggregateOutputType | null
    _max: CompetitorSubscriptionMaxAggregateOutputType | null
  }

  export type CompetitorSubscriptionAvgAggregateOutputType = {
    id: number | null
    userId: number | null
    wcaUserId: number | null
  }

  export type CompetitorSubscriptionSumAggregateOutputType = {
    id: number | null
    userId: number | null
    wcaUserId: number | null
  }

  export type CompetitorSubscriptionMinAggregateOutputType = {
    id: number | null
    createdAt: Date | null
    updatedAt: Date | null
    userId: number | null
    wcaUserId: number | null
    verified: boolean | null
    code: string | null
  }

  export type CompetitorSubscriptionMaxAggregateOutputType = {
    id: number | null
    createdAt: Date | null
    updatedAt: Date | null
    userId: number | null
    wcaUserId: number | null
    verified: boolean | null
    code: string | null
  }

  export type CompetitorSubscriptionCountAggregateOutputType = {
    id: number
    createdAt: number
    updatedAt: number
    userId: number
    wcaUserId: number
    verified: number
    code: number
    _all: number
  }


  export type CompetitorSubscriptionAvgAggregateInputType = {
    id?: true
    userId?: true
    wcaUserId?: true
  }

  export type CompetitorSubscriptionSumAggregateInputType = {
    id?: true
    userId?: true
    wcaUserId?: true
  }

  export type CompetitorSubscriptionMinAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    userId?: true
    wcaUserId?: true
    verified?: true
    code?: true
  }

  export type CompetitorSubscriptionMaxAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    userId?: true
    wcaUserId?: true
    verified?: true
    code?: true
  }

  export type CompetitorSubscriptionCountAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    userId?: true
    wcaUserId?: true
    verified?: true
    code?: true
    _all?: true
  }

  export type CompetitorSubscriptionAggregateArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Filter which CompetitorSubscription to aggregate.
     */
    where?: CompetitorSubscriptionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CompetitorSubscriptions to fetch.
     */
    orderBy?: Enumerable<CompetitorSubscriptionOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CompetitorSubscriptionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CompetitorSubscriptions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CompetitorSubscriptions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CompetitorSubscriptions
    **/
    _count?: true | CompetitorSubscriptionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CompetitorSubscriptionAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CompetitorSubscriptionSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CompetitorSubscriptionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CompetitorSubscriptionMaxAggregateInputType
  }

  export type GetCompetitorSubscriptionAggregateType<T extends CompetitorSubscriptionAggregateArgs> = {
        [P in keyof T & keyof AggregateCompetitorSubscription]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCompetitorSubscription[P]>
      : GetScalarType<T[P], AggregateCompetitorSubscription[P]>
  }




  export type CompetitorSubscriptionGroupByArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    where?: CompetitorSubscriptionWhereInput
    orderBy?: Enumerable<CompetitorSubscriptionOrderByWithAggregationInput>
    by: CompetitorSubscriptionScalarFieldEnum[]
    having?: CompetitorSubscriptionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CompetitorSubscriptionCountAggregateInputType | true
    _avg?: CompetitorSubscriptionAvgAggregateInputType
    _sum?: CompetitorSubscriptionSumAggregateInputType
    _min?: CompetitorSubscriptionMinAggregateInputType
    _max?: CompetitorSubscriptionMaxAggregateInputType
  }


  export type CompetitorSubscriptionGroupByOutputType = {
    id: number
    createdAt: Date
    updatedAt: Date
    userId: number
    wcaUserId: number
    verified: boolean
    code: string
    _count: CompetitorSubscriptionCountAggregateOutputType | null
    _avg: CompetitorSubscriptionAvgAggregateOutputType | null
    _sum: CompetitorSubscriptionSumAggregateOutputType | null
    _min: CompetitorSubscriptionMinAggregateOutputType | null
    _max: CompetitorSubscriptionMaxAggregateOutputType | null
  }

  type GetCompetitorSubscriptionGroupByPayload<T extends CompetitorSubscriptionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickArray<CompetitorSubscriptionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CompetitorSubscriptionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CompetitorSubscriptionGroupByOutputType[P]>
            : GetScalarType<T[P], CompetitorSubscriptionGroupByOutputType[P]>
        }
      >
    >


  export type CompetitorSubscriptionSelect<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    userId?: boolean
    wcaUserId?: boolean
    verified?: boolean
    code?: boolean
    user?: boolean | UserArgs<ExtArgs>
  }, ExtArgs["result"]["competitorSubscription"]>

  export type CompetitorSubscriptionSelectScalar = {
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    userId?: boolean
    wcaUserId?: boolean
    verified?: boolean
    code?: boolean
  }

  export type CompetitorSubscriptionInclude<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    user?: boolean | UserArgs<ExtArgs>
  }


  type CompetitorSubscriptionGetPayload<S extends boolean | null | undefined | CompetitorSubscriptionArgs> = $Types.GetResult<CompetitorSubscriptionPayload, S>

  type CompetitorSubscriptionCountArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = 
    Omit<CompetitorSubscriptionFindManyArgs, 'select' | 'include'> & {
      select?: CompetitorSubscriptionCountAggregateInputType | true
    }

  export interface CompetitorSubscriptionDelegate<GlobalRejectSettings extends Prisma.RejectOnNotFound | Prisma.RejectPerOperation | false | undefined, ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CompetitorSubscription'], meta: { name: 'CompetitorSubscription' } }
    /**
     * Find zero or one CompetitorSubscription that matches the filter.
     * @param {CompetitorSubscriptionFindUniqueArgs} args - Arguments to find a CompetitorSubscription
     * @example
     * // Get one CompetitorSubscription
     * const competitorSubscription = await prisma.competitorSubscription.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUnique<T extends CompetitorSubscriptionFindUniqueArgs<ExtArgs>, LocalRejectSettings = T["rejectOnNotFound"] extends RejectOnNotFound ? T['rejectOnNotFound'] : undefined>(
      args: SelectSubset<T, CompetitorSubscriptionFindUniqueArgs<ExtArgs>>
    ): HasReject<GlobalRejectSettings, LocalRejectSettings, 'findUnique', 'CompetitorSubscription'> extends True ? Prisma__CompetitorSubscriptionClient<$Types.GetResult<CompetitorSubscriptionPayload<ExtArgs>, T, 'findUnique', never>, never, ExtArgs> : Prisma__CompetitorSubscriptionClient<$Types.GetResult<CompetitorSubscriptionPayload<ExtArgs>, T, 'findUnique', never> | null, null, ExtArgs>

    /**
     * Find one CompetitorSubscription that matches the filter or throw an error  with `error.code='P2025'` 
     *     if no matches were found.
     * @param {CompetitorSubscriptionFindUniqueOrThrowArgs} args - Arguments to find a CompetitorSubscription
     * @example
     * // Get one CompetitorSubscription
     * const competitorSubscription = await prisma.competitorSubscription.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUniqueOrThrow<T extends CompetitorSubscriptionFindUniqueOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, CompetitorSubscriptionFindUniqueOrThrowArgs<ExtArgs>>
    ): Prisma__CompetitorSubscriptionClient<$Types.GetResult<CompetitorSubscriptionPayload<ExtArgs>, T, 'findUniqueOrThrow', never>, never, ExtArgs>

    /**
     * Find the first CompetitorSubscription that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CompetitorSubscriptionFindFirstArgs} args - Arguments to find a CompetitorSubscription
     * @example
     * // Get one CompetitorSubscription
     * const competitorSubscription = await prisma.competitorSubscription.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirst<T extends CompetitorSubscriptionFindFirstArgs<ExtArgs>, LocalRejectSettings = T["rejectOnNotFound"] extends RejectOnNotFound ? T['rejectOnNotFound'] : undefined>(
      args?: SelectSubset<T, CompetitorSubscriptionFindFirstArgs<ExtArgs>>
    ): HasReject<GlobalRejectSettings, LocalRejectSettings, 'findFirst', 'CompetitorSubscription'> extends True ? Prisma__CompetitorSubscriptionClient<$Types.GetResult<CompetitorSubscriptionPayload<ExtArgs>, T, 'findFirst', never>, never, ExtArgs> : Prisma__CompetitorSubscriptionClient<$Types.GetResult<CompetitorSubscriptionPayload<ExtArgs>, T, 'findFirst', never> | null, null, ExtArgs>

    /**
     * Find the first CompetitorSubscription that matches the filter or
     * throw `NotFoundError` if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CompetitorSubscriptionFindFirstOrThrowArgs} args - Arguments to find a CompetitorSubscription
     * @example
     * // Get one CompetitorSubscription
     * const competitorSubscription = await prisma.competitorSubscription.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirstOrThrow<T extends CompetitorSubscriptionFindFirstOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, CompetitorSubscriptionFindFirstOrThrowArgs<ExtArgs>>
    ): Prisma__CompetitorSubscriptionClient<$Types.GetResult<CompetitorSubscriptionPayload<ExtArgs>, T, 'findFirstOrThrow', never>, never, ExtArgs>

    /**
     * Find zero or more CompetitorSubscriptions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CompetitorSubscriptionFindManyArgs=} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CompetitorSubscriptions
     * const competitorSubscriptions = await prisma.competitorSubscription.findMany()
     * 
     * // Get first 10 CompetitorSubscriptions
     * const competitorSubscriptions = await prisma.competitorSubscription.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const competitorSubscriptionWithIdOnly = await prisma.competitorSubscription.findMany({ select: { id: true } })
     * 
    **/
    findMany<T extends CompetitorSubscriptionFindManyArgs<ExtArgs>>(
      args?: SelectSubset<T, CompetitorSubscriptionFindManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Types.GetResult<CompetitorSubscriptionPayload<ExtArgs>, T, 'findMany', never>>

    /**
     * Create a CompetitorSubscription.
     * @param {CompetitorSubscriptionCreateArgs} args - Arguments to create a CompetitorSubscription.
     * @example
     * // Create one CompetitorSubscription
     * const CompetitorSubscription = await prisma.competitorSubscription.create({
     *   data: {
     *     // ... data to create a CompetitorSubscription
     *   }
     * })
     * 
    **/
    create<T extends CompetitorSubscriptionCreateArgs<ExtArgs>>(
      args: SelectSubset<T, CompetitorSubscriptionCreateArgs<ExtArgs>>
    ): Prisma__CompetitorSubscriptionClient<$Types.GetResult<CompetitorSubscriptionPayload<ExtArgs>, T, 'create', never>, never, ExtArgs>

    /**
     * Create many CompetitorSubscriptions.
     *     @param {CompetitorSubscriptionCreateManyArgs} args - Arguments to create many CompetitorSubscriptions.
     *     @example
     *     // Create many CompetitorSubscriptions
     *     const competitorSubscription = await prisma.competitorSubscription.createMany({
     *       data: {
     *         // ... provide data here
     *       }
     *     })
     *     
    **/
    createMany<T extends CompetitorSubscriptionCreateManyArgs<ExtArgs>>(
      args?: SelectSubset<T, CompetitorSubscriptionCreateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a CompetitorSubscription.
     * @param {CompetitorSubscriptionDeleteArgs} args - Arguments to delete one CompetitorSubscription.
     * @example
     * // Delete one CompetitorSubscription
     * const CompetitorSubscription = await prisma.competitorSubscription.delete({
     *   where: {
     *     // ... filter to delete one CompetitorSubscription
     *   }
     * })
     * 
    **/
    delete<T extends CompetitorSubscriptionDeleteArgs<ExtArgs>>(
      args: SelectSubset<T, CompetitorSubscriptionDeleteArgs<ExtArgs>>
    ): Prisma__CompetitorSubscriptionClient<$Types.GetResult<CompetitorSubscriptionPayload<ExtArgs>, T, 'delete', never>, never, ExtArgs>

    /**
     * Update one CompetitorSubscription.
     * @param {CompetitorSubscriptionUpdateArgs} args - Arguments to update one CompetitorSubscription.
     * @example
     * // Update one CompetitorSubscription
     * const competitorSubscription = await prisma.competitorSubscription.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    update<T extends CompetitorSubscriptionUpdateArgs<ExtArgs>>(
      args: SelectSubset<T, CompetitorSubscriptionUpdateArgs<ExtArgs>>
    ): Prisma__CompetitorSubscriptionClient<$Types.GetResult<CompetitorSubscriptionPayload<ExtArgs>, T, 'update', never>, never, ExtArgs>

    /**
     * Delete zero or more CompetitorSubscriptions.
     * @param {CompetitorSubscriptionDeleteManyArgs} args - Arguments to filter CompetitorSubscriptions to delete.
     * @example
     * // Delete a few CompetitorSubscriptions
     * const { count } = await prisma.competitorSubscription.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
    **/
    deleteMany<T extends CompetitorSubscriptionDeleteManyArgs<ExtArgs>>(
      args?: SelectSubset<T, CompetitorSubscriptionDeleteManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CompetitorSubscriptions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CompetitorSubscriptionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CompetitorSubscriptions
     * const competitorSubscription = await prisma.competitorSubscription.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    updateMany<T extends CompetitorSubscriptionUpdateManyArgs<ExtArgs>>(
      args: SelectSubset<T, CompetitorSubscriptionUpdateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one CompetitorSubscription.
     * @param {CompetitorSubscriptionUpsertArgs} args - Arguments to update or create a CompetitorSubscription.
     * @example
     * // Update or create a CompetitorSubscription
     * const competitorSubscription = await prisma.competitorSubscription.upsert({
     *   create: {
     *     // ... data to create a CompetitorSubscription
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CompetitorSubscription we want to update
     *   }
     * })
    **/
    upsert<T extends CompetitorSubscriptionUpsertArgs<ExtArgs>>(
      args: SelectSubset<T, CompetitorSubscriptionUpsertArgs<ExtArgs>>
    ): Prisma__CompetitorSubscriptionClient<$Types.GetResult<CompetitorSubscriptionPayload<ExtArgs>, T, 'upsert', never>, never, ExtArgs>

    /**
     * Count the number of CompetitorSubscriptions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CompetitorSubscriptionCountArgs} args - Arguments to filter CompetitorSubscriptions to count.
     * @example
     * // Count the number of CompetitorSubscriptions
     * const count = await prisma.competitorSubscription.count({
     *   where: {
     *     // ... the filter for the CompetitorSubscriptions we want to count
     *   }
     * })
    **/
    count<T extends CompetitorSubscriptionCountArgs>(
      args?: Subset<T, CompetitorSubscriptionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CompetitorSubscriptionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CompetitorSubscription.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CompetitorSubscriptionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CompetitorSubscriptionAggregateArgs>(args: Subset<T, CompetitorSubscriptionAggregateArgs>): Prisma.PrismaPromise<GetCompetitorSubscriptionAggregateType<T>>

    /**
     * Group by CompetitorSubscription.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CompetitorSubscriptionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CompetitorSubscriptionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CompetitorSubscriptionGroupByArgs['orderBy'] }
        : { orderBy?: CompetitorSubscriptionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends TupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CompetitorSubscriptionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCompetitorSubscriptionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>

  }

  /**
   * The delegate class that acts as a "Promise-like" for CompetitorSubscription.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export class Prisma__CompetitorSubscriptionClient<T, Null = never, ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> implements Prisma.PrismaPromise<T> {
    private readonly _dmmf;
    private readonly _queryType;
    private readonly _rootField;
    private readonly _clientMethod;
    private readonly _args;
    private readonly _dataPath;
    private readonly _errorFormat;
    private readonly _measurePerformance?;
    private _isList;
    private _callsite;
    private _requestPromise?;
    readonly [Symbol.toStringTag]: 'PrismaPromise';
    constructor(_dmmf: runtime.DMMFClass, _queryType: 'query' | 'mutation', _rootField: string, _clientMethod: string, _args: any, _dataPath: string[], _errorFormat: ErrorFormat, _measurePerformance?: boolean | undefined, _isList?: boolean);

    user<T extends UserArgs<ExtArgs> = {}>(args?: Subset<T, UserArgs<ExtArgs>>): Prisma__UserClient<$Types.GetResult<UserPayload<ExtArgs>, T, 'findUnique', never> | Null, never, ExtArgs>;

    private get _document();
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): Promise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): Promise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): Promise<T>;
  }



  // Custom InputTypes

  /**
   * CompetitorSubscription base type for findUnique actions
   */
  export type CompetitorSubscriptionFindUniqueArgsBase<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CompetitorSubscription
     */
    select?: CompetitorSubscriptionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: CompetitorSubscriptionInclude<ExtArgs> | null
    /**
     * Filter, which CompetitorSubscription to fetch.
     */
    where: CompetitorSubscriptionWhereUniqueInput
  }

  /**
   * CompetitorSubscription findUnique
   */
  export interface CompetitorSubscriptionFindUniqueArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> extends CompetitorSubscriptionFindUniqueArgsBase<ExtArgs> {
   /**
    * Throw an Error if query returns no results
    * @deprecated since 4.0.0: use `findUniqueOrThrow` method instead
    */
    rejectOnNotFound?: RejectOnNotFound
  }
      

  /**
   * CompetitorSubscription findUniqueOrThrow
   */
  export type CompetitorSubscriptionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CompetitorSubscription
     */
    select?: CompetitorSubscriptionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: CompetitorSubscriptionInclude<ExtArgs> | null
    /**
     * Filter, which CompetitorSubscription to fetch.
     */
    where: CompetitorSubscriptionWhereUniqueInput
  }


  /**
   * CompetitorSubscription base type for findFirst actions
   */
  export type CompetitorSubscriptionFindFirstArgsBase<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CompetitorSubscription
     */
    select?: CompetitorSubscriptionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: CompetitorSubscriptionInclude<ExtArgs> | null
    /**
     * Filter, which CompetitorSubscription to fetch.
     */
    where?: CompetitorSubscriptionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CompetitorSubscriptions to fetch.
     */
    orderBy?: Enumerable<CompetitorSubscriptionOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CompetitorSubscriptions.
     */
    cursor?: CompetitorSubscriptionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CompetitorSubscriptions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CompetitorSubscriptions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CompetitorSubscriptions.
     */
    distinct?: Enumerable<CompetitorSubscriptionScalarFieldEnum>
  }

  /**
   * CompetitorSubscription findFirst
   */
  export interface CompetitorSubscriptionFindFirstArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> extends CompetitorSubscriptionFindFirstArgsBase<ExtArgs> {
   /**
    * Throw an Error if query returns no results
    * @deprecated since 4.0.0: use `findFirstOrThrow` method instead
    */
    rejectOnNotFound?: RejectOnNotFound
  }
      

  /**
   * CompetitorSubscription findFirstOrThrow
   */
  export type CompetitorSubscriptionFindFirstOrThrowArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CompetitorSubscription
     */
    select?: CompetitorSubscriptionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: CompetitorSubscriptionInclude<ExtArgs> | null
    /**
     * Filter, which CompetitorSubscription to fetch.
     */
    where?: CompetitorSubscriptionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CompetitorSubscriptions to fetch.
     */
    orderBy?: Enumerable<CompetitorSubscriptionOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CompetitorSubscriptions.
     */
    cursor?: CompetitorSubscriptionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CompetitorSubscriptions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CompetitorSubscriptions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CompetitorSubscriptions.
     */
    distinct?: Enumerable<CompetitorSubscriptionScalarFieldEnum>
  }


  /**
   * CompetitorSubscription findMany
   */
  export type CompetitorSubscriptionFindManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CompetitorSubscription
     */
    select?: CompetitorSubscriptionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: CompetitorSubscriptionInclude<ExtArgs> | null
    /**
     * Filter, which CompetitorSubscriptions to fetch.
     */
    where?: CompetitorSubscriptionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CompetitorSubscriptions to fetch.
     */
    orderBy?: Enumerable<CompetitorSubscriptionOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CompetitorSubscriptions.
     */
    cursor?: CompetitorSubscriptionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CompetitorSubscriptions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CompetitorSubscriptions.
     */
    skip?: number
    distinct?: Enumerable<CompetitorSubscriptionScalarFieldEnum>
  }


  /**
   * CompetitorSubscription create
   */
  export type CompetitorSubscriptionCreateArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CompetitorSubscription
     */
    select?: CompetitorSubscriptionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: CompetitorSubscriptionInclude<ExtArgs> | null
    /**
     * The data needed to create a CompetitorSubscription.
     */
    data: XOR<CompetitorSubscriptionCreateInput, CompetitorSubscriptionUncheckedCreateInput>
  }


  /**
   * CompetitorSubscription createMany
   */
  export type CompetitorSubscriptionCreateManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CompetitorSubscriptions.
     */
    data: Enumerable<CompetitorSubscriptionCreateManyInput>
    skipDuplicates?: boolean
  }


  /**
   * CompetitorSubscription update
   */
  export type CompetitorSubscriptionUpdateArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CompetitorSubscription
     */
    select?: CompetitorSubscriptionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: CompetitorSubscriptionInclude<ExtArgs> | null
    /**
     * The data needed to update a CompetitorSubscription.
     */
    data: XOR<CompetitorSubscriptionUpdateInput, CompetitorSubscriptionUncheckedUpdateInput>
    /**
     * Choose, which CompetitorSubscription to update.
     */
    where: CompetitorSubscriptionWhereUniqueInput
  }


  /**
   * CompetitorSubscription updateMany
   */
  export type CompetitorSubscriptionUpdateManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CompetitorSubscriptions.
     */
    data: XOR<CompetitorSubscriptionUpdateManyMutationInput, CompetitorSubscriptionUncheckedUpdateManyInput>
    /**
     * Filter which CompetitorSubscriptions to update
     */
    where?: CompetitorSubscriptionWhereInput
  }


  /**
   * CompetitorSubscription upsert
   */
  export type CompetitorSubscriptionUpsertArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CompetitorSubscription
     */
    select?: CompetitorSubscriptionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: CompetitorSubscriptionInclude<ExtArgs> | null
    /**
     * The filter to search for the CompetitorSubscription to update in case it exists.
     */
    where: CompetitorSubscriptionWhereUniqueInput
    /**
     * In case the CompetitorSubscription found by the `where` argument doesn't exist, create a new CompetitorSubscription with this data.
     */
    create: XOR<CompetitorSubscriptionCreateInput, CompetitorSubscriptionUncheckedCreateInput>
    /**
     * In case the CompetitorSubscription was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CompetitorSubscriptionUpdateInput, CompetitorSubscriptionUncheckedUpdateInput>
  }


  /**
   * CompetitorSubscription delete
   */
  export type CompetitorSubscriptionDeleteArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CompetitorSubscription
     */
    select?: CompetitorSubscriptionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: CompetitorSubscriptionInclude<ExtArgs> | null
    /**
     * Filter which CompetitorSubscription to delete.
     */
    where: CompetitorSubscriptionWhereUniqueInput
  }


  /**
   * CompetitorSubscription deleteMany
   */
  export type CompetitorSubscriptionDeleteManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Filter which CompetitorSubscriptions to delete
     */
    where?: CompetitorSubscriptionWhereInput
  }


  /**
   * CompetitorSubscription without action
   */
  export type CompetitorSubscriptionArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CompetitorSubscription
     */
    select?: CompetitorSubscriptionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: CompetitorSubscriptionInclude<ExtArgs> | null
  }



  /**
   * Model CompetitionSid
   */


  export type AggregateCompetitionSid = {
    _count: CompetitionSidCountAggregateOutputType | null
    _min: CompetitionSidMinAggregateOutputType | null
    _max: CompetitionSidMaxAggregateOutputType | null
  }

  export type CompetitionSidMinAggregateOutputType = {
    createdAt: Date | null
    updatedAt: Date | null
    competitionId: string | null
    sid: string | null
  }

  export type CompetitionSidMaxAggregateOutputType = {
    createdAt: Date | null
    updatedAt: Date | null
    competitionId: string | null
    sid: string | null
  }

  export type CompetitionSidCountAggregateOutputType = {
    createdAt: number
    updatedAt: number
    competitionId: number
    sid: number
    _all: number
  }


  export type CompetitionSidMinAggregateInputType = {
    createdAt?: true
    updatedAt?: true
    competitionId?: true
    sid?: true
  }

  export type CompetitionSidMaxAggregateInputType = {
    createdAt?: true
    updatedAt?: true
    competitionId?: true
    sid?: true
  }

  export type CompetitionSidCountAggregateInputType = {
    createdAt?: true
    updatedAt?: true
    competitionId?: true
    sid?: true
    _all?: true
  }

  export type CompetitionSidAggregateArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Filter which CompetitionSid to aggregate.
     */
    where?: CompetitionSidWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CompetitionSids to fetch.
     */
    orderBy?: Enumerable<CompetitionSidOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CompetitionSidWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CompetitionSids from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CompetitionSids.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CompetitionSids
    **/
    _count?: true | CompetitionSidCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CompetitionSidMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CompetitionSidMaxAggregateInputType
  }

  export type GetCompetitionSidAggregateType<T extends CompetitionSidAggregateArgs> = {
        [P in keyof T & keyof AggregateCompetitionSid]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCompetitionSid[P]>
      : GetScalarType<T[P], AggregateCompetitionSid[P]>
  }




  export type CompetitionSidGroupByArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    where?: CompetitionSidWhereInput
    orderBy?: Enumerable<CompetitionSidOrderByWithAggregationInput>
    by: CompetitionSidScalarFieldEnum[]
    having?: CompetitionSidScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CompetitionSidCountAggregateInputType | true
    _min?: CompetitionSidMinAggregateInputType
    _max?: CompetitionSidMaxAggregateInputType
  }


  export type CompetitionSidGroupByOutputType = {
    createdAt: Date
    updatedAt: Date
    competitionId: string
    sid: string
    _count: CompetitionSidCountAggregateOutputType | null
    _min: CompetitionSidMinAggregateOutputType | null
    _max: CompetitionSidMaxAggregateOutputType | null
  }

  type GetCompetitionSidGroupByPayload<T extends CompetitionSidGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickArray<CompetitionSidGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CompetitionSidGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CompetitionSidGroupByOutputType[P]>
            : GetScalarType<T[P], CompetitionSidGroupByOutputType[P]>
        }
      >
    >


  export type CompetitionSidSelect<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    createdAt?: boolean
    updatedAt?: boolean
    competitionId?: boolean
    sid?: boolean
  }, ExtArgs["result"]["competitionSid"]>

  export type CompetitionSidSelectScalar = {
    createdAt?: boolean
    updatedAt?: boolean
    competitionId?: boolean
    sid?: boolean
  }


  type CompetitionSidGetPayload<S extends boolean | null | undefined | CompetitionSidArgs> = $Types.GetResult<CompetitionSidPayload, S>

  type CompetitionSidCountArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = 
    Omit<CompetitionSidFindManyArgs, 'select' | 'include'> & {
      select?: CompetitionSidCountAggregateInputType | true
    }

  export interface CompetitionSidDelegate<GlobalRejectSettings extends Prisma.RejectOnNotFound | Prisma.RejectPerOperation | false | undefined, ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CompetitionSid'], meta: { name: 'CompetitionSid' } }
    /**
     * Find zero or one CompetitionSid that matches the filter.
     * @param {CompetitionSidFindUniqueArgs} args - Arguments to find a CompetitionSid
     * @example
     * // Get one CompetitionSid
     * const competitionSid = await prisma.competitionSid.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUnique<T extends CompetitionSidFindUniqueArgs<ExtArgs>, LocalRejectSettings = T["rejectOnNotFound"] extends RejectOnNotFound ? T['rejectOnNotFound'] : undefined>(
      args: SelectSubset<T, CompetitionSidFindUniqueArgs<ExtArgs>>
    ): HasReject<GlobalRejectSettings, LocalRejectSettings, 'findUnique', 'CompetitionSid'> extends True ? Prisma__CompetitionSidClient<$Types.GetResult<CompetitionSidPayload<ExtArgs>, T, 'findUnique', never>, never, ExtArgs> : Prisma__CompetitionSidClient<$Types.GetResult<CompetitionSidPayload<ExtArgs>, T, 'findUnique', never> | null, null, ExtArgs>

    /**
     * Find one CompetitionSid that matches the filter or throw an error  with `error.code='P2025'` 
     *     if no matches were found.
     * @param {CompetitionSidFindUniqueOrThrowArgs} args - Arguments to find a CompetitionSid
     * @example
     * // Get one CompetitionSid
     * const competitionSid = await prisma.competitionSid.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUniqueOrThrow<T extends CompetitionSidFindUniqueOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, CompetitionSidFindUniqueOrThrowArgs<ExtArgs>>
    ): Prisma__CompetitionSidClient<$Types.GetResult<CompetitionSidPayload<ExtArgs>, T, 'findUniqueOrThrow', never>, never, ExtArgs>

    /**
     * Find the first CompetitionSid that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CompetitionSidFindFirstArgs} args - Arguments to find a CompetitionSid
     * @example
     * // Get one CompetitionSid
     * const competitionSid = await prisma.competitionSid.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirst<T extends CompetitionSidFindFirstArgs<ExtArgs>, LocalRejectSettings = T["rejectOnNotFound"] extends RejectOnNotFound ? T['rejectOnNotFound'] : undefined>(
      args?: SelectSubset<T, CompetitionSidFindFirstArgs<ExtArgs>>
    ): HasReject<GlobalRejectSettings, LocalRejectSettings, 'findFirst', 'CompetitionSid'> extends True ? Prisma__CompetitionSidClient<$Types.GetResult<CompetitionSidPayload<ExtArgs>, T, 'findFirst', never>, never, ExtArgs> : Prisma__CompetitionSidClient<$Types.GetResult<CompetitionSidPayload<ExtArgs>, T, 'findFirst', never> | null, null, ExtArgs>

    /**
     * Find the first CompetitionSid that matches the filter or
     * throw `NotFoundError` if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CompetitionSidFindFirstOrThrowArgs} args - Arguments to find a CompetitionSid
     * @example
     * // Get one CompetitionSid
     * const competitionSid = await prisma.competitionSid.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirstOrThrow<T extends CompetitionSidFindFirstOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, CompetitionSidFindFirstOrThrowArgs<ExtArgs>>
    ): Prisma__CompetitionSidClient<$Types.GetResult<CompetitionSidPayload<ExtArgs>, T, 'findFirstOrThrow', never>, never, ExtArgs>

    /**
     * Find zero or more CompetitionSids that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CompetitionSidFindManyArgs=} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CompetitionSids
     * const competitionSids = await prisma.competitionSid.findMany()
     * 
     * // Get first 10 CompetitionSids
     * const competitionSids = await prisma.competitionSid.findMany({ take: 10 })
     * 
     * // Only select the `createdAt`
     * const competitionSidWithCreatedAtOnly = await prisma.competitionSid.findMany({ select: { createdAt: true } })
     * 
    **/
    findMany<T extends CompetitionSidFindManyArgs<ExtArgs>>(
      args?: SelectSubset<T, CompetitionSidFindManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Types.GetResult<CompetitionSidPayload<ExtArgs>, T, 'findMany', never>>

    /**
     * Create a CompetitionSid.
     * @param {CompetitionSidCreateArgs} args - Arguments to create a CompetitionSid.
     * @example
     * // Create one CompetitionSid
     * const CompetitionSid = await prisma.competitionSid.create({
     *   data: {
     *     // ... data to create a CompetitionSid
     *   }
     * })
     * 
    **/
    create<T extends CompetitionSidCreateArgs<ExtArgs>>(
      args: SelectSubset<T, CompetitionSidCreateArgs<ExtArgs>>
    ): Prisma__CompetitionSidClient<$Types.GetResult<CompetitionSidPayload<ExtArgs>, T, 'create', never>, never, ExtArgs>

    /**
     * Create many CompetitionSids.
     *     @param {CompetitionSidCreateManyArgs} args - Arguments to create many CompetitionSids.
     *     @example
     *     // Create many CompetitionSids
     *     const competitionSid = await prisma.competitionSid.createMany({
     *       data: {
     *         // ... provide data here
     *       }
     *     })
     *     
    **/
    createMany<T extends CompetitionSidCreateManyArgs<ExtArgs>>(
      args?: SelectSubset<T, CompetitionSidCreateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a CompetitionSid.
     * @param {CompetitionSidDeleteArgs} args - Arguments to delete one CompetitionSid.
     * @example
     * // Delete one CompetitionSid
     * const CompetitionSid = await prisma.competitionSid.delete({
     *   where: {
     *     // ... filter to delete one CompetitionSid
     *   }
     * })
     * 
    **/
    delete<T extends CompetitionSidDeleteArgs<ExtArgs>>(
      args: SelectSubset<T, CompetitionSidDeleteArgs<ExtArgs>>
    ): Prisma__CompetitionSidClient<$Types.GetResult<CompetitionSidPayload<ExtArgs>, T, 'delete', never>, never, ExtArgs>

    /**
     * Update one CompetitionSid.
     * @param {CompetitionSidUpdateArgs} args - Arguments to update one CompetitionSid.
     * @example
     * // Update one CompetitionSid
     * const competitionSid = await prisma.competitionSid.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    update<T extends CompetitionSidUpdateArgs<ExtArgs>>(
      args: SelectSubset<T, CompetitionSidUpdateArgs<ExtArgs>>
    ): Prisma__CompetitionSidClient<$Types.GetResult<CompetitionSidPayload<ExtArgs>, T, 'update', never>, never, ExtArgs>

    /**
     * Delete zero or more CompetitionSids.
     * @param {CompetitionSidDeleteManyArgs} args - Arguments to filter CompetitionSids to delete.
     * @example
     * // Delete a few CompetitionSids
     * const { count } = await prisma.competitionSid.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
    **/
    deleteMany<T extends CompetitionSidDeleteManyArgs<ExtArgs>>(
      args?: SelectSubset<T, CompetitionSidDeleteManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CompetitionSids.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CompetitionSidUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CompetitionSids
     * const competitionSid = await prisma.competitionSid.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    updateMany<T extends CompetitionSidUpdateManyArgs<ExtArgs>>(
      args: SelectSubset<T, CompetitionSidUpdateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one CompetitionSid.
     * @param {CompetitionSidUpsertArgs} args - Arguments to update or create a CompetitionSid.
     * @example
     * // Update or create a CompetitionSid
     * const competitionSid = await prisma.competitionSid.upsert({
     *   create: {
     *     // ... data to create a CompetitionSid
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CompetitionSid we want to update
     *   }
     * })
    **/
    upsert<T extends CompetitionSidUpsertArgs<ExtArgs>>(
      args: SelectSubset<T, CompetitionSidUpsertArgs<ExtArgs>>
    ): Prisma__CompetitionSidClient<$Types.GetResult<CompetitionSidPayload<ExtArgs>, T, 'upsert', never>, never, ExtArgs>

    /**
     * Count the number of CompetitionSids.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CompetitionSidCountArgs} args - Arguments to filter CompetitionSids to count.
     * @example
     * // Count the number of CompetitionSids
     * const count = await prisma.competitionSid.count({
     *   where: {
     *     // ... the filter for the CompetitionSids we want to count
     *   }
     * })
    **/
    count<T extends CompetitionSidCountArgs>(
      args?: Subset<T, CompetitionSidCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CompetitionSidCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CompetitionSid.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CompetitionSidAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CompetitionSidAggregateArgs>(args: Subset<T, CompetitionSidAggregateArgs>): Prisma.PrismaPromise<GetCompetitionSidAggregateType<T>>

    /**
     * Group by CompetitionSid.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CompetitionSidGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CompetitionSidGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CompetitionSidGroupByArgs['orderBy'] }
        : { orderBy?: CompetitionSidGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends TupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CompetitionSidGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCompetitionSidGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>

  }

  /**
   * The delegate class that acts as a "Promise-like" for CompetitionSid.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export class Prisma__CompetitionSidClient<T, Null = never, ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> implements Prisma.PrismaPromise<T> {
    private readonly _dmmf;
    private readonly _queryType;
    private readonly _rootField;
    private readonly _clientMethod;
    private readonly _args;
    private readonly _dataPath;
    private readonly _errorFormat;
    private readonly _measurePerformance?;
    private _isList;
    private _callsite;
    private _requestPromise?;
    readonly [Symbol.toStringTag]: 'PrismaPromise';
    constructor(_dmmf: runtime.DMMFClass, _queryType: 'query' | 'mutation', _rootField: string, _clientMethod: string, _args: any, _dataPath: string[], _errorFormat: ErrorFormat, _measurePerformance?: boolean | undefined, _isList?: boolean);


    private get _document();
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): Promise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): Promise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): Promise<T>;
  }



  // Custom InputTypes

  /**
   * CompetitionSid base type for findUnique actions
   */
  export type CompetitionSidFindUniqueArgsBase<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CompetitionSid
     */
    select?: CompetitionSidSelect<ExtArgs> | null
    /**
     * Filter, which CompetitionSid to fetch.
     */
    where: CompetitionSidWhereUniqueInput
  }

  /**
   * CompetitionSid findUnique
   */
  export interface CompetitionSidFindUniqueArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> extends CompetitionSidFindUniqueArgsBase<ExtArgs> {
   /**
    * Throw an Error if query returns no results
    * @deprecated since 4.0.0: use `findUniqueOrThrow` method instead
    */
    rejectOnNotFound?: RejectOnNotFound
  }
      

  /**
   * CompetitionSid findUniqueOrThrow
   */
  export type CompetitionSidFindUniqueOrThrowArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CompetitionSid
     */
    select?: CompetitionSidSelect<ExtArgs> | null
    /**
     * Filter, which CompetitionSid to fetch.
     */
    where: CompetitionSidWhereUniqueInput
  }


  /**
   * CompetitionSid base type for findFirst actions
   */
  export type CompetitionSidFindFirstArgsBase<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CompetitionSid
     */
    select?: CompetitionSidSelect<ExtArgs> | null
    /**
     * Filter, which CompetitionSid to fetch.
     */
    where?: CompetitionSidWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CompetitionSids to fetch.
     */
    orderBy?: Enumerable<CompetitionSidOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CompetitionSids.
     */
    cursor?: CompetitionSidWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CompetitionSids from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CompetitionSids.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CompetitionSids.
     */
    distinct?: Enumerable<CompetitionSidScalarFieldEnum>
  }

  /**
   * CompetitionSid findFirst
   */
  export interface CompetitionSidFindFirstArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> extends CompetitionSidFindFirstArgsBase<ExtArgs> {
   /**
    * Throw an Error if query returns no results
    * @deprecated since 4.0.0: use `findFirstOrThrow` method instead
    */
    rejectOnNotFound?: RejectOnNotFound
  }
      

  /**
   * CompetitionSid findFirstOrThrow
   */
  export type CompetitionSidFindFirstOrThrowArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CompetitionSid
     */
    select?: CompetitionSidSelect<ExtArgs> | null
    /**
     * Filter, which CompetitionSid to fetch.
     */
    where?: CompetitionSidWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CompetitionSids to fetch.
     */
    orderBy?: Enumerable<CompetitionSidOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CompetitionSids.
     */
    cursor?: CompetitionSidWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CompetitionSids from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CompetitionSids.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CompetitionSids.
     */
    distinct?: Enumerable<CompetitionSidScalarFieldEnum>
  }


  /**
   * CompetitionSid findMany
   */
  export type CompetitionSidFindManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CompetitionSid
     */
    select?: CompetitionSidSelect<ExtArgs> | null
    /**
     * Filter, which CompetitionSids to fetch.
     */
    where?: CompetitionSidWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CompetitionSids to fetch.
     */
    orderBy?: Enumerable<CompetitionSidOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CompetitionSids.
     */
    cursor?: CompetitionSidWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CompetitionSids from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CompetitionSids.
     */
    skip?: number
    distinct?: Enumerable<CompetitionSidScalarFieldEnum>
  }


  /**
   * CompetitionSid create
   */
  export type CompetitionSidCreateArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CompetitionSid
     */
    select?: CompetitionSidSelect<ExtArgs> | null
    /**
     * The data needed to create a CompetitionSid.
     */
    data: XOR<CompetitionSidCreateInput, CompetitionSidUncheckedCreateInput>
  }


  /**
   * CompetitionSid createMany
   */
  export type CompetitionSidCreateManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CompetitionSids.
     */
    data: Enumerable<CompetitionSidCreateManyInput>
    skipDuplicates?: boolean
  }


  /**
   * CompetitionSid update
   */
  export type CompetitionSidUpdateArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CompetitionSid
     */
    select?: CompetitionSidSelect<ExtArgs> | null
    /**
     * The data needed to update a CompetitionSid.
     */
    data: XOR<CompetitionSidUpdateInput, CompetitionSidUncheckedUpdateInput>
    /**
     * Choose, which CompetitionSid to update.
     */
    where: CompetitionSidWhereUniqueInput
  }


  /**
   * CompetitionSid updateMany
   */
  export type CompetitionSidUpdateManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CompetitionSids.
     */
    data: XOR<CompetitionSidUpdateManyMutationInput, CompetitionSidUncheckedUpdateManyInput>
    /**
     * Filter which CompetitionSids to update
     */
    where?: CompetitionSidWhereInput
  }


  /**
   * CompetitionSid upsert
   */
  export type CompetitionSidUpsertArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CompetitionSid
     */
    select?: CompetitionSidSelect<ExtArgs> | null
    /**
     * The filter to search for the CompetitionSid to update in case it exists.
     */
    where: CompetitionSidWhereUniqueInput
    /**
     * In case the CompetitionSid found by the `where` argument doesn't exist, create a new CompetitionSid with this data.
     */
    create: XOR<CompetitionSidCreateInput, CompetitionSidUncheckedCreateInput>
    /**
     * In case the CompetitionSid was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CompetitionSidUpdateInput, CompetitionSidUncheckedUpdateInput>
  }


  /**
   * CompetitionSid delete
   */
  export type CompetitionSidDeleteArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CompetitionSid
     */
    select?: CompetitionSidSelect<ExtArgs> | null
    /**
     * Filter which CompetitionSid to delete.
     */
    where: CompetitionSidWhereUniqueInput
  }


  /**
   * CompetitionSid deleteMany
   */
  export type CompetitionSidDeleteManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Filter which CompetitionSids to delete
     */
    where?: CompetitionSidWhereInput
  }


  /**
   * CompetitionSid without action
   */
  export type CompetitionSidArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CompetitionSid
     */
    select?: CompetitionSidSelect<ExtArgs> | null
  }



  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const AuditLogScalarFieldEnum: {
    id: 'id',
    action: 'action',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    userId: 'userId',
    competitionId: 'competitionId'
  };

  export type AuditLogScalarFieldEnum = (typeof AuditLogScalarFieldEnum)[keyof typeof AuditLogScalarFieldEnum]


  export const UserScalarFieldEnum: {
    id: 'id',
    phoneNumber: 'phoneNumber'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const SessionScalarFieldEnum: {
    id: 'id',
    sid: 'sid',
    data: 'data',
    expiresAt: 'expiresAt'
  };

  export type SessionScalarFieldEnum = (typeof SessionScalarFieldEnum)[keyof typeof SessionScalarFieldEnum]


  export const CompetitionSubscriptionScalarFieldEnum: {
    id: 'id',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    userId: 'userId',
    competitionId: 'competitionId',
    type: 'type',
    value: 'value'
  };

  export type CompetitionSubscriptionScalarFieldEnum = (typeof CompetitionSubscriptionScalarFieldEnum)[keyof typeof CompetitionSubscriptionScalarFieldEnum]


  export const CompetitorSubscriptionScalarFieldEnum: {
    id: 'id',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    userId: 'userId',
    wcaUserId: 'wcaUserId',
    verified: 'verified',
    code: 'code'
  };

  export type CompetitorSubscriptionScalarFieldEnum = (typeof CompetitorSubscriptionScalarFieldEnum)[keyof typeof CompetitorSubscriptionScalarFieldEnum]


  export const CompetitionSidScalarFieldEnum: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    competitionId: 'competitionId',
    sid: 'sid'
  };

  export type CompetitionSidScalarFieldEnum = (typeof CompetitionSidScalarFieldEnum)[keyof typeof CompetitionSidScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  /**
   * Deep Input Types
   */


  export type AuditLogWhereInput = {
    AND?: Enumerable<AuditLogWhereInput>
    OR?: Enumerable<AuditLogWhereInput>
    NOT?: Enumerable<AuditLogWhereInput>
    id?: IntFilter | number
    action?: StringFilter | string
    createdAt?: DateTimeFilter | Date | string
    updatedAt?: DateTimeFilter | Date | string
    userId?: IntFilter | number
    competitionId?: StringFilter | string
    user?: XOR<UserRelationFilter, UserWhereInput>
  }

  export type AuditLogOrderByWithRelationInput = {
    id?: SortOrder
    action?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    competitionId?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type AuditLogWhereUniqueInput = {
    id?: number
  }

  export type AuditLogOrderByWithAggregationInput = {
    id?: SortOrder
    action?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    competitionId?: SortOrder
    _count?: AuditLogCountOrderByAggregateInput
    _avg?: AuditLogAvgOrderByAggregateInput
    _max?: AuditLogMaxOrderByAggregateInput
    _min?: AuditLogMinOrderByAggregateInput
    _sum?: AuditLogSumOrderByAggregateInput
  }

  export type AuditLogScalarWhereWithAggregatesInput = {
    AND?: Enumerable<AuditLogScalarWhereWithAggregatesInput>
    OR?: Enumerable<AuditLogScalarWhereWithAggregatesInput>
    NOT?: Enumerable<AuditLogScalarWhereWithAggregatesInput>
    id?: IntWithAggregatesFilter | number
    action?: StringWithAggregatesFilter | string
    createdAt?: DateTimeWithAggregatesFilter | Date | string
    updatedAt?: DateTimeWithAggregatesFilter | Date | string
    userId?: IntWithAggregatesFilter | number
    competitionId?: StringWithAggregatesFilter | string
  }

  export type UserWhereInput = {
    AND?: Enumerable<UserWhereInput>
    OR?: Enumerable<UserWhereInput>
    NOT?: Enumerable<UserWhereInput>
    id?: IntFilter | number
    phoneNumber?: StringFilter | string
    AuditLog?: AuditLogListRelationFilter
    CompetitionSubscription?: CompetitionSubscriptionListRelationFilter
    CompetitorSubscription?: CompetitorSubscriptionListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    phoneNumber?: SortOrder
    AuditLog?: AuditLogOrderByRelationAggregateInput
    CompetitionSubscription?: CompetitionSubscriptionOrderByRelationAggregateInput
    CompetitorSubscription?: CompetitorSubscriptionOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = {
    id?: number
    phoneNumber?: string
  }

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    phoneNumber?: SortOrder
    _count?: UserCountOrderByAggregateInput
    _avg?: UserAvgOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
    _sum?: UserSumOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: Enumerable<UserScalarWhereWithAggregatesInput>
    OR?: Enumerable<UserScalarWhereWithAggregatesInput>
    NOT?: Enumerable<UserScalarWhereWithAggregatesInput>
    id?: IntWithAggregatesFilter | number
    phoneNumber?: StringWithAggregatesFilter | string
  }

  export type SessionWhereInput = {
    AND?: Enumerable<SessionWhereInput>
    OR?: Enumerable<SessionWhereInput>
    NOT?: Enumerable<SessionWhereInput>
    id?: StringFilter | string
    sid?: StringFilter | string
    data?: StringFilter | string
    expiresAt?: DateTimeFilter | Date | string
  }

  export type SessionOrderByWithRelationInput = {
    id?: SortOrder
    sid?: SortOrder
    data?: SortOrder
    expiresAt?: SortOrder
  }

  export type SessionWhereUniqueInput = {
    id?: string
    sid?: string
  }

  export type SessionOrderByWithAggregationInput = {
    id?: SortOrder
    sid?: SortOrder
    data?: SortOrder
    expiresAt?: SortOrder
    _count?: SessionCountOrderByAggregateInput
    _max?: SessionMaxOrderByAggregateInput
    _min?: SessionMinOrderByAggregateInput
  }

  export type SessionScalarWhereWithAggregatesInput = {
    AND?: Enumerable<SessionScalarWhereWithAggregatesInput>
    OR?: Enumerable<SessionScalarWhereWithAggregatesInput>
    NOT?: Enumerable<SessionScalarWhereWithAggregatesInput>
    id?: StringWithAggregatesFilter | string
    sid?: StringWithAggregatesFilter | string
    data?: StringWithAggregatesFilter | string
    expiresAt?: DateTimeWithAggregatesFilter | Date | string
  }

  export type CompetitionSubscriptionWhereInput = {
    AND?: Enumerable<CompetitionSubscriptionWhereInput>
    OR?: Enumerable<CompetitionSubscriptionWhereInput>
    NOT?: Enumerable<CompetitionSubscriptionWhereInput>
    id?: IntFilter | number
    createdAt?: DateTimeFilter | Date | string
    updatedAt?: DateTimeFilter | Date | string
    userId?: IntFilter | number
    competitionId?: StringFilter | string
    type?: EnumCompetitionSubscriptionTypeFilter | CompetitionSubscriptionType
    value?: StringFilter | string
    user?: XOR<UserRelationFilter, UserWhereInput>
  }

  export type CompetitionSubscriptionOrderByWithRelationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    competitionId?: SortOrder
    type?: SortOrder
    value?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type CompetitionSubscriptionWhereUniqueInput = {
    id?: number
    userId_competitionId_type_value?: CompetitionSubscriptionUserIdCompetitionIdTypeValueCompoundUniqueInput
  }

  export type CompetitionSubscriptionOrderByWithAggregationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    competitionId?: SortOrder
    type?: SortOrder
    value?: SortOrder
    _count?: CompetitionSubscriptionCountOrderByAggregateInput
    _avg?: CompetitionSubscriptionAvgOrderByAggregateInput
    _max?: CompetitionSubscriptionMaxOrderByAggregateInput
    _min?: CompetitionSubscriptionMinOrderByAggregateInput
    _sum?: CompetitionSubscriptionSumOrderByAggregateInput
  }

  export type CompetitionSubscriptionScalarWhereWithAggregatesInput = {
    AND?: Enumerable<CompetitionSubscriptionScalarWhereWithAggregatesInput>
    OR?: Enumerable<CompetitionSubscriptionScalarWhereWithAggregatesInput>
    NOT?: Enumerable<CompetitionSubscriptionScalarWhereWithAggregatesInput>
    id?: IntWithAggregatesFilter | number
    createdAt?: DateTimeWithAggregatesFilter | Date | string
    updatedAt?: DateTimeWithAggregatesFilter | Date | string
    userId?: IntWithAggregatesFilter | number
    competitionId?: StringWithAggregatesFilter | string
    type?: EnumCompetitionSubscriptionTypeWithAggregatesFilter | CompetitionSubscriptionType
    value?: StringWithAggregatesFilter | string
  }

  export type CompetitorSubscriptionWhereInput = {
    AND?: Enumerable<CompetitorSubscriptionWhereInput>
    OR?: Enumerable<CompetitorSubscriptionWhereInput>
    NOT?: Enumerable<CompetitorSubscriptionWhereInput>
    id?: IntFilter | number
    createdAt?: DateTimeFilter | Date | string
    updatedAt?: DateTimeFilter | Date | string
    userId?: IntFilter | number
    wcaUserId?: IntFilter | number
    verified?: BoolFilter | boolean
    code?: StringFilter | string
    user?: XOR<UserRelationFilter, UserWhereInput>
  }

  export type CompetitorSubscriptionOrderByWithRelationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    wcaUserId?: SortOrder
    verified?: SortOrder
    code?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type CompetitorSubscriptionWhereUniqueInput = {
    id?: number
    userId_wcaUserId?: CompetitorSubscriptionUserIdWcaUserIdCompoundUniqueInput
  }

  export type CompetitorSubscriptionOrderByWithAggregationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    wcaUserId?: SortOrder
    verified?: SortOrder
    code?: SortOrder
    _count?: CompetitorSubscriptionCountOrderByAggregateInput
    _avg?: CompetitorSubscriptionAvgOrderByAggregateInput
    _max?: CompetitorSubscriptionMaxOrderByAggregateInput
    _min?: CompetitorSubscriptionMinOrderByAggregateInput
    _sum?: CompetitorSubscriptionSumOrderByAggregateInput
  }

  export type CompetitorSubscriptionScalarWhereWithAggregatesInput = {
    AND?: Enumerable<CompetitorSubscriptionScalarWhereWithAggregatesInput>
    OR?: Enumerable<CompetitorSubscriptionScalarWhereWithAggregatesInput>
    NOT?: Enumerable<CompetitorSubscriptionScalarWhereWithAggregatesInput>
    id?: IntWithAggregatesFilter | number
    createdAt?: DateTimeWithAggregatesFilter | Date | string
    updatedAt?: DateTimeWithAggregatesFilter | Date | string
    userId?: IntWithAggregatesFilter | number
    wcaUserId?: IntWithAggregatesFilter | number
    verified?: BoolWithAggregatesFilter | boolean
    code?: StringWithAggregatesFilter | string
  }

  export type CompetitionSidWhereInput = {
    AND?: Enumerable<CompetitionSidWhereInput>
    OR?: Enumerable<CompetitionSidWhereInput>
    NOT?: Enumerable<CompetitionSidWhereInput>
    createdAt?: DateTimeFilter | Date | string
    updatedAt?: DateTimeFilter | Date | string
    competitionId?: StringFilter | string
    sid?: StringFilter | string
  }

  export type CompetitionSidOrderByWithRelationInput = {
    createdAt?: SortOrder
    updatedAt?: SortOrder
    competitionId?: SortOrder
    sid?: SortOrder
  }

  export type CompetitionSidWhereUniqueInput = {
    competitionId?: string
  }

  export type CompetitionSidOrderByWithAggregationInput = {
    createdAt?: SortOrder
    updatedAt?: SortOrder
    competitionId?: SortOrder
    sid?: SortOrder
    _count?: CompetitionSidCountOrderByAggregateInput
    _max?: CompetitionSidMaxOrderByAggregateInput
    _min?: CompetitionSidMinOrderByAggregateInput
  }

  export type CompetitionSidScalarWhereWithAggregatesInput = {
    AND?: Enumerable<CompetitionSidScalarWhereWithAggregatesInput>
    OR?: Enumerable<CompetitionSidScalarWhereWithAggregatesInput>
    NOT?: Enumerable<CompetitionSidScalarWhereWithAggregatesInput>
    createdAt?: DateTimeWithAggregatesFilter | Date | string
    updatedAt?: DateTimeWithAggregatesFilter | Date | string
    competitionId?: StringWithAggregatesFilter | string
    sid?: StringWithAggregatesFilter | string
  }

  export type AuditLogCreateInput = {
    action: string
    createdAt?: Date | string
    updatedAt?: Date | string
    competitionId: string
    user: UserCreateNestedOneWithoutAuditLogInput
  }

  export type AuditLogUncheckedCreateInput = {
    id?: number
    action: string
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: number
    competitionId: string
  }

  export type AuditLogUpdateInput = {
    action?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    competitionId?: StringFieldUpdateOperationsInput | string
    user?: UserUpdateOneRequiredWithoutAuditLogNestedInput
  }

  export type AuditLogUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    action?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: IntFieldUpdateOperationsInput | number
    competitionId?: StringFieldUpdateOperationsInput | string
  }

  export type AuditLogCreateManyInput = {
    id?: number
    action: string
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: number
    competitionId: string
  }

  export type AuditLogUpdateManyMutationInput = {
    action?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    competitionId?: StringFieldUpdateOperationsInput | string
  }

  export type AuditLogUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    action?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: IntFieldUpdateOperationsInput | number
    competitionId?: StringFieldUpdateOperationsInput | string
  }

  export type UserCreateInput = {
    phoneNumber: string
    AuditLog?: AuditLogCreateNestedManyWithoutUserInput
    CompetitionSubscription?: CompetitionSubscriptionCreateNestedManyWithoutUserInput
    CompetitorSubscription?: CompetitorSubscriptionCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateInput = {
    id?: number
    phoneNumber: string
    AuditLog?: AuditLogUncheckedCreateNestedManyWithoutUserInput
    CompetitionSubscription?: CompetitionSubscriptionUncheckedCreateNestedManyWithoutUserInput
    CompetitorSubscription?: CompetitorSubscriptionUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserUpdateInput = {
    phoneNumber?: StringFieldUpdateOperationsInput | string
    AuditLog?: AuditLogUpdateManyWithoutUserNestedInput
    CompetitionSubscription?: CompetitionSubscriptionUpdateManyWithoutUserNestedInput
    CompetitorSubscription?: CompetitorSubscriptionUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    phoneNumber?: StringFieldUpdateOperationsInput | string
    AuditLog?: AuditLogUncheckedUpdateManyWithoutUserNestedInput
    CompetitionSubscription?: CompetitionSubscriptionUncheckedUpdateManyWithoutUserNestedInput
    CompetitorSubscription?: CompetitorSubscriptionUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateManyInput = {
    id?: number
    phoneNumber: string
  }

  export type UserUpdateManyMutationInput = {
    phoneNumber?: StringFieldUpdateOperationsInput | string
  }

  export type UserUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    phoneNumber?: StringFieldUpdateOperationsInput | string
  }

  export type SessionCreateInput = {
    id: string
    sid: string
    data: string
    expiresAt: Date | string
  }

  export type SessionUncheckedCreateInput = {
    id: string
    sid: string
    data: string
    expiresAt: Date | string
  }

  export type SessionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    sid?: StringFieldUpdateOperationsInput | string
    data?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SessionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    sid?: StringFieldUpdateOperationsInput | string
    data?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SessionCreateManyInput = {
    id: string
    sid: string
    data: string
    expiresAt: Date | string
  }

  export type SessionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    sid?: StringFieldUpdateOperationsInput | string
    data?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SessionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    sid?: StringFieldUpdateOperationsInput | string
    data?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CompetitionSubscriptionCreateInput = {
    createdAt?: Date | string
    updatedAt?: Date | string
    competitionId: string
    type: CompetitionSubscriptionType
    value: string
    user: UserCreateNestedOneWithoutCompetitionSubscriptionInput
  }

  export type CompetitionSubscriptionUncheckedCreateInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: number
    competitionId: string
    type: CompetitionSubscriptionType
    value: string
  }

  export type CompetitionSubscriptionUpdateInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    competitionId?: StringFieldUpdateOperationsInput | string
    type?: EnumCompetitionSubscriptionTypeFieldUpdateOperationsInput | CompetitionSubscriptionType
    value?: StringFieldUpdateOperationsInput | string
    user?: UserUpdateOneRequiredWithoutCompetitionSubscriptionNestedInput
  }

  export type CompetitionSubscriptionUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: IntFieldUpdateOperationsInput | number
    competitionId?: StringFieldUpdateOperationsInput | string
    type?: EnumCompetitionSubscriptionTypeFieldUpdateOperationsInput | CompetitionSubscriptionType
    value?: StringFieldUpdateOperationsInput | string
  }

  export type CompetitionSubscriptionCreateManyInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: number
    competitionId: string
    type: CompetitionSubscriptionType
    value: string
  }

  export type CompetitionSubscriptionUpdateManyMutationInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    competitionId?: StringFieldUpdateOperationsInput | string
    type?: EnumCompetitionSubscriptionTypeFieldUpdateOperationsInput | CompetitionSubscriptionType
    value?: StringFieldUpdateOperationsInput | string
  }

  export type CompetitionSubscriptionUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: IntFieldUpdateOperationsInput | number
    competitionId?: StringFieldUpdateOperationsInput | string
    type?: EnumCompetitionSubscriptionTypeFieldUpdateOperationsInput | CompetitionSubscriptionType
    value?: StringFieldUpdateOperationsInput | string
  }

  export type CompetitorSubscriptionCreateInput = {
    createdAt?: Date | string
    updatedAt?: Date | string
    wcaUserId: number
    verified?: boolean
    code: string
    user: UserCreateNestedOneWithoutCompetitorSubscriptionInput
  }

  export type CompetitorSubscriptionUncheckedCreateInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: number
    wcaUserId: number
    verified?: boolean
    code: string
  }

  export type CompetitorSubscriptionUpdateInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    wcaUserId?: IntFieldUpdateOperationsInput | number
    verified?: BoolFieldUpdateOperationsInput | boolean
    code?: StringFieldUpdateOperationsInput | string
    user?: UserUpdateOneRequiredWithoutCompetitorSubscriptionNestedInput
  }

  export type CompetitorSubscriptionUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: IntFieldUpdateOperationsInput | number
    wcaUserId?: IntFieldUpdateOperationsInput | number
    verified?: BoolFieldUpdateOperationsInput | boolean
    code?: StringFieldUpdateOperationsInput | string
  }

  export type CompetitorSubscriptionCreateManyInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: number
    wcaUserId: number
    verified?: boolean
    code: string
  }

  export type CompetitorSubscriptionUpdateManyMutationInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    wcaUserId?: IntFieldUpdateOperationsInput | number
    verified?: BoolFieldUpdateOperationsInput | boolean
    code?: StringFieldUpdateOperationsInput | string
  }

  export type CompetitorSubscriptionUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: IntFieldUpdateOperationsInput | number
    wcaUserId?: IntFieldUpdateOperationsInput | number
    verified?: BoolFieldUpdateOperationsInput | boolean
    code?: StringFieldUpdateOperationsInput | string
  }

  export type CompetitionSidCreateInput = {
    createdAt?: Date | string
    updatedAt?: Date | string
    competitionId: string
    sid: string
  }

  export type CompetitionSidUncheckedCreateInput = {
    createdAt?: Date | string
    updatedAt?: Date | string
    competitionId: string
    sid: string
  }

  export type CompetitionSidUpdateInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    competitionId?: StringFieldUpdateOperationsInput | string
    sid?: StringFieldUpdateOperationsInput | string
  }

  export type CompetitionSidUncheckedUpdateInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    competitionId?: StringFieldUpdateOperationsInput | string
    sid?: StringFieldUpdateOperationsInput | string
  }

  export type CompetitionSidCreateManyInput = {
    createdAt?: Date | string
    updatedAt?: Date | string
    competitionId: string
    sid: string
  }

  export type CompetitionSidUpdateManyMutationInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    competitionId?: StringFieldUpdateOperationsInput | string
    sid?: StringFieldUpdateOperationsInput | string
  }

  export type CompetitionSidUncheckedUpdateManyInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    competitionId?: StringFieldUpdateOperationsInput | string
    sid?: StringFieldUpdateOperationsInput | string
  }

  export type IntFilter = {
    equals?: number
    in?: Enumerable<number> | number
    notIn?: Enumerable<number> | number
    lt?: number
    lte?: number
    gt?: number
    gte?: number
    not?: NestedIntFilter | number
  }

  export type StringFilter = {
    equals?: string
    in?: Enumerable<string> | string
    notIn?: Enumerable<string> | string
    lt?: string
    lte?: string
    gt?: string
    gte?: string
    contains?: string
    startsWith?: string
    endsWith?: string
    mode?: QueryMode
    not?: NestedStringFilter | string
  }

  export type DateTimeFilter = {
    equals?: Date | string
    in?: Enumerable<Date> | Enumerable<string> | Date | string
    notIn?: Enumerable<Date> | Enumerable<string> | Date | string
    lt?: Date | string
    lte?: Date | string
    gt?: Date | string
    gte?: Date | string
    not?: NestedDateTimeFilter | Date | string
  }

  export type UserRelationFilter = {
    is?: UserWhereInput | null
    isNot?: UserWhereInput | null
  }

  export type AuditLogCountOrderByAggregateInput = {
    id?: SortOrder
    action?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    competitionId?: SortOrder
  }

  export type AuditLogAvgOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
  }

  export type AuditLogMaxOrderByAggregateInput = {
    id?: SortOrder
    action?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    competitionId?: SortOrder
  }

  export type AuditLogMinOrderByAggregateInput = {
    id?: SortOrder
    action?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    competitionId?: SortOrder
  }

  export type AuditLogSumOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
  }

  export type IntWithAggregatesFilter = {
    equals?: number
    in?: Enumerable<number> | number
    notIn?: Enumerable<number> | number
    lt?: number
    lte?: number
    gt?: number
    gte?: number
    not?: NestedIntWithAggregatesFilter | number
    _count?: NestedIntFilter
    _avg?: NestedFloatFilter
    _sum?: NestedIntFilter
    _min?: NestedIntFilter
    _max?: NestedIntFilter
  }

  export type StringWithAggregatesFilter = {
    equals?: string
    in?: Enumerable<string> | string
    notIn?: Enumerable<string> | string
    lt?: string
    lte?: string
    gt?: string
    gte?: string
    contains?: string
    startsWith?: string
    endsWith?: string
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter | string
    _count?: NestedIntFilter
    _min?: NestedStringFilter
    _max?: NestedStringFilter
  }

  export type DateTimeWithAggregatesFilter = {
    equals?: Date | string
    in?: Enumerable<Date> | Enumerable<string> | Date | string
    notIn?: Enumerable<Date> | Enumerable<string> | Date | string
    lt?: Date | string
    lte?: Date | string
    gt?: Date | string
    gte?: Date | string
    not?: NestedDateTimeWithAggregatesFilter | Date | string
    _count?: NestedIntFilter
    _min?: NestedDateTimeFilter
    _max?: NestedDateTimeFilter
  }

  export type AuditLogListRelationFilter = {
    every?: AuditLogWhereInput
    some?: AuditLogWhereInput
    none?: AuditLogWhereInput
  }

  export type CompetitionSubscriptionListRelationFilter = {
    every?: CompetitionSubscriptionWhereInput
    some?: CompetitionSubscriptionWhereInput
    none?: CompetitionSubscriptionWhereInput
  }

  export type CompetitorSubscriptionListRelationFilter = {
    every?: CompetitorSubscriptionWhereInput
    some?: CompetitorSubscriptionWhereInput
    none?: CompetitorSubscriptionWhereInput
  }

  export type AuditLogOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CompetitionSubscriptionOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CompetitorSubscriptionOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    phoneNumber?: SortOrder
  }

  export type UserAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    phoneNumber?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    phoneNumber?: SortOrder
  }

  export type UserSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type SessionCountOrderByAggregateInput = {
    id?: SortOrder
    sid?: SortOrder
    data?: SortOrder
    expiresAt?: SortOrder
  }

  export type SessionMaxOrderByAggregateInput = {
    id?: SortOrder
    sid?: SortOrder
    data?: SortOrder
    expiresAt?: SortOrder
  }

  export type SessionMinOrderByAggregateInput = {
    id?: SortOrder
    sid?: SortOrder
    data?: SortOrder
    expiresAt?: SortOrder
  }

  export type EnumCompetitionSubscriptionTypeFilter = {
    equals?: CompetitionSubscriptionType
    in?: Enumerable<CompetitionSubscriptionType>
    notIn?: Enumerable<CompetitionSubscriptionType>
    not?: NestedEnumCompetitionSubscriptionTypeFilter | CompetitionSubscriptionType
  }

  export type CompetitionSubscriptionUserIdCompetitionIdTypeValueCompoundUniqueInput = {
    userId: number
    competitionId: string
    type: CompetitionSubscriptionType
    value: string
  }

  export type CompetitionSubscriptionCountOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    competitionId?: SortOrder
    type?: SortOrder
    value?: SortOrder
  }

  export type CompetitionSubscriptionAvgOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
  }

  export type CompetitionSubscriptionMaxOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    competitionId?: SortOrder
    type?: SortOrder
    value?: SortOrder
  }

  export type CompetitionSubscriptionMinOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    competitionId?: SortOrder
    type?: SortOrder
    value?: SortOrder
  }

  export type CompetitionSubscriptionSumOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
  }

  export type EnumCompetitionSubscriptionTypeWithAggregatesFilter = {
    equals?: CompetitionSubscriptionType
    in?: Enumerable<CompetitionSubscriptionType>
    notIn?: Enumerable<CompetitionSubscriptionType>
    not?: NestedEnumCompetitionSubscriptionTypeWithAggregatesFilter | CompetitionSubscriptionType
    _count?: NestedIntFilter
    _min?: NestedEnumCompetitionSubscriptionTypeFilter
    _max?: NestedEnumCompetitionSubscriptionTypeFilter
  }

  export type BoolFilter = {
    equals?: boolean
    not?: NestedBoolFilter | boolean
  }

  export type CompetitorSubscriptionUserIdWcaUserIdCompoundUniqueInput = {
    userId: number
    wcaUserId: number
  }

  export type CompetitorSubscriptionCountOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    wcaUserId?: SortOrder
    verified?: SortOrder
    code?: SortOrder
  }

  export type CompetitorSubscriptionAvgOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    wcaUserId?: SortOrder
  }

  export type CompetitorSubscriptionMaxOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    wcaUserId?: SortOrder
    verified?: SortOrder
    code?: SortOrder
  }

  export type CompetitorSubscriptionMinOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    wcaUserId?: SortOrder
    verified?: SortOrder
    code?: SortOrder
  }

  export type CompetitorSubscriptionSumOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    wcaUserId?: SortOrder
  }

  export type BoolWithAggregatesFilter = {
    equals?: boolean
    not?: NestedBoolWithAggregatesFilter | boolean
    _count?: NestedIntFilter
    _min?: NestedBoolFilter
    _max?: NestedBoolFilter
  }

  export type CompetitionSidCountOrderByAggregateInput = {
    createdAt?: SortOrder
    updatedAt?: SortOrder
    competitionId?: SortOrder
    sid?: SortOrder
  }

  export type CompetitionSidMaxOrderByAggregateInput = {
    createdAt?: SortOrder
    updatedAt?: SortOrder
    competitionId?: SortOrder
    sid?: SortOrder
  }

  export type CompetitionSidMinOrderByAggregateInput = {
    createdAt?: SortOrder
    updatedAt?: SortOrder
    competitionId?: SortOrder
    sid?: SortOrder
  }

  export type UserCreateNestedOneWithoutAuditLogInput = {
    create?: XOR<UserCreateWithoutAuditLogInput, UserUncheckedCreateWithoutAuditLogInput>
    connectOrCreate?: UserCreateOrConnectWithoutAuditLogInput
    connect?: UserWhereUniqueInput
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type UserUpdateOneRequiredWithoutAuditLogNestedInput = {
    create?: XOR<UserCreateWithoutAuditLogInput, UserUncheckedCreateWithoutAuditLogInput>
    connectOrCreate?: UserCreateOrConnectWithoutAuditLogInput
    upsert?: UserUpsertWithoutAuditLogInput
    connect?: UserWhereUniqueInput
    update?: XOR<UserUpdateWithoutAuditLogInput, UserUncheckedUpdateWithoutAuditLogInput>
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type AuditLogCreateNestedManyWithoutUserInput = {
    create?: XOR<Enumerable<AuditLogCreateWithoutUserInput>, Enumerable<AuditLogUncheckedCreateWithoutUserInput>>
    connectOrCreate?: Enumerable<AuditLogCreateOrConnectWithoutUserInput>
    createMany?: AuditLogCreateManyUserInputEnvelope
    connect?: Enumerable<AuditLogWhereUniqueInput>
  }

  export type CompetitionSubscriptionCreateNestedManyWithoutUserInput = {
    create?: XOR<Enumerable<CompetitionSubscriptionCreateWithoutUserInput>, Enumerable<CompetitionSubscriptionUncheckedCreateWithoutUserInput>>
    connectOrCreate?: Enumerable<CompetitionSubscriptionCreateOrConnectWithoutUserInput>
    createMany?: CompetitionSubscriptionCreateManyUserInputEnvelope
    connect?: Enumerable<CompetitionSubscriptionWhereUniqueInput>
  }

  export type CompetitorSubscriptionCreateNestedManyWithoutUserInput = {
    create?: XOR<Enumerable<CompetitorSubscriptionCreateWithoutUserInput>, Enumerable<CompetitorSubscriptionUncheckedCreateWithoutUserInput>>
    connectOrCreate?: Enumerable<CompetitorSubscriptionCreateOrConnectWithoutUserInput>
    createMany?: CompetitorSubscriptionCreateManyUserInputEnvelope
    connect?: Enumerable<CompetitorSubscriptionWhereUniqueInput>
  }

  export type AuditLogUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<Enumerable<AuditLogCreateWithoutUserInput>, Enumerable<AuditLogUncheckedCreateWithoutUserInput>>
    connectOrCreate?: Enumerable<AuditLogCreateOrConnectWithoutUserInput>
    createMany?: AuditLogCreateManyUserInputEnvelope
    connect?: Enumerable<AuditLogWhereUniqueInput>
  }

  export type CompetitionSubscriptionUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<Enumerable<CompetitionSubscriptionCreateWithoutUserInput>, Enumerable<CompetitionSubscriptionUncheckedCreateWithoutUserInput>>
    connectOrCreate?: Enumerable<CompetitionSubscriptionCreateOrConnectWithoutUserInput>
    createMany?: CompetitionSubscriptionCreateManyUserInputEnvelope
    connect?: Enumerable<CompetitionSubscriptionWhereUniqueInput>
  }

  export type CompetitorSubscriptionUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<Enumerable<CompetitorSubscriptionCreateWithoutUserInput>, Enumerable<CompetitorSubscriptionUncheckedCreateWithoutUserInput>>
    connectOrCreate?: Enumerable<CompetitorSubscriptionCreateOrConnectWithoutUserInput>
    createMany?: CompetitorSubscriptionCreateManyUserInputEnvelope
    connect?: Enumerable<CompetitorSubscriptionWhereUniqueInput>
  }

  export type AuditLogUpdateManyWithoutUserNestedInput = {
    create?: XOR<Enumerable<AuditLogCreateWithoutUserInput>, Enumerable<AuditLogUncheckedCreateWithoutUserInput>>
    connectOrCreate?: Enumerable<AuditLogCreateOrConnectWithoutUserInput>
    upsert?: Enumerable<AuditLogUpsertWithWhereUniqueWithoutUserInput>
    createMany?: AuditLogCreateManyUserInputEnvelope
    set?: Enumerable<AuditLogWhereUniqueInput>
    disconnect?: Enumerable<AuditLogWhereUniqueInput>
    delete?: Enumerable<AuditLogWhereUniqueInput>
    connect?: Enumerable<AuditLogWhereUniqueInput>
    update?: Enumerable<AuditLogUpdateWithWhereUniqueWithoutUserInput>
    updateMany?: Enumerable<AuditLogUpdateManyWithWhereWithoutUserInput>
    deleteMany?: Enumerable<AuditLogScalarWhereInput>
  }

  export type CompetitionSubscriptionUpdateManyWithoutUserNestedInput = {
    create?: XOR<Enumerable<CompetitionSubscriptionCreateWithoutUserInput>, Enumerable<CompetitionSubscriptionUncheckedCreateWithoutUserInput>>
    connectOrCreate?: Enumerable<CompetitionSubscriptionCreateOrConnectWithoutUserInput>
    upsert?: Enumerable<CompetitionSubscriptionUpsertWithWhereUniqueWithoutUserInput>
    createMany?: CompetitionSubscriptionCreateManyUserInputEnvelope
    set?: Enumerable<CompetitionSubscriptionWhereUniqueInput>
    disconnect?: Enumerable<CompetitionSubscriptionWhereUniqueInput>
    delete?: Enumerable<CompetitionSubscriptionWhereUniqueInput>
    connect?: Enumerable<CompetitionSubscriptionWhereUniqueInput>
    update?: Enumerable<CompetitionSubscriptionUpdateWithWhereUniqueWithoutUserInput>
    updateMany?: Enumerable<CompetitionSubscriptionUpdateManyWithWhereWithoutUserInput>
    deleteMany?: Enumerable<CompetitionSubscriptionScalarWhereInput>
  }

  export type CompetitorSubscriptionUpdateManyWithoutUserNestedInput = {
    create?: XOR<Enumerable<CompetitorSubscriptionCreateWithoutUserInput>, Enumerable<CompetitorSubscriptionUncheckedCreateWithoutUserInput>>
    connectOrCreate?: Enumerable<CompetitorSubscriptionCreateOrConnectWithoutUserInput>
    upsert?: Enumerable<CompetitorSubscriptionUpsertWithWhereUniqueWithoutUserInput>
    createMany?: CompetitorSubscriptionCreateManyUserInputEnvelope
    set?: Enumerable<CompetitorSubscriptionWhereUniqueInput>
    disconnect?: Enumerable<CompetitorSubscriptionWhereUniqueInput>
    delete?: Enumerable<CompetitorSubscriptionWhereUniqueInput>
    connect?: Enumerable<CompetitorSubscriptionWhereUniqueInput>
    update?: Enumerable<CompetitorSubscriptionUpdateWithWhereUniqueWithoutUserInput>
    updateMany?: Enumerable<CompetitorSubscriptionUpdateManyWithWhereWithoutUserInput>
    deleteMany?: Enumerable<CompetitorSubscriptionScalarWhereInput>
  }

  export type AuditLogUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<Enumerable<AuditLogCreateWithoutUserInput>, Enumerable<AuditLogUncheckedCreateWithoutUserInput>>
    connectOrCreate?: Enumerable<AuditLogCreateOrConnectWithoutUserInput>
    upsert?: Enumerable<AuditLogUpsertWithWhereUniqueWithoutUserInput>
    createMany?: AuditLogCreateManyUserInputEnvelope
    set?: Enumerable<AuditLogWhereUniqueInput>
    disconnect?: Enumerable<AuditLogWhereUniqueInput>
    delete?: Enumerable<AuditLogWhereUniqueInput>
    connect?: Enumerable<AuditLogWhereUniqueInput>
    update?: Enumerable<AuditLogUpdateWithWhereUniqueWithoutUserInput>
    updateMany?: Enumerable<AuditLogUpdateManyWithWhereWithoutUserInput>
    deleteMany?: Enumerable<AuditLogScalarWhereInput>
  }

  export type CompetitionSubscriptionUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<Enumerable<CompetitionSubscriptionCreateWithoutUserInput>, Enumerable<CompetitionSubscriptionUncheckedCreateWithoutUserInput>>
    connectOrCreate?: Enumerable<CompetitionSubscriptionCreateOrConnectWithoutUserInput>
    upsert?: Enumerable<CompetitionSubscriptionUpsertWithWhereUniqueWithoutUserInput>
    createMany?: CompetitionSubscriptionCreateManyUserInputEnvelope
    set?: Enumerable<CompetitionSubscriptionWhereUniqueInput>
    disconnect?: Enumerable<CompetitionSubscriptionWhereUniqueInput>
    delete?: Enumerable<CompetitionSubscriptionWhereUniqueInput>
    connect?: Enumerable<CompetitionSubscriptionWhereUniqueInput>
    update?: Enumerable<CompetitionSubscriptionUpdateWithWhereUniqueWithoutUserInput>
    updateMany?: Enumerable<CompetitionSubscriptionUpdateManyWithWhereWithoutUserInput>
    deleteMany?: Enumerable<CompetitionSubscriptionScalarWhereInput>
  }

  export type CompetitorSubscriptionUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<Enumerable<CompetitorSubscriptionCreateWithoutUserInput>, Enumerable<CompetitorSubscriptionUncheckedCreateWithoutUserInput>>
    connectOrCreate?: Enumerable<CompetitorSubscriptionCreateOrConnectWithoutUserInput>
    upsert?: Enumerable<CompetitorSubscriptionUpsertWithWhereUniqueWithoutUserInput>
    createMany?: CompetitorSubscriptionCreateManyUserInputEnvelope
    set?: Enumerable<CompetitorSubscriptionWhereUniqueInput>
    disconnect?: Enumerable<CompetitorSubscriptionWhereUniqueInput>
    delete?: Enumerable<CompetitorSubscriptionWhereUniqueInput>
    connect?: Enumerable<CompetitorSubscriptionWhereUniqueInput>
    update?: Enumerable<CompetitorSubscriptionUpdateWithWhereUniqueWithoutUserInput>
    updateMany?: Enumerable<CompetitorSubscriptionUpdateManyWithWhereWithoutUserInput>
    deleteMany?: Enumerable<CompetitorSubscriptionScalarWhereInput>
  }

  export type UserCreateNestedOneWithoutCompetitionSubscriptionInput = {
    create?: XOR<UserCreateWithoutCompetitionSubscriptionInput, UserUncheckedCreateWithoutCompetitionSubscriptionInput>
    connectOrCreate?: UserCreateOrConnectWithoutCompetitionSubscriptionInput
    connect?: UserWhereUniqueInput
  }

  export type EnumCompetitionSubscriptionTypeFieldUpdateOperationsInput = {
    set?: CompetitionSubscriptionType
  }

  export type UserUpdateOneRequiredWithoutCompetitionSubscriptionNestedInput = {
    create?: XOR<UserCreateWithoutCompetitionSubscriptionInput, UserUncheckedCreateWithoutCompetitionSubscriptionInput>
    connectOrCreate?: UserCreateOrConnectWithoutCompetitionSubscriptionInput
    upsert?: UserUpsertWithoutCompetitionSubscriptionInput
    connect?: UserWhereUniqueInput
    update?: XOR<UserUpdateWithoutCompetitionSubscriptionInput, UserUncheckedUpdateWithoutCompetitionSubscriptionInput>
  }

  export type UserCreateNestedOneWithoutCompetitorSubscriptionInput = {
    create?: XOR<UserCreateWithoutCompetitorSubscriptionInput, UserUncheckedCreateWithoutCompetitorSubscriptionInput>
    connectOrCreate?: UserCreateOrConnectWithoutCompetitorSubscriptionInput
    connect?: UserWhereUniqueInput
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type UserUpdateOneRequiredWithoutCompetitorSubscriptionNestedInput = {
    create?: XOR<UserCreateWithoutCompetitorSubscriptionInput, UserUncheckedCreateWithoutCompetitorSubscriptionInput>
    connectOrCreate?: UserCreateOrConnectWithoutCompetitorSubscriptionInput
    upsert?: UserUpsertWithoutCompetitorSubscriptionInput
    connect?: UserWhereUniqueInput
    update?: XOR<UserUpdateWithoutCompetitorSubscriptionInput, UserUncheckedUpdateWithoutCompetitorSubscriptionInput>
  }

  export type NestedIntFilter = {
    equals?: number
    in?: Enumerable<number> | number
    notIn?: Enumerable<number> | number
    lt?: number
    lte?: number
    gt?: number
    gte?: number
    not?: NestedIntFilter | number
  }

  export type NestedStringFilter = {
    equals?: string
    in?: Enumerable<string> | string
    notIn?: Enumerable<string> | string
    lt?: string
    lte?: string
    gt?: string
    gte?: string
    contains?: string
    startsWith?: string
    endsWith?: string
    not?: NestedStringFilter | string
  }

  export type NestedDateTimeFilter = {
    equals?: Date | string
    in?: Enumerable<Date> | Enumerable<string> | Date | string
    notIn?: Enumerable<Date> | Enumerable<string> | Date | string
    lt?: Date | string
    lte?: Date | string
    gt?: Date | string
    gte?: Date | string
    not?: NestedDateTimeFilter | Date | string
  }

  export type NestedIntWithAggregatesFilter = {
    equals?: number
    in?: Enumerable<number> | number
    notIn?: Enumerable<number> | number
    lt?: number
    lte?: number
    gt?: number
    gte?: number
    not?: NestedIntWithAggregatesFilter | number
    _count?: NestedIntFilter
    _avg?: NestedFloatFilter
    _sum?: NestedIntFilter
    _min?: NestedIntFilter
    _max?: NestedIntFilter
  }

  export type NestedFloatFilter = {
    equals?: number
    in?: Enumerable<number> | number
    notIn?: Enumerable<number> | number
    lt?: number
    lte?: number
    gt?: number
    gte?: number
    not?: NestedFloatFilter | number
  }

  export type NestedStringWithAggregatesFilter = {
    equals?: string
    in?: Enumerable<string> | string
    notIn?: Enumerable<string> | string
    lt?: string
    lte?: string
    gt?: string
    gte?: string
    contains?: string
    startsWith?: string
    endsWith?: string
    not?: NestedStringWithAggregatesFilter | string
    _count?: NestedIntFilter
    _min?: NestedStringFilter
    _max?: NestedStringFilter
  }

  export type NestedDateTimeWithAggregatesFilter = {
    equals?: Date | string
    in?: Enumerable<Date> | Enumerable<string> | Date | string
    notIn?: Enumerable<Date> | Enumerable<string> | Date | string
    lt?: Date | string
    lte?: Date | string
    gt?: Date | string
    gte?: Date | string
    not?: NestedDateTimeWithAggregatesFilter | Date | string
    _count?: NestedIntFilter
    _min?: NestedDateTimeFilter
    _max?: NestedDateTimeFilter
  }

  export type NestedEnumCompetitionSubscriptionTypeFilter = {
    equals?: CompetitionSubscriptionType
    in?: Enumerable<CompetitionSubscriptionType>
    notIn?: Enumerable<CompetitionSubscriptionType>
    not?: NestedEnumCompetitionSubscriptionTypeFilter | CompetitionSubscriptionType
  }

  export type NestedEnumCompetitionSubscriptionTypeWithAggregatesFilter = {
    equals?: CompetitionSubscriptionType
    in?: Enumerable<CompetitionSubscriptionType>
    notIn?: Enumerable<CompetitionSubscriptionType>
    not?: NestedEnumCompetitionSubscriptionTypeWithAggregatesFilter | CompetitionSubscriptionType
    _count?: NestedIntFilter
    _min?: NestedEnumCompetitionSubscriptionTypeFilter
    _max?: NestedEnumCompetitionSubscriptionTypeFilter
  }

  export type NestedBoolFilter = {
    equals?: boolean
    not?: NestedBoolFilter | boolean
  }

  export type NestedBoolWithAggregatesFilter = {
    equals?: boolean
    not?: NestedBoolWithAggregatesFilter | boolean
    _count?: NestedIntFilter
    _min?: NestedBoolFilter
    _max?: NestedBoolFilter
  }

  export type UserCreateWithoutAuditLogInput = {
    phoneNumber: string
    CompetitionSubscription?: CompetitionSubscriptionCreateNestedManyWithoutUserInput
    CompetitorSubscription?: CompetitorSubscriptionCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutAuditLogInput = {
    id?: number
    phoneNumber: string
    CompetitionSubscription?: CompetitionSubscriptionUncheckedCreateNestedManyWithoutUserInput
    CompetitorSubscription?: CompetitorSubscriptionUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutAuditLogInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutAuditLogInput, UserUncheckedCreateWithoutAuditLogInput>
  }

  export type UserUpsertWithoutAuditLogInput = {
    update: XOR<UserUpdateWithoutAuditLogInput, UserUncheckedUpdateWithoutAuditLogInput>
    create: XOR<UserCreateWithoutAuditLogInput, UserUncheckedCreateWithoutAuditLogInput>
  }

  export type UserUpdateWithoutAuditLogInput = {
    phoneNumber?: StringFieldUpdateOperationsInput | string
    CompetitionSubscription?: CompetitionSubscriptionUpdateManyWithoutUserNestedInput
    CompetitorSubscription?: CompetitorSubscriptionUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutAuditLogInput = {
    id?: IntFieldUpdateOperationsInput | number
    phoneNumber?: StringFieldUpdateOperationsInput | string
    CompetitionSubscription?: CompetitionSubscriptionUncheckedUpdateManyWithoutUserNestedInput
    CompetitorSubscription?: CompetitorSubscriptionUncheckedUpdateManyWithoutUserNestedInput
  }

  export type AuditLogCreateWithoutUserInput = {
    action: string
    createdAt?: Date | string
    updatedAt?: Date | string
    competitionId: string
  }

  export type AuditLogUncheckedCreateWithoutUserInput = {
    id?: number
    action: string
    createdAt?: Date | string
    updatedAt?: Date | string
    competitionId: string
  }

  export type AuditLogCreateOrConnectWithoutUserInput = {
    where: AuditLogWhereUniqueInput
    create: XOR<AuditLogCreateWithoutUserInput, AuditLogUncheckedCreateWithoutUserInput>
  }

  export type AuditLogCreateManyUserInputEnvelope = {
    data: Enumerable<AuditLogCreateManyUserInput>
    skipDuplicates?: boolean
  }

  export type CompetitionSubscriptionCreateWithoutUserInput = {
    createdAt?: Date | string
    updatedAt?: Date | string
    competitionId: string
    type: CompetitionSubscriptionType
    value: string
  }

  export type CompetitionSubscriptionUncheckedCreateWithoutUserInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    competitionId: string
    type: CompetitionSubscriptionType
    value: string
  }

  export type CompetitionSubscriptionCreateOrConnectWithoutUserInput = {
    where: CompetitionSubscriptionWhereUniqueInput
    create: XOR<CompetitionSubscriptionCreateWithoutUserInput, CompetitionSubscriptionUncheckedCreateWithoutUserInput>
  }

  export type CompetitionSubscriptionCreateManyUserInputEnvelope = {
    data: Enumerable<CompetitionSubscriptionCreateManyUserInput>
    skipDuplicates?: boolean
  }

  export type CompetitorSubscriptionCreateWithoutUserInput = {
    createdAt?: Date | string
    updatedAt?: Date | string
    wcaUserId: number
    verified?: boolean
    code: string
  }

  export type CompetitorSubscriptionUncheckedCreateWithoutUserInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    wcaUserId: number
    verified?: boolean
    code: string
  }

  export type CompetitorSubscriptionCreateOrConnectWithoutUserInput = {
    where: CompetitorSubscriptionWhereUniqueInput
    create: XOR<CompetitorSubscriptionCreateWithoutUserInput, CompetitorSubscriptionUncheckedCreateWithoutUserInput>
  }

  export type CompetitorSubscriptionCreateManyUserInputEnvelope = {
    data: Enumerable<CompetitorSubscriptionCreateManyUserInput>
    skipDuplicates?: boolean
  }

  export type AuditLogUpsertWithWhereUniqueWithoutUserInput = {
    where: AuditLogWhereUniqueInput
    update: XOR<AuditLogUpdateWithoutUserInput, AuditLogUncheckedUpdateWithoutUserInput>
    create: XOR<AuditLogCreateWithoutUserInput, AuditLogUncheckedCreateWithoutUserInput>
  }

  export type AuditLogUpdateWithWhereUniqueWithoutUserInput = {
    where: AuditLogWhereUniqueInput
    data: XOR<AuditLogUpdateWithoutUserInput, AuditLogUncheckedUpdateWithoutUserInput>
  }

  export type AuditLogUpdateManyWithWhereWithoutUserInput = {
    where: AuditLogScalarWhereInput
    data: XOR<AuditLogUpdateManyMutationInput, AuditLogUncheckedUpdateManyWithoutAuditLogInput>
  }

  export type AuditLogScalarWhereInput = {
    AND?: Enumerable<AuditLogScalarWhereInput>
    OR?: Enumerable<AuditLogScalarWhereInput>
    NOT?: Enumerable<AuditLogScalarWhereInput>
    id?: IntFilter | number
    action?: StringFilter | string
    createdAt?: DateTimeFilter | Date | string
    updatedAt?: DateTimeFilter | Date | string
    userId?: IntFilter | number
    competitionId?: StringFilter | string
  }

  export type CompetitionSubscriptionUpsertWithWhereUniqueWithoutUserInput = {
    where: CompetitionSubscriptionWhereUniqueInput
    update: XOR<CompetitionSubscriptionUpdateWithoutUserInput, CompetitionSubscriptionUncheckedUpdateWithoutUserInput>
    create: XOR<CompetitionSubscriptionCreateWithoutUserInput, CompetitionSubscriptionUncheckedCreateWithoutUserInput>
  }

  export type CompetitionSubscriptionUpdateWithWhereUniqueWithoutUserInput = {
    where: CompetitionSubscriptionWhereUniqueInput
    data: XOR<CompetitionSubscriptionUpdateWithoutUserInput, CompetitionSubscriptionUncheckedUpdateWithoutUserInput>
  }

  export type CompetitionSubscriptionUpdateManyWithWhereWithoutUserInput = {
    where: CompetitionSubscriptionScalarWhereInput
    data: XOR<CompetitionSubscriptionUpdateManyMutationInput, CompetitionSubscriptionUncheckedUpdateManyWithoutCompetitionSubscriptionInput>
  }

  export type CompetitionSubscriptionScalarWhereInput = {
    AND?: Enumerable<CompetitionSubscriptionScalarWhereInput>
    OR?: Enumerable<CompetitionSubscriptionScalarWhereInput>
    NOT?: Enumerable<CompetitionSubscriptionScalarWhereInput>
    id?: IntFilter | number
    createdAt?: DateTimeFilter | Date | string
    updatedAt?: DateTimeFilter | Date | string
    userId?: IntFilter | number
    competitionId?: StringFilter | string
    type?: EnumCompetitionSubscriptionTypeFilter | CompetitionSubscriptionType
    value?: StringFilter | string
  }

  export type CompetitorSubscriptionUpsertWithWhereUniqueWithoutUserInput = {
    where: CompetitorSubscriptionWhereUniqueInput
    update: XOR<CompetitorSubscriptionUpdateWithoutUserInput, CompetitorSubscriptionUncheckedUpdateWithoutUserInput>
    create: XOR<CompetitorSubscriptionCreateWithoutUserInput, CompetitorSubscriptionUncheckedCreateWithoutUserInput>
  }

  export type CompetitorSubscriptionUpdateWithWhereUniqueWithoutUserInput = {
    where: CompetitorSubscriptionWhereUniqueInput
    data: XOR<CompetitorSubscriptionUpdateWithoutUserInput, CompetitorSubscriptionUncheckedUpdateWithoutUserInput>
  }

  export type CompetitorSubscriptionUpdateManyWithWhereWithoutUserInput = {
    where: CompetitorSubscriptionScalarWhereInput
    data: XOR<CompetitorSubscriptionUpdateManyMutationInput, CompetitorSubscriptionUncheckedUpdateManyWithoutCompetitorSubscriptionInput>
  }

  export type CompetitorSubscriptionScalarWhereInput = {
    AND?: Enumerable<CompetitorSubscriptionScalarWhereInput>
    OR?: Enumerable<CompetitorSubscriptionScalarWhereInput>
    NOT?: Enumerable<CompetitorSubscriptionScalarWhereInput>
    id?: IntFilter | number
    createdAt?: DateTimeFilter | Date | string
    updatedAt?: DateTimeFilter | Date | string
    userId?: IntFilter | number
    wcaUserId?: IntFilter | number
    verified?: BoolFilter | boolean
    code?: StringFilter | string
  }

  export type UserCreateWithoutCompetitionSubscriptionInput = {
    phoneNumber: string
    AuditLog?: AuditLogCreateNestedManyWithoutUserInput
    CompetitorSubscription?: CompetitorSubscriptionCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutCompetitionSubscriptionInput = {
    id?: number
    phoneNumber: string
    AuditLog?: AuditLogUncheckedCreateNestedManyWithoutUserInput
    CompetitorSubscription?: CompetitorSubscriptionUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutCompetitionSubscriptionInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutCompetitionSubscriptionInput, UserUncheckedCreateWithoutCompetitionSubscriptionInput>
  }

  export type UserUpsertWithoutCompetitionSubscriptionInput = {
    update: XOR<UserUpdateWithoutCompetitionSubscriptionInput, UserUncheckedUpdateWithoutCompetitionSubscriptionInput>
    create: XOR<UserCreateWithoutCompetitionSubscriptionInput, UserUncheckedCreateWithoutCompetitionSubscriptionInput>
  }

  export type UserUpdateWithoutCompetitionSubscriptionInput = {
    phoneNumber?: StringFieldUpdateOperationsInput | string
    AuditLog?: AuditLogUpdateManyWithoutUserNestedInput
    CompetitorSubscription?: CompetitorSubscriptionUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutCompetitionSubscriptionInput = {
    id?: IntFieldUpdateOperationsInput | number
    phoneNumber?: StringFieldUpdateOperationsInput | string
    AuditLog?: AuditLogUncheckedUpdateManyWithoutUserNestedInput
    CompetitorSubscription?: CompetitorSubscriptionUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateWithoutCompetitorSubscriptionInput = {
    phoneNumber: string
    AuditLog?: AuditLogCreateNestedManyWithoutUserInput
    CompetitionSubscription?: CompetitionSubscriptionCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutCompetitorSubscriptionInput = {
    id?: number
    phoneNumber: string
    AuditLog?: AuditLogUncheckedCreateNestedManyWithoutUserInput
    CompetitionSubscription?: CompetitionSubscriptionUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutCompetitorSubscriptionInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutCompetitorSubscriptionInput, UserUncheckedCreateWithoutCompetitorSubscriptionInput>
  }

  export type UserUpsertWithoutCompetitorSubscriptionInput = {
    update: XOR<UserUpdateWithoutCompetitorSubscriptionInput, UserUncheckedUpdateWithoutCompetitorSubscriptionInput>
    create: XOR<UserCreateWithoutCompetitorSubscriptionInput, UserUncheckedCreateWithoutCompetitorSubscriptionInput>
  }

  export type UserUpdateWithoutCompetitorSubscriptionInput = {
    phoneNumber?: StringFieldUpdateOperationsInput | string
    AuditLog?: AuditLogUpdateManyWithoutUserNestedInput
    CompetitionSubscription?: CompetitionSubscriptionUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutCompetitorSubscriptionInput = {
    id?: IntFieldUpdateOperationsInput | number
    phoneNumber?: StringFieldUpdateOperationsInput | string
    AuditLog?: AuditLogUncheckedUpdateManyWithoutUserNestedInput
    CompetitionSubscription?: CompetitionSubscriptionUncheckedUpdateManyWithoutUserNestedInput
  }

  export type AuditLogCreateManyUserInput = {
    id?: number
    action: string
    createdAt?: Date | string
    updatedAt?: Date | string
    competitionId: string
  }

  export type CompetitionSubscriptionCreateManyUserInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    competitionId: string
    type: CompetitionSubscriptionType
    value: string
  }

  export type CompetitorSubscriptionCreateManyUserInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    wcaUserId: number
    verified?: boolean
    code: string
  }

  export type AuditLogUpdateWithoutUserInput = {
    action?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    competitionId?: StringFieldUpdateOperationsInput | string
  }

  export type AuditLogUncheckedUpdateWithoutUserInput = {
    id?: IntFieldUpdateOperationsInput | number
    action?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    competitionId?: StringFieldUpdateOperationsInput | string
  }

  export type AuditLogUncheckedUpdateManyWithoutAuditLogInput = {
    id?: IntFieldUpdateOperationsInput | number
    action?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    competitionId?: StringFieldUpdateOperationsInput | string
  }

  export type CompetitionSubscriptionUpdateWithoutUserInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    competitionId?: StringFieldUpdateOperationsInput | string
    type?: EnumCompetitionSubscriptionTypeFieldUpdateOperationsInput | CompetitionSubscriptionType
    value?: StringFieldUpdateOperationsInput | string
  }

  export type CompetitionSubscriptionUncheckedUpdateWithoutUserInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    competitionId?: StringFieldUpdateOperationsInput | string
    type?: EnumCompetitionSubscriptionTypeFieldUpdateOperationsInput | CompetitionSubscriptionType
    value?: StringFieldUpdateOperationsInput | string
  }

  export type CompetitionSubscriptionUncheckedUpdateManyWithoutCompetitionSubscriptionInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    competitionId?: StringFieldUpdateOperationsInput | string
    type?: EnumCompetitionSubscriptionTypeFieldUpdateOperationsInput | CompetitionSubscriptionType
    value?: StringFieldUpdateOperationsInput | string
  }

  export type CompetitorSubscriptionUpdateWithoutUserInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    wcaUserId?: IntFieldUpdateOperationsInput | number
    verified?: BoolFieldUpdateOperationsInput | boolean
    code?: StringFieldUpdateOperationsInput | string
  }

  export type CompetitorSubscriptionUncheckedUpdateWithoutUserInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    wcaUserId?: IntFieldUpdateOperationsInput | number
    verified?: BoolFieldUpdateOperationsInput | boolean
    code?: StringFieldUpdateOperationsInput | string
  }

  export type CompetitorSubscriptionUncheckedUpdateManyWithoutCompetitorSubscriptionInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    wcaUserId?: IntFieldUpdateOperationsInput | number
    verified?: BoolFieldUpdateOperationsInput | boolean
    code?: StringFieldUpdateOperationsInput | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}