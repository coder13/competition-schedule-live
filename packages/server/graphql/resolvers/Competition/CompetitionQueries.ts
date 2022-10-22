import { QueryResolvers } from '../../../generated/graphql';

export const competition: QueryResolvers<AppContext>['competition'] = async (
  parent,
  args,
  context,
  info
) => {
  console.log(9, context.user);
  return {
    id: '123',
    name: 'John Doe',
  };
};
