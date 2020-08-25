import superagentPromise from "superagent-promise";
import _superagent from "superagent";

const superagent = superagentPromise(_superagent, global.Promise);

const API_ROOT = "https://oktank-backend.herokuapp.com/api";
const USER_API_ROOT =
  "https://3cthybyobe.execute-api.us-east-1.amazonaws.com/api";
const ARTICLE_API_ROOT =
  "https://6arryo2p4h.execute-api.us-east-1.amazonaws.com/api";
const PROFILE_API_ROOT =
  "https://6arryo2p4h.execute-api.us-east-1.amazonaws.com/api";

const encode = encodeURIComponent;
const responseBody = (res) => res.body;

let token = null;
const tokenPlugin = (req) => {
  if (token) {
    console.log("Using Bearer");
    req.set("authorization", `Bearer ${token}`);
  }
};

const requests = {
  del: (root = API_ROOT) => (url) =>
    superagent.del(`${root}${url}`).use(tokenPlugin).then(responseBody),
  get: (root = API_ROOT) => (url) =>
    superagent.get(`${root}${url}`).use(tokenPlugin).then(responseBody),
  put: (root = API_ROOT) => (url, body) =>
    superagent.put(`${root}${url}`, body).use(tokenPlugin).then(responseBody),
  post: (root = API_ROOT) => (url, body) =>
    superagent.post(`${root}${url}`, body).use(tokenPlugin).then(responseBody),
};

const Auth = {
  current: () => requests.get(USER_API_ROOT)("/user"),
  login: (email, password) =>
    requests.post(USER_API_ROOT)("/users/login", { user: { email, password } }),
  register: (username, email, password) =>
    requests.post(USER_API_ROOT)("/users", {
      user: { username, email, password },
    }),
  save: (user) => requests.put(USER_API_ROOT)("/user", { user }),
};

const Tags = {
  getAll: () => requests.get(ARTICLE_API_ROOT)("/tags"),
};

const limit = (count, p) => `limit=${count}&offset=${p ? p * count : 0}`;
const omitSlug = (article) => Object.assign({}, article, { slug: undefined });
const Articles = {
  all: (page) => requests.get(ARTICLE_API_ROOT)(`/articles?${limit(10, page)}`),
  byAuthor: (author, page) =>
    requests.get(ARTICLE_API_ROOT)(`/articles?author=${encode(author)}&${limit(5, page)}`),
  byTag: (tag, page) =>
    requests.get(ARTICLE_API_ROOT)(`/articles?tag=${encode(tag)}&${limit(10, page)}`),
  del: (slug) => requests.del(ARTICLE_API_ROOT)(`/articles/${slug}`),
  favorite: (slug) => requests.post(ARTICLE_API_ROOT)(`/articles/${slug}/favorite`),
  favoritedBy: (author, page) =>
    requests.get(ARTICLE_API_ROOT)(`/articles?favorited=${encode(author)}&${limit(5, page)}`),
  feed: () => requests.get(ARTICLE_API_ROOT)("/articles/feed?limit=10&offset=0"),
  get: (slug) => requests.get(ARTICLE_API_ROOT)(`/articles/${slug}`),
  unfavorite: (slug) => requests.del(ARTICLE_API_ROOT)(`/articles/${slug}/favorite`),
  update: (article) =>
    requests.put(ARTICLE_API_ROOT)(`/articles/${article.slug}`, { article: omitSlug(article) }),
  create: (article) => requests.post(ARTICLE_API_ROOT)("/articles", { article }),
};

const Comments = {
  create: (slug, comment) =>
    requests.post(ARTICLE_API_ROOT)(`/articles/${slug}/comments`, { comment }),
  delete: (slug, commentId) =>
    requests.del(ARTICLE_API_ROOT)(`/articles/${slug}/comments/${commentId}`),
  forArticle: (slug) => requests.get()(`/articles/${slug}/comments`),
};

const Profile = {
  follow: (username) => requests.post(ARTICLE_API_ROOT)(`/profiles/${username}/follow`),
  get: (username) => requests.get(ARTICLE_API_ROOT)(`/profiles/${username}`),
  unfollow: (username) => requests.del(ARTICLE_API_ROOT)(`/profiles/${username}/follow`),
};

export default {
  Articles,
  Auth,
  Comments,
  Profile,
  Tags,
  setToken: (_token) => {
    token = _token;
  },
};
