const { OK } = require('http-status-codes');
const router = require('express').Router();

const wordService = require('./word.service');
const { BAD_REQUEST_ERROR } = require('../../errors/appErrors');
const extractQueryParam = require('../../utils/getQueryNumberParameter');

router.route('/').get(async (req, res) => {
  const page = extractQueryParam(req.query.page, 0);
  const group = extractQueryParam(req.query.group, 0);

  if (isNaN(page) || isNaN(group)) {
    throw new BAD_REQUEST_ERROR(
      'Wrong query parameters: the group, page numbers should be valid integers'
    );
  }

  const words = await wordService.getAll({
    page,
    group
  });
  res.status(OK).send(words.map(word => word.toResponse()));
});

router.route('/:id').get(async (req, res) => {
  const word = await wordService.get(req.params.id);
  res.status(OK).send(word.toResponse());
});

router.route('/:id/:count').get(async (req, res) => {
  const word = await wordService.get(req.params.id);
  const page = word.page || 0;
  const group = word.group || 0;

  let words = await wordService.getAll({
    page,
    group
  });

  let currentIndex = words.findIndex(w => w === req.params.id);
  if (currentIndex === -1) currentIndex = 0;
  words = [
    ...words.slice(0, currentIndex),
    ...words.slice(currentIndex + 1, words.length)
  ];
  const translates = [];
  for (let i = 0; i < req.params.count; i++) {
    const index = Math.floor(Math.random() * words.length);
    if (words[index].id === req.params.id) {
      i -= 1;
    } else {
      translates.push(words[index].wordTranslate);
    }
    words = [...words.slice(0, index), ...words.slice(index + 1, words.length)];
  }

  word.translates = translates;

  res.status(OK).send(word.toResponse());
});

module.exports = router;
