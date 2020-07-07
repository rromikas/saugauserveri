const io = require("./socket-server");

const verifyToken = require("./verifications/token");
const verifyFacebook = require("./verifications/facebook");
const verifyGoogle = require("./verifications/google");
const GroupMember = require("./models/groupMemberModel");
const Notification = require("./models/notificationModel");
const {
  ReadUser,
  UpdateUser,
  FacebookSignup,
  GoogleSignup,
  Login,
  Signup,
  GetNotifications,
} = require("./mongoApi/users");
const {
  GetFilteredBooks,
  GetAllBooks,
  GetBook,
  AddBook,
  GetBooks,
  SearchBooks,
  AddBookToFavorites,
  RemoveBookFromFavorites,
  GetRecentlyAddedBooks,
} = require("./mongoApi/books");
const {
  AddSummary,
  GetTopRatedSummaries,
  GetSummary,
  RateSummary,
  GetMostRecentSummaries,
  EditSummary,
} = require("./mongoApi/summaries");
const {
  CreateThread,
  GetUnansweredThreads,
  GetLatestThreads,
  GetTopThreads,
  AddView,
  GetThread,
} = require("./mongoApi/threads");
const {
  ReplyToQuestion,
  VoteForReply,
  CommentSummary,
} = require("./mongoApi/replies");
const {
  GetGroup,
  CreateGroup,
  AddBookToGroup,
  VoteForNextBook,
  CompleteBookReading,
  UpdateGroup,
  InviteToGroup,
  CheckInvitationValidity,
  AcceptInvitationToGroup,
  GetFilteredGroups,
} = require("./mongoApi/groups");
const {
  GetAllQuizzes,
  CreateQuiz,
  GetQuiz,
  SubmitQuizResult,
} = require("./mongoApi/quiz");
const mongoose = require("mongoose");
const { emit } = require("./models/groupMemberModel");

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: true,
  })
  .then(
    () => {
      console.log(`DB connected`);
    },
    (err) => {
      console.log("err", err);
    }
  );

