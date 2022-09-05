const { OK } = require('http-status-codes');
const router = require('express').Router({ mergeParams: true });
const statisticService = require('./statistic.service');
const { statisticsNew } = require('../../utils/validation/schemas');
const { validator } = require('../../utils/validation/validator');

function sendDayStatFields(statistic, res, source) {
  // get learned words for common stat
  const easy = statistic
    .filter(st => st.field === 'easy')
    .reduce((prev, curr) => prev + curr.value, 0);
  // get new words for every stat
  const summNew = statistic
    .filter(st => st.field === 'new')
    .reduce((prev, curr) => prev + curr.value, 0);
  // get percent success for every stat
  const statPercent = statistic.filter(st => st.field === 'successPercent');
  const success = statPercent.reduce((prev, curr) => prev + curr.value, 0);
  const total =
    statPercent.reduce((prev, curr) => prev + curr.totalValue, 0) || 1;
  const percent = +((success / total) * 100).toFixed(2);
  // get max success for game stats
  const statMaxSuccess = statistic.filter(st => st.field === 'maxSuccess');
  const statSuccessValues = statMaxSuccess.map(st => st.value);
  const maxSuccess = statMaxSuccess.length ? Math.max(...statSuccessValues) : 0;
  const result = { new: summNew, percent };
  // set different result arrays for game or common stats
  if (source === 'common') {
    result.easy = easy;
  } else {
    result['maxSuccess'] = maxSuccess;
  }
  res.status(OK).send({ ...result });
}

router.get('/day/:source', async (req, res) => {
  const statistic = await statisticService.getDayStats(
    req.params.source,
    '',
    req.userId
  );
  sendDayStatFields(statistic, res, req.params.source);
});

router.get('/day', async (req, res) => {
  const statistic = await statisticService.getDayStats('', '', req.userId);
  sendDayStatFields(statistic, res, 'common');
});

const getCombined = (arr, val) => {
  return arr
    .filter(st => st.value === val)
    .map(st => st.date)
    .reduce((vals, date) => {
      vals[date] = date in vals ? (vals[date] += 1) : 0;
      return vals;
    }, {});
};

const getAllKeys = arr => {
  return Object.keys(
    arr
      .map(st => st.date)
      .reduce((vals, date) => {
        vals[date] = date in vals ? (vals[date] += 1) : 0;
        return vals;
      }, {})
  );
};

router.get('/all/:field', async (req, res) => {
  const statistic = await statisticService.getAllStats(
    req.params.field,
    req.userId
  );
  const vAll = getAllKeys(statistic);
  const wPlus = getCombined(statistic, 1);
  const wMinus = getCombined(statistic, -1);
  let result = {};

  if (req.params.field === 'new') {
    result = wPlus;
  } else if (req.params.field === 'easy') {
    vAll.forEach(key => {
      const minus = wMinus[key] || 0;
      const plus = wPlus[key] || 0;
      result[key] = plus - minus;
    });
  }

  res.status(OK).send(result);
});

router.post('/', validator(statisticsNew, 'body'), async (req, res) => {
  const statistic = await statisticService.save(req.userId, req.body);
  res.status(OK).send(statistic.toResponse());
});

module.exports = router;
