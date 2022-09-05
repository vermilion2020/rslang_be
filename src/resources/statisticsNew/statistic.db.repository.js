const StatisticsNew = require('./statistic.model');
const { NOT_FOUND_ERROR } = require('../../errors/appErrors');

const getDayStats = async (source, field, userId) => {
  let statistic = [];
  const todayDate = new Date().toLocaleDateString('en');
  if (field) {
    statistic = await StatisticsNew.find({
      date: todayDate,
      source,
      field,
      userId
    });
  } else if (source) {
    statistic = await StatisticsNew.find({
      date: todayDate,
      source,
      userId
    });
  } else {
    statistic = await StatisticsNew.find({
      date: todayDate,
      userId
    });
  }
  if (!statistic) {
    throw new NOT_FOUND_ERROR(
      'statisticNew',
      `userId: ${userId}, field: ${field}, source: ${source}`
    );
  }

  return statistic;
};

const getAllStats = async (field, userId) => {
  let statistic = [];
  statistic = await StatisticsNew.find({
    field,
    source: 'common',
    userId
  });
  if (!statistic) {
    throw new NOT_FOUND_ERROR(
      'statisticNew',
      `userId: ${userId}, field: ${field}`
    );
  }

  return statistic;
};

const save = async (userId, statistic) => {
  const date = new Date().toLocaleDateString('fr-CA');
  return await StatisticsNew.create({ ...statistic, date });
};

const remove = async userId => StatisticsNew.deleteOne({ userId });

module.exports = { getDayStats, getAllStats, save, remove };
