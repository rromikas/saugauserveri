const io = require("./socket-server");

const verifyToken = require("./verifications/token");
const verifyFacebook = require("./verifications/facebook");
const verifyGoogle = require("./verifications/google");

const {
  ReadUser,
  UpdateUser,
  FacebookSignup,
  GoogleSignup,
  Login,
  Signup,
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
const { AddSummary, GetTopRatedSummaries } = require("./mongoApi/summaries");
const {
  CreateThread,
  GetUnansweredThreads,
  GetLatestThreads,
  GetTopThreads,
  AddView,
  GetThread,
} = require("./mongoApi/threads");
const { ReplyToQuestion, VoteForReply } = require("./mongoApi/replies");
const mongoose = require("mongoose");

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
    verifyToken(data.token, async (user) => {
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
    console.log("recent boks reaqeust");
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
    console.log("received request get top rated summaries", props);
    let response = await GetTopRatedSummaries(props);
    socket.emit("/books/getTopRatedSummaries", response);
  });
  socket.on("/books/getMostRecentSummaries", async (props) => {
    let response = await AddBookToFavorites(props);
    socket.emit("/books/getMostRecentSummaries", response);
  });
  socket.on("/books/addSummary", async (props) => {
    console.log("add summary received", props);
    let response = await AddSummary(props);
    console.log("add summary resposne", response);
    socket.emit("/books/addSummary", response);
  });
  socket.on("/books/voteForReply", async (props) => {
    let response = await VoteForReply(props);
    socket.emit("/books/voteForReply", response);
  });
});
