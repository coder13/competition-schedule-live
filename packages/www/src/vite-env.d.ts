/// <reference types="vite/client" />

interface User {
  id: number;
  phoneNumber?: string;
}

type Subscription = {
  type: 'activity' | 'competitor';
  value: string;
};
