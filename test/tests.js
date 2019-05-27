
process.env.NODE_ENV = 'test';

const models = require('../models');
const debug = require('debug')('test:');
const moment = require('moment-timezone');
const app = require('../app');

// test flamework
const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
chai.use(chaiHttp);


const defaultUserData = {
  email: "test111@gmail.com",
  password: "hogehoge",
};
const anotherUserData = {
  email: "test222@gmail.com",
  password: "fugafuga",
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
    return chai.request(app).post('/beta-v1/users').send(defaultUserData)
    .then(res => {
      debug(res.body)
      res.should.have.status(200);
      res.body.should.have.property('token');
    });
  });

  it('Duplicate email should failed.', () => {
    return chai.request(app).post('/beta-v1/users').send(defaultUserData)
    .then(res => {
      res.should.have.status(200);
      return chai.request(app).post('/beta-v1/users').send(defaultUserData)
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
    return chai.request(app).post('/beta-v1/users').send(defaultUserData)
    .then(res => {
      res.should.have.status(200);
      return chai.request(app).post('/beta-v1/users/auth').send(defaultUserData)
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
    return chai.request(app).post('/beta-v1/users').send(defaultUserData)
    .then(res => {
      const token = res.body.token;
      return chai.request(app).get('/beta-v1/tasks').set("Authentication", token)
    })
    .then(res => {
      res.should.have.status(200);
      res.body.should.be.an('array').to.have.lengthOf(0);
    });
  });

  function prepareUser(data = defaultUserData) {
    return chai.request(app).post('/beta-v1/users').send(data)
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

    it('Task body should be required.', () => {
      return prepareUser()
      .then(token => {
        return chai.request(app).post('/beta-v1/tasks').set("Authentication", token).send({
          title: "taitoru"
        })
      })
      .then(res => {
        res.should.have.status(400);
        res.body.error.should.equal('Invalid argument');
        res.body.message.should.equal('Task body is required.');
      })
    });

    it('CreatedAt should be able to design.', () => {
      return prepareUser()
      .then(token => {
        return chai.request(app).post('/beta-v1/tasks').set("Authentication", token).send({
          body: "task with createdAt",
          at: "2019-06-01T11:15:00+0900" // JST
        })
      })
      .then(res => {
        // debug(res.body)
        res.should.have.status(201);
        res.body.createdAt.should.equal('2019-06-01T02:15:00.000Z'); // 
        res.body.createdAt.should.equal(res.body.updatedAt);
      })
    });

    it('Date-string should be restrictly formatted.', () => {
      return prepareUser()
      .then(token => {
        return chai.request(app).post('/beta-v1/tasks').set("Authentication", token).send({
          body: "task with createdAt",
          at: "eeeee"
        })
      })
      .then(res => {
        res.should.have.status(400);
        res.body.error.should.equal('Invalid argument');
        // res.body.createdAt.should.equal(res.body.updatedAt);
      })
    });
  });

  function prepareUserAndTask(data = defaultUserData) {
    return prepareUser(data)
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

    it('UpdatedAt should be able to design.', () => {
      return prepareUserAndTask()
      .then(ret => {
        return chai.request(app).patch(`/beta-v1/tasks/${ret[1]}`).set("Authentication", ret[0]).send({
          body: "task with updatedAt",
          at: "2019-06-01T15:15:00+0000" // not JST
        })
      })
      .then(res => {
        res.should.have.status(200);
        res.body.updatedAt.should.equal('2019-06-01T15:15:00.000Z'); // 
        res.body.createdAt.should.not.equal(res.body.updatedAt);
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

    function prepareUserAndTasks(data = defaultUserData) {
      const tasks = [
        { body: "task 1 aaaaa", title: "fff" },
        { body: "task 2 bbbbb", title: "777" },
        { body: "task 3 ccccc", title: "xyz" },
        { body: "task 4 ddddd", title: "ccc" },
        { body: "task 5 eeeee", title: "xyz" },
      ]
      return prepareUser(data)
      .then(token => {
        return Promise.all(tasks.map(t => {
          return chai.request(app).post('/beta-v1/tasks').set("Authentication", token).send(t)
        }))
        .then(() => token);
      })
    }

    it('Should get all tasks of his/her own.', () => {
      return prepareUserAndTasks(anotherUserData)
      .then(() => {
        return prepareUserAndTasks(defaultUserData)
      })
      .then(token => {
        return chai.request(app).get('/beta-v1/tasks')
        .set("Authentication", token)
      })
      .then(res => {
        res.should.have.status(200);
        res.body.should.be.an('array').to.have.lengthOf(5);
      });
    });

    it('Q-param should query part of tasks from body and title.', () => {
      return prepareUserAndTasks()
      .then(token => {
        // "cc"でTitleとBodyを部分一致検索する
        return chai.request(app).get('/beta-v1/tasks?q=cc')
        .set("Authentication", token)
      })
      .then(res => {
        res.should.have.status(200);
        res.body.should.be.an('array').to.have.lengthOf(2);
      });
    });

    it('Tasks should ordered by sort-params.', () => {
      return prepareUserAndTasks()
      .then(token => {
        // Titleの昇順、Bodyの降順 でソートする
        return chai.request(app).get('/beta-v1/tasks?sort=title,-body')
        .set("Authentication", token)
      })
      .then(res => {
        res.should.have.status(200);
        res.body.should.be.an('array').to.have.lengthOf(5);
        res.body[0].body.should.equal("task 2 bbbbb")
        res.body[1].body.should.equal("task 4 ddddd")
        res.body[2].body.should.equal("task 1 aaaaa")
        res.body[3].body.should.equal("task 5 eeeee")
        res.body[4].body.should.equal("task 3 ccccc")
      });
    });
    
    it('Get part of tasks by limit and offset params.', () => {
      return prepareUserAndTasks()
      .then(token => {
        // Bodyの昇順ソートでPaging
        return chai.request(app).get('/beta-v1/tasks?sort=body&limit=2&offset=2')
        .set("Authentication", token)
      })
      .then(res => {
        res.should.have.status(200);
        res.body.should.be.an('array').to.have.lengthOf(2);
        res.body[0].body.should.equal("task 3 ccccc")
        res.body[1].body.should.equal("task 4 ddddd")
      });
    });
  });

});