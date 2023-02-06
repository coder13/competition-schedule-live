/// <reference types="vite/client" />

interface User {
  id: number;
  phoneNumber?: string;
  competitionSubscriptions?: Record<string, CompetitionSubscription[]>;
}

type Subscription = {
  type: 'activity' | 'competitor';
  value: string;
};
