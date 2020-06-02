const User = require("../models/usersModel");
const Books = require("../models/booksModel");
const rp = require("request-promise");
require("dotenv").config();

module.exports.GetFilteredBooks = (filters) => {
  return new Promise(async (resolve, reject) => {
    try {
      const foundBooks = await Books.find().and([
        { $or: filters.genres },
        { $or: filters.authors },
        { $or: filters.publishers },
      ]);
      if (foundBooks) {
        resolve({ foundBooks });
      } else resolve({ error: true });
    } catch (er) {
      resolve({ error: true });
    }
  });
};

module.exports.GetAllBooks = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const allBooks = await Books.find({});
      if (allBooks) {
        resolve({ allBooks });
      } else resolve({ error: "No books in library" });
    } catch (err) {
      resolve({ error: "syntax error" });
    }
  });
};

module.exports.GetRecentlyAddedBooks = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const recentlyAddedBooks = await Books.find({})
        .sort({ dateAdded: "desc" })
        .limit(20)
        .exec();
      if (recentlyAddedBooks) {
        resolve({ recentlyAddedBooks });
      } else resolve({ error: "No books in library" });
    } catch (err) {
      resolve({ error: "syntax error" });
    }
  });
};

module.exports.GetBooks = (query) => {
  return new Promise((resolve, reject) => {
    const options = {
      uri: process.env.BOOKSURI,
      qs: {
        key: process.env.BOOKSAPI,
        q: query.isbn ? `isbn:${query.isbn}` : query.title,
      },
      headers: {
        "User-Agent": "Request-Promise",
      },
      json: true,
    };
    rp(options)
      .then(function (repos) {
        if (repos.error || repos.totalItems === 0) {
          resolve({ found: false, books: [] });
        } else {
          resolve({ found: true, books: repos.items });
        }
      })
      .catch(function (err) {
        resolve({ found: false, books: [] });
      });
  });
};

module.exports.GetBook = (bookFilter) => {
  return new Promise(async (resolve, reject) => {
    try {
      const filteredBooks = await Books.find(bookFilter)
        .populate({ path: "threads", populate: { path: "createdBy" } })
        .populate("favoriteFor")
        .exec();
      if (filteredBooks) {
        resolve({ filteredBooks });
      } else resolve({ error: "No such book" });
    } catch (err) {
      resolve({ error: "Syntax error" });
    }
  });
};

module.exports.AddBook = (book) => {
  return new Promise(async (resolve, reject) => {
    try {
      const savedBook = await Books.findOneAndUpdate(book, book, {
        upsert: true,
        new: true,
      });
      if (savedBook) {
        resolve({ success: true, savedBook });
      } else resolve({ error: "Failed to add book" });
    } catch (err) {
      resolve({ error: "syntax error" });
    }
  });
};

module.exports.SearchBooks = (query) => {
  return new Promise(async (resolve, reject) => {
    try {
      const foundBooks = await Books.find().or([
        { title: { $regex: query, $options: "i" } },
        { isbn10: query },
        { isbn13: query },
        { authors: { $regex: query, $options: "i" } },
        { genre: { $regex: query, $options: "i" } },
      ]);
      if (foundBooks) {
        resolve({ foundBooks });
      } else resolve({ error: "No such books" });
    } catch (er) {
      resolve({ error: "Syntax error" });
    }
  });
};

module.exports.AddBookToFavorites = ({ bookId, userId }) => {
  return new Promise(async (resolve, reject) => {
    try {
      let updatedBook;
      const updatedUser = await User.findOneAndUpdate(
        { _id: userId, favoriteBooks: { $ne: bookId } },
        {
          $push: {
            favoriteBooks: bookId,
          },
        }
      );

      if (updatedUser) {
        updatedBook = await Books.findOneAndUpdate(
          { _id: bookId },
          {
            $push: {
              favoriteFor: userId,
            },
          }
        );
      }

      console.log("updaetd user", updatedUser);
      if (updatedBook && updatedUser) {
        resolve({ updatedUser, updatedBook });
      } else {
        resolve({ error: "Couldn't  add to favorite" });
      }
    } catch (er) {
      console.log("ad book to favortie error catch", er);
      resolve({ error: "Syntax error" });
    }
  });
};

module.exports.RemoveBookFromFavorites = ({ bookId, userId }) => {
  return new Promise(async (resolve, reject) => {
    try {
      let updatedBook;
      const updatedUser = await User.findOneAndUpdate(
        { _id: userId },
        { $pull: { favoriteBooks: bookId } }
      );

      if (updatedUser) {
        updatedBook = await Books.findOneAndUpdate(
          { _id: bookId },
          {
            $pull: {
              favoriteFor: userId,
            },
          }
        );
      }

      if (updatedBook && updatedUser) {
        resolve({ updatedUser, updatedBook });
      } else {
        resolve({ error: "Couldn't  remove from favorite" });
      }
    } catch (er) {
      console.log("remove book to favortie error catch", er);
      resolve({ error: "Syntax error" });
    }
  });
};
