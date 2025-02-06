export const resolvers = {
  Query: {
    allUsers: async (_, __, context) => {
      const api = context.dataSources.usersApi;
      return api.listUsers(context);
    },
  },
  User: {
    __resolveReference: (ref, context) => {
      const api = context.dataSources.usersApi;
      return api.getUser(ref.id, context);
    }
  }
};
