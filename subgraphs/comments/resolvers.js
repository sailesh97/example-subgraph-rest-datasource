export const resolvers = {
  Query: {
    allComments: async (_, __, context) => {
      const api = context.dataSources.commentsApi;
      return api.listComments(context);
    },
  },
  Comment: {
    __resolveReference: (ref, context) => {
      const api = context.dataSources.commentsApi;
      return api.getComment(ref.id, context);
    }
  }
};
