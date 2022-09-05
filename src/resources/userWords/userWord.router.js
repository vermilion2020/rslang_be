const { OK, NO_CONTENT } = require('http-status-codes');
const router = require('express').Router({ mergeParams: true });
const { userWord, wordId } = require('../../utils/validation/schemas');
const { validator } = require('../../utils/validation/validator');
const statisticsService = require('../statisticsNew/statistic.service.js');

const userWordService = require('./userWord.service');

router.get('/', async (req, res) => {
  const userWords = await userWordService.getAll(req.userId);
  res.status(OK).send(userWords.map(w => w.toResponse()));
});

router.get('/:wordId', validator(wordId, 'params'), async (req, res) => {
  const word = await userWordService.get(req.params.wordId, req.userId);
  res.status(OK).send(word.toResponse());
});

router.post(
  '/:wordId',
  validator(wordId, 'params'),
  validator(userWord, 'body'),
  async (req, res) => {
    const difficulty = req.body.difficulty || '';
    const word = await userWordService.save(
      req.params.wordId,
      req.userId,
      req.body
    );
    const source = req.body.optional.source || 'common';
    await statisticsService.save(req.userId, {
      value: 1,
      source,
      field: 'new',
      totalValue: 0
    });
    if (difficulty === 'easy') {
      await statisticsService.save(req.userId, {
        value: 1,
        source,
        field: 'easy',
        totalValue: 0
      });
    }
    res.status(OK).send(word.toResponse());
  }
);

router.put(
  '/:wordId',
  validator(wordId, 'params'),
  validator(userWord, 'body'),
  async (req, res) => {
    const source = req.body.optional.source || 'common';
    const difficulty = req.body.difficulty || '';
    let statBody = {};
    if (difficulty === 'easy') {
      statBody = {
        value: 1,
        source,
        field: 'easy',
        totalValue: 0
      };
      await statisticsService.save(req.userId, statBody);
    } else {
      const wordOld = await userWordService.get(req.params.wordId, req.userId);
      const difficultyOld = wordOld.difficulty;
      if (
        (difficulty === 'base' || difficulty === 'hard') &&
        difficultyOld === 'easy'
      ) {
        statBody = {
          value: -1,
          source,
          field: 'easy',
          totalValue: 0
        };
        await statisticsService.save(req.userId, statBody);
      }
    }
    const word = await userWordService.update(
      req.params.wordId,
      req.userId,
      req.body
    );
    res.status(OK).send(word.toResponse());
  }
);

router.delete('/:wordId', validator(wordId, 'params'), async (req, res) => {
  await userWordService.remove(req.params.wordId, req.userId);
  res.sendStatus(NO_CONTENT);
});

module.exports = router;
