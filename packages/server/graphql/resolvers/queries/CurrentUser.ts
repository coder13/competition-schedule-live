import { AppContext } from '../../..';
import { QueryResolvers } from '../../../generated/graphql';

export const currentUser: QueryResolvers<AppContext>['currentUser'] = async (
  _,
  __,
  { user }
) => {
  if (!user) {
    throw new Error('Not Authenticated');
  }

  return {
    id: user.id,
  };
};
