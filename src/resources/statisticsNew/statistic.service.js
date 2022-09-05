const statisticRepo = require('./statistic.db.repository');

const getDayStats = async (source, field, userId) =>
  statisticRepo.getDayStats(source, field, userId);

const getAllStats = async (field, userId) =>
  statisticRepo.getAllStats(field, userId);

const save = async (userId, statistic) =>
  statisticRepo.save(userId, { ...statistic, userId });

const remove = async userId => statisticRepo.remove(userId);

module.exports = { save, getDayStats, getAllStats, remove };
