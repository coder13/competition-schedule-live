import { AppContext } from '../../..';
import { QueryResolvers } from '../../../generated/graphql';

export const competition: QueryResolvers<AppContext>['competition'] = async (
  parent,
  args,
  context,
  info
) => {
  return {
    id: '123',
    name: 'John Doe',
  };
};
