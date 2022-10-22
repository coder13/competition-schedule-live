import { QueryResolvers } from '../../../generated/graphql';

export const competition: QueryResolvers['competition'] = async () => {
  return {
    id: '123',
    name: 'John Doe',
  };
};
