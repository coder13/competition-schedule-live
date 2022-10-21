import { QueryResolvers } from '../../../generated/graphql';

export const user: QueryResolvers['user'] = async () => {
  return {
    id: '123',
    name: 'John Doe',
  };
};
