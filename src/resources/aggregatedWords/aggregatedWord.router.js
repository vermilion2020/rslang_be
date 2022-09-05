const { OK } = require('http-status-codes');
const router = require('express').Router({ mergeParams: true });

const { wordId } = require('../../utils/validation/schemas');
const { validator } = require('../../utils/validation/validator');
const aggregatedWordsService = require('./aggregatedWord.service');
const { BAD_REQUEST_ERROR } = require('../../errors/appErrors');
const extractQueryParam = require('../../utils/getQueryNumberParameter');

router.get('/', async (req, res) => {
  const perPage = extractQueryParam(req.query.wordsPerPage, 10);
  const page = extractQueryParam(req.query.page, 0);
  const group = extractQueryParam(req.query.group);

  if ((req.query.group && isNaN(group)) || isNaN(page) || isNaN(perPage)) {
    throw new BAD_REQUEST_ERROR(
      'Wrong query parameters: the group, page and words-per-page numbers should be valid integers'
    );
  }

  const filter = req.query.filter ? JSON.parse(req.query.filter) : null;

  const words = await aggregatedWordsService.getAll(
    req.userId,
    group,
    page,
    perPage,
    filter
  );
  res.status(OK).send(words);
});

router.get('/pages/:wordPage', async (req, res) => {
  const perPage = 20;
  const page = 0;
  const wordPage = +req.params.wordPage;
  const group = extractQueryParam(req.query.group);

  if ((req.query.group && isNaN(group)) || isNaN(page) || isNaN(perPage)) {
    throw new BAD_REQUEST_ERROR(
      'Wrong query parameters: the group, page and words-per-page numbers should be valid integers'
    );
  }

  const filter = req.query.filter ? JSON.parse(req.query.filter) : null;

  const allWords = [];

  for (let i = wordPage; i < wordPage + 5; i += 1) {
    const w = await aggregatedWordsService.getAllPage(
      req.userId,
      group,
      i,
      page,
      perPage,
      filter
    );
    const countWords = w[0].paginatedResults.length;
    allWords.push({ page: i, countWords });
  }

  const wordStatuses = allWords.map(w => w.countWords === 20);

  res.status(OK).send(wordStatuses);
});

router.get('/:wordId', validator(wordId, 'params'), async (req, res) => {
  const word = await aggregatedWordsService.get(req.params.wordId, req.userId);

  res.status(OK).send(word);
});

module.exports = router;