io.on("connection", (socket) => {
  socket.on("/users/read", (token) => {
    verifyToken(token, async (err, user) => {
      let response = err
        ? { error: "couldn't verify user" }
        : await ReadUser(user);
      socket.emit("/users/read", response);
    });
  });

  socket.on("/books/quizzes/getAll", async (bookId, groupId) => {
    let response = await GetAllQuizzes(bookId, groupId);
    socket.emit("/books/quizzes/getAll", response);
  });

  socket.on("/books/quizzes/getOne", async (quizId) => {
    let response = await GetQuiz(quizId);
    socket.emit("/books/quizzes/getOne", response);
  });

  socket.on("/books/quizzes/solved", async (result, groupId, bookId) => {
    let response = await SubmitQuizResult(result, groupId, bookId);
    socket.emit("/books/quizzes/solved", response);
  });

  socket.on("/books/quizzes/create", async (quiz) => {
    console.log("got create reques", quiz);
    let response = await CreateQuiz(quiz);
    socket.emit("/books/quizzes/create", response);
  });

  socket.on("/groups/get", async (groupId) => {
    let response = await GetGroup(groupId);
    socket.emit("/groups/get", response);
  });
  socket.on("/groups/getFiltered", async (filter) => {
    let response = await GetFilteredGroups(filter);
    socket.emit("/groups/getFiltered", response);
  });

  socket.on("/groups/create", async (group) => {
    let response = await CreateGroup(group);
    socket.emit("/groups/create", response);
  });

  socket.on("/groups/update", async (group) => {
    let response = await UpdateGroup(group);
    socket.emit("/groups/update", response);
  });

  socket.on("/groups/addBook", async (groupId, bookId) => {
    let response = await AddBookToGroup(groupId, bookId);
    socket.emit("/groups/addBook", response);
  });

  socket.on("/groups/inviteMember", async (email, userId, groupId) => {
    console.log("email, userId, gorupid", email, userId, groupId);
    let response = await InviteToGroup(email, userId, groupId);
    socket.emit("/groups/inviteMember", response);
  });

  socket.on("/groups/checkInvitationValidity", async (token, invitationId) => {
    console.log("token, invitationId", token, invitationId);
    let response = await CheckInvitationValidity(token, invitationId);
    socket.emit("/groups/checkInvitationValidity", response);
  });

  socket.on(
    "/groups/acceptInvitation",
    async (groupId, userId, invitationId) => {
      let response = await AcceptInvitationToGroup(
        groupId,
        userId,
        invitationId
      );
      socket.emit("/groups/acceptInvitation", response);
    }
  );

  socket.on("/groups/voteForNextBook", async (bookId, userId) => {
    let response = await VoteForNextBook(bookId, userId);
    socket.emit("/groups/voteForNextBook", response);
  });

  socket.on("/groups/completeBookReading", async (groupId, bookId) => {
    let response = await CompleteBookReading(groupId, bookId);
    socket.emit("/groups/completeBookReading", response);
  });

  socket.on("/users/facebookSignup", (user) => {
    verifyFacebook(user, async () => {
      let response = await FacebookSignup(user);
      socket.emit("/users/facebookSignup", response);
    });
  });

  socket.on("/users/googleSignup", (user) => {
    verifyGoogle(user, async () => {
      let response = await GoogleSignup(user);
      socket.emit("/users/googleSignup", response);
    });
  });

  socket.on("/users/update", (data) => {
    verifyToken(data.token, async (error, user) => {
      data.email = user.email;
      let response = await UpdateUser(data);
      socket.emit("/users/update", response);
    });
  });
  socket.on("/users/signup", async (user) => {
    let response = await Signup(user);
    socket.emit("/users/signup", response);
  });
  socket.on("/users/login", async (user) => {
    let response = await Login(user);
    socket.emit("/users/login", response);
  });

  socket.on("/users/getNotifications", async (userId) => {
    let response = await GetNotifications(userId);
    socket.emit("/users/getNotifications", response);
  });

  socket.on("/books/getFiltered", async (filters) => {
    let response = await GetFilteredBooks(filters);
    socket.emit("/books/getFiltered", response);
  });

  socket.on("/books/getAll", async () => {
    let response = await GetAllBooks();
    socket.emit("/books/getAll", response);
  });

  socket.on("/books/getBooks", async (query) => {
    let response = await GetBooks(query);
    socket.emit("/books/getBooks", response);
  });

  socket.on("/books/getRecentlyAddedBooks", async () => {
    let response = await GetRecentlyAddedBooks();
    socket.emit("/books/getRecentlyAddedBooks", response);
  });

  socket.on("/books/getOne", async (bookFilter) => {
    let response = await GetBook(bookFilter);
    socket.emit("/books/getOne", response);
  });

  socket.on("/books/add", async (book) => {
    let response = await AddBook(book);
    socket.emit("/books/add", response);
  });

  socket.on("/books/search", async (query) => {
    let response = await SearchBooks(query);
    socket.emit("/books/search", response);
  });

  socket.on("/books/createThread", async (thread) => {
    let response = await CreateThread(thread);
    socket.emit("/books/createThread", response);
  });

  socket.on("/books/getLatestThreads", async (props) => {
    let response = await GetLatestThreads(props);
    socket.emit("/books/getLatestThreads", response);
  });
  socket.on("/books/getUnansweredThreads", async (props) => {
    let response = await GetUnansweredThreads(props);
    socket.emit("/books/getUnansweredThreads", response);
  });
  socket.on("/books/getTopThreads", async (props) => {
    let response = await GetTopThreads(props);
    socket.emit("/books/getTopThreads", response);
  });
  socket.on("/books/replyToQuestion", async (reply) => {
    let response = await ReplyToQuestion(reply);
    socket.emit("/books/replyToQuestion", response);
  });
  socket.on("/books/addView", async (props) => {
    let response = await AddView(props);
    socket.emit("/books/addView", response);
  });
  socket.on("/books/getThread", async (props) => {
    let response = await GetThread(props);
    socket.emit("/books/getThread", response);
  });
  socket.on("/books/addToFavorites", async (props) => {
    let response = await AddBookToFavorites(props);
    socket.emit("/books/addToFavorites", response);
  });
  socket.on("/books/removeFromFavorites", async (props) => {
    let response = await RemoveBookFromFavorites(props);
    socket.emit("/books/removeFromFavorites", response);
  });
  socket.on("/books/getTopRatedSummaries", async (props) => {
    let response = await GetTopRatedSummaries(props);
    socket.emit("/books/getTopRatedSummaries", response);
  });
  socket.on("/books/getMostRecentSummaries", async (props) => {
    let response = await AddBookToFavorites(props);
    socket.emit("/books/getMostRecentSummaries", response);
  });
  socket.on("/books/addSummary", async (props) => {
    let response = await AddSummary(props);
    socket.emit("/books/addSummary", response);
  });
  socket.on("/books/editSummary", async (props) => {
    let response = await EditSummary(props);
    socket.emit("/books/editSummary", response);
  });
  socket.on("/books/voteForReply", async (props) => {
    let response = await VoteForReply(props);
    socket.emit("/books/voteForReply", response);
  });

  socket.on("/books/summaries/getSummary", async (props) => {
    let response = await GetSummary(props);
    socket.emit("/books/getSummary", response);
  });

  socket.on("/books/summaries/rateSummary", async (props) => {
    let response = await RateSummary(props);
    socket.emit("/books/summaries/rateSummary", response);
  });
  socket.on("/books/summaries/commentSummary", async (props) => {
    let response = await CommentSummary(props);
    socket.emit("/books/summaries/commentSummary", response);
  });
  socket.on("/books/summaries/getMostRecentSummaries", async (props) => {
    let response = await GetMostRecentSummaries(props);
    socket.emit("/books/summaries/getMostRecentSummaries", response);
  });
  socket.on("/books/summaries/getTopRatedSummaries", async (props) => {
    let response = await GetTopRatedSummaries(props);
    socket.emit("/books/summaries/getTopRatedSummaries", response);
  });
});

async function labas() {
  let notifications = await Notification.find({
    receiver_id: "5ed8b3e4d7216a05d305f613",
    seen: false,
  });
  console.log("notifications", notifications);
}
labas();
