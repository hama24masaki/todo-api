
process.env.NODE_ENV = 'test';

const models = require('../models');
const debug = require('debug')('app:test');
const moment = require('moment-timezone');
const app = require('../app');

// test flamework
const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
chai.use(chaiHttp);


const userData = {
  email: "test@gmail.com",
  password: "hogehoge",
};

beforeEach(() => {
  // debug("clean!")
  return models.User.destroy({
    where: {},
    truncate: false,
  })
  .then(() => {
    return models.Task.destroy({
      where: {},
      truncate: false,
    })
  })
});

describe('User API: /users', () => {

  it('Default user should create and return token.', () => {
    return chai.request(app).post('/beta-v1/users').send(userData)
    .then(res => {
      debug(res.body)
      res.should.have.status(200);
      res.body.should.have.property('token');
    });
  });

  it('Duplicate email should failed.', () => {
    return chai.request(app).post('/beta-v1/users').send(userData)
    .then(res => {
      res.should.have.status(200);
      return chai.request(app).post('/beta-v1/users').send(userData)
    })
    .then(res => {
      debug(res.body)
      res.should.have.status(400);
      res.body.should.have.property('message');
      res.body.message.should.equal('Assigned email is already exists.');
    });
  });
});

describe('Auth API: /users/auth', () => {

  it('Default user should authenticate.', () => {
    return chai.request(app).post('/beta-v1/users').send(userData)
    .then(res => {
      res.should.have.status(200);
      return chai.request(app).post('/beta-v1/users/auth').send(userData)
    })
    .then(res => {
      res.should.have.status(200);
      res.body.should.have.property('token');
    });
  });
});

describe("Task API: /tasks", () => {

  it('Access without token should failed.', () => {
    return chai.request(app).get('/beta-v1/tasks')
    .then(res => {
      res.should.have.status(400);
      res.body.error.should.equal('Unautholized');
    });
  });

  it('Access with token should ok.', () => {
    return chai.request(app).post('/beta-v1/users').send(userData)
    .then(res => {
      const token = res.body.token;
      return chai.request(app).get('/beta-v1/tasks').set("Authentication", token)
    })
    .then(res => {
      res.should.have.status(200);
      res.body.should.be.an('array').to.have.lengthOf(0);
    });
  });

  function prepareUser() {
    return chai.request(app).post('/beta-v1/users').send(userData)
    .then(res => {
      return res.body.token;
    })
  }

  const taskData = {
    title: "title",
    body: "task description or body",
  }

  describe("/POST tasks", () => {
    it('New task should create.', () => {
      return prepareUser()
      .then(token => {
        return chai.request(app).post('/beta-v1/tasks').set("Authentication", token).send(taskData)
      })
      .then(res => {
        res.should.have.status(201);
        res.should.have.header("Location");
        res.body.should.be.an('object');
        res.body.should.have.property('id');
        res.body.title.should.equal(taskData.title);
        res.body.body.should.equal(taskData.body);
        res.body.should.have.property('createdAt');
        res.body.should.have.property('updatedAt');
        res.body.createdAt.should.equal(res.body.updatedAt);
        // res.body.should.not.have.property('userId');
      })
    });
  });

  function prepareUserAndTask() {
    return prepareUser()
    .then(token => {
      return chai.request(app).post('/beta-v1/tasks').set("Authentication", token).send(taskData)
      .then(res => {
        return [token, res.body.id];
      })
    })
  }

  describe("/PATCH tasks/{id}", () => {
    it('Task should uodate.', () => {
      const update = {
        title: "modified title",
        body: "modified task description or body",
      }
      return prepareUserAndTask()
      .then(ret => {
        debug(ret)
        return chai.request(app).patch(`/beta-v1/tasks/${ret[1]}`).set("Authentication", ret[0]).send(update)
      })
      .then(res => {
        res.should.have.status(200);
        res.should.not.have.header("Location");
        res.body.should.be.an('object');
        res.body.should.have.property('id');
        res.body.title.should.equal(update.title);
        res.body.body.should.equal(update.body);
        res.body.should.have.property('createdAt');
        res.body.should.have.property('updatedAt');
        res.body.createdAt.should.not.equal(res.body.updatedAt);
        // res.body.should.not.have.property('userId');
      })
    });
  });

  describe("/DELETE tasks/{id}", () => {
    it('Task should delete.', () => {
      return prepareUserAndTask()
      .then(ret => {
        debug(ret)
        return chai.request(app).delete(`/beta-v1/tasks/${ret[1]}`).set("Authentication", ret[0])
      })
      .then(res => {
        res.should.have.status(204);
        res.body.should.be.empty;
      })
    });
  });

  describe("/GET tasks", () => {

    function prepareUserAndTasks() {
      const tasks = [
        { body: "task 1 aaaaa" },
        { body: "task 2 bbbbb" },
        { body: "task 3 ccccc" },
        { body: "task 4 ddddd" },
        { body: "task 5 eeeee" },
      ]
      return prepareUser()
      .then(token => {
        return Promise.all(tasks.map(t => {
          return chai.request(app).post('/beta-v1/tasks').set("Authentication", token).send(t)
        }))
        .then(() => token);
      })
    }

    it('Should get all tasks.', () => {
      return prepareUserAndTasks()
      .then(token => {
        return chai.request(app).get('/beta-v1/tasks').set("Authentication", token)
      })
      .then(res => {
        res.should.have.status(200);
        res.body.should.be.an('array').to.have.lengthOf(5);
      });
    });

  });

});