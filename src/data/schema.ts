export const schemaSDL = `
type User {
  id: ID!
  name: String!
  role: String!
}

type Post {
  id: ID!
  title: String!
  authorId: ID!
}

type Query {
  users: [User!]!
  user(id: ID!): User
  posts: [Post!]!
}
`;

export const mockData = {
  users: [
    { id: "1", name: "Avery", role: "admin" },
    { id: "2", name: "Jordan", role: "editor" },
    { id: "3", name: "Morgan", role: "viewer" },
  ],
  posts: [
    { id: "p1", title: "Graph Caching Patterns", authorId: "1" },
    { id: "p2", title: "Typed Query Fragments", authorId: "2" },
  ],
};
