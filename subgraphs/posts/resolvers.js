export const resolvers = {
  Query: {
    allPosts: async (_, __, context) => {
      const api = context.dataSources.postsApi;
      return api.listUsers(context);
    },
  },
  Post: {
    __resolveReference: (ref, context) => {
      const api = context.dataSources.postsApi;
      return api.getPost(ref.id, context);
    }
  }
};
