export const resolvers = {
  Query: {
    allPosts: async (_, __, context) => {
      const api = context.dataSources.postsApi;
      return api.listPosts(context);
    },
    pushPost: async (_, args, context) => {
      const api = context.dataSources.postsApi;
      return api.pushPost(args, context);
    }
  },
  Post: {
    __resolveReference: (ref, context) => {
      const api = context.dataSources.postsApi;
      return api.getPost(ref.id, context);
    }
  }
};
