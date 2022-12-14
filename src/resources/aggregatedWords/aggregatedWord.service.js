const wordRepo = require('./aggregatedWord.db.repository');

const getAll = async (userId, group, page, perPage, filter) =>
  wordRepo.getAll(userId, group, page, perPage, filter);

const getAllPage = async (userId, group, wordPage, page, perPage, filter) =>
  wordRepo.getAllPage(userId, group, wordPage, page, perPage, filter);

const get = async (wordId, userId) => wordRepo.get(wordId, userId);

module.exports = { getAll, getAllPage, get };
