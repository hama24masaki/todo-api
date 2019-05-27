const express = require('express');
const router = express.Router();
const NotFoundError = require("../utils/not_found_error");
const authChecker = require("../utils/auth_checker");
const models = require('../models');
const debug = require('debug')('app:tasks');
const moment = require('moment-timezone');

const onError = (err, res) => {
  debug(err)
  return res.status(500).json({
    error: "Server error",
    message: `${err.name}: ${err.message}`,
  });
};

const onNotFoundErrorOrElse = (err, res) => {
  if (err instanceof NotFoundError)
    return res.status(404).end();
  else
    return onError(err, res);
};


router.use(authChecker); // path指定も可能

router.get('/', (req, res) => {
  const uid = req.header.authenticated_uid;
  return models.Task.searchWithQuery(uid, req.query.q, req.query.sort, req.query.limit, req.query.offset)
  .then(list => {
    return res.json(list);
  })
  .catch(err => onError(err, res));
});

router.get('/:taskId', (req, res) => {
  return models.Task.getById(req.header.authenticated_uid, req.params.taskId)
  .then(model => {
    debug(model.dataValues)
    return res.json(model.dataValues);
  })
  .catch(err => onNotFoundErrorOrElse(err, res));
});

router.post("/", (req, res) => {
  if (!req.body.body)
    return res.status(400).json({ message: "task body is required." });
  
  const dateAt = req.body.at || moment().toDate();
  const data = {
    userId: req.header.authenticated_uid, 
    title: req.body.title,
    body: req.body.body,
    createdAt: dateAt,
    updatedAt: dateAt,
  }
  // debug(data);
  return models.Task.create(data)
  .then(task => {
    // debug(req.originalUrl, req.baseUrl, req.path)
    return res.status(201)
      .header("Location", `${req.baseUrl}${req.path}${task.id}`)
      .json(task.toJsonResult()); // 201 Created
  })
  .catch(err => onError(err, res));
});

router.patch("/:taskId", (req, res) => {
  if (!req.body.body)
    return res.status(400).json({ message: "task body is required." });
 
  const dateAt = req.body.at || moment().toDate();
  return models.Task.getById(req.header.authenticated_uid, req.params.taskId)
  .then(task => {
    return task.update({
      title: req.body.title,
      body: req.body.body,
      updatedAt: dateAt,
      editedAt: dateAt,
    }).then(() => task)
  })
  .then(task => {
    return res.json(task.toJsonResult()).end();
  })
  .catch(err => onNotFoundErrorOrElse(err, res));
});

router.delete("/:taskId", (req, res) => {
  return models.Task.getById(req.header.authenticated_uid, req.params.taskId)
  .then(task => {
    return task.destroy()
  })
  .then(() => {
    return res.status(204).end() // 204 No Content
  })
  .catch(err => onNotFoundErrorOrElse(err, res));
});

router.put("/:taskId/star", (req, res) => {
  return models.Task.getById(req.header.authenticated_uid, req.params.taskId)
  .then(task => {
    return task.update({ stared: true })
  })
  .then(task => {
    return res.status(200).end();
  })
  .catch(err => onNotFoundErrorOrElse(err, res));
});

router.delete("/:taskId/star", (req, res) => {
  return models.Task.getById(req.header.authenticated_uid, req.params.taskId)
  .then(task => {
    return task.update({ stared: false })
  })
  .then(task => {
    return res.status(200).end();
  })
  .catch(err => onNotFoundErrorOrElse(err, res));
});



module.exports = router;
