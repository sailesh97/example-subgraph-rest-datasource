export const resolvers = {
  Query: {
    allPosts: async (_, __, context) => {
      const api = context.dataSources.jsonApi;
      return api.listPosts();
    },
    allUsers: async (_, __, context) => {
      const api = context.dataSources.jsonApi;
      return api.listUsers();
    },
    allComments: async (_, __, context) => {
      const cache = context.cache;
      console.log("Cache keys", cache.keys());
      const api = context.dataSources.jsonApi;
      return api.listComments();
    },
  },
  Post: {
    user: async (ref, _, context) => {
      const userId = ref.user.id;
      const api = context.dataSources.jsonApi;
      return api.getUser(userId);
    }
  },
  Comment: {
    post: async (ref, _, context) => {
      const postId = ref.post.id;
      const api = context.dataSources.jsonApi;
      return api.getPost(postId);
    }
  }
};
