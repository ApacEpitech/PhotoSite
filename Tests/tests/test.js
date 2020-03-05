var chai = require('chai')
    , chaiHttp = require('chai-http');
chai.use(chaiHttp);
var assert = chai.assert;
var expect = chai.expect;


let userId = null;
let taskId = null;
describe('Array', function() {
    describe('Users', function() {
        describe('#CreateUser()', function () {
            it('should save user without error', function (done) {
                let mail = "test@google.com";
                let pwd = "123456";

                chai.request('http://localhost:5000')
                    .post('/users')
                    .send({ mail: mail, password: pwd })
                    .end((err, res) => {
                        expect(res).to.have.status(201);
                        expect(err).to.be.null;
                        data = res.body;
                        userId = data._id.$oid;
                        assert.isNotNull(userId);
                        assert.equal(data.email, mail);
                        assert.equal(data.banned, false);
                        assert.equal(data.administrator, false);
                        done();
                    });
            });
        });
        describe('#GetUserById()', function () {
            it('should get user using id', function (done) {
                chai.request('http://localhost:5000')
                    .get('/users/'+userId)
                    .end((err, res) => {
                        expect(res).to.have.status(200);
                        expect(err).to.be.null;
                        data = res.body;
                        assert.equal(data.email, "test@google.com");
                        assert.equal(data.banned, false);
                        assert.equal(data.administrator, false);
                        done();
                    });
            });
        });
        describe('#GetInexistantUserById()', function () {
            it('should get no user using id', function (done) {
                let fakeId = "not_found";

                chai.request('http://localhost:5000')
                    .get('/users/'+fakeId)
                    .end((err, res) => {
                        expect(res).to.have.status(500);
                        expect(err).to.be.null;
                        data = res.body;
                        assert.isEmpty(data);
                        done();
                    });
            });
        });
        describe('#GetAllUsers()', function () {
            it('should get all users', function (done) {
                chai.request('http://localhost:5000')
                    .get('/users')
                    .end((err, res) => {
                        expect(res).to.have.status(200);
                        expect(err).to.be.null;
                        data = res.body;
                        assert.isNotNull(data);
                        done();
                    });
            });
        });
        describe('#UpdateUser()', function () {
            it('should update one user', function (done) {
                let mail = "test2@google.com";
                let pwd = "123654";
                let banned = true;
                let administrator = false;
                chai.request('http://localhost:5000')
                    .put('/users')
                    .send({_id: userId, email: mail, pwd: pwd, banned: banned, administrator: administrator})
                    .end((err, res) => {
                        expect(res).to.have.status(200);
                        expect(err).to.be.null;
                        data = res.body;
                        userId = data._id.$oid;
                        assert.isNotNull(userId);
                        assert.equal(data.email, mail);
                        assert.equal(data.banned, true);
                        assert.equal(data.administrator, false);
                        done();
                    });
            });
        });
        describe('#ConnectUser()', function () {
            it('should connect one user', function (done) {
                let mail = "test2@google.com";
                let pwd = "123654";
                chai.request('http://localhost:5000')
                    .post('/users/connect')
                    .send({mail: mail, password: pwd})
                    .end((err, res) => {
                        expect(res).to.have.status(200);
                        expect(err).to.be.null;
                        data = res.body;
                        let tmpId = data._id.$oid;
                        assert.isNotNull(tmpId);
                        assert.equal(data.email, mail);
                        done();
                    });
            });
        });
        describe('#WrongConnectUser()', function () {
            it('should not connect one user', function (done) {
                let mail = "test2@google.com";
                let pwd = "fakePwd";
                chai.request('http://localhost:5000')
                    .post('/users/connect')
                    .send({mail: mail, password: pwd})
                    .end((err, res) => {
                        expect(res).to.have.status(403);
                        expect(err).to.be.null;
                        data = res.body;
                        assert.equal(data.message, "Unauthorized: http://localhost:5000/users/connect");
                        done();
                    });
            });
        });
        describe('#DeleteUser()', function () {
            it('should delete one user', function (done) {
                chai.request('http://localhost:5000')
                    .delete('/users/'+userId)
                    .end((err, res) => {
                        expect(res).to.have.status(200);
                        expect(err).to.be.null;
                        done();
                    });
            });
        });
    });
    describe('Tasks', function() {
        describe('#CreateTask()', function () {
            it('should save task without error', function (done) {
                let mail = "random.mail@google.com";
                let pwd = "randPwd";

                // to generate a new user_id
                chai.request('http://localhost:5000')
                    .post('/users')
                    .send({ mail: mail, password: pwd })
                    .end((err, res) => {
                        userId = res.body._id.$oid;

                        let title = "My Super Title";

                        // to generate the new task
                        chai.request('http://localhost:5000')
                            .post('/tasks')
                            .send({ title: title, user_id: userId })
                            .end((err, res) => {
                                expect(res).to.have.status(201);
                                expect(err).to.be.null;
                                data = res.body;
                                taskId = data._id.$oid;
                                assert.isNotNull(taskId);
                                assert.equal(data.title, title);
                                assert.equal(data.content, "");
                                assert.equal(data.user_id, userId);
                                assert.equal(data.done, false);
                                done();
                            });
                    });
            });
        });
        describe('#GetTaskById()', function () {
            it('should get task using id', function (done) {
                chai.request('http://localhost:5000')
                    .get('/tasks/'+taskId)
                    .end((err, res) => {
                        expect(res).to.have.status(200);
                        expect(err).to.be.null;
                        data = res.body;
                        assert.equal(data.title, "My Super Title");
                        assert.equal(data.content, "");
                        assert.equal(data.user_id, userId);
                        assert.equal(data.done, false);
                        done();
                    });
            });
        });
        describe('#GetTaskByUserId()', function () {
            it('should get task using user id', function (done) {
                chai.request('http://localhost:5000')
                    .get('/tasks/users/'+userId)
                    .end((err, res) => {
                        expect(res).to.have.status(200);
                        expect(err).to.be.null;
                        data = res.body;
                        assert.isNotNull(data);
                        done();
                    });
            });
        });
        describe('#GetInexistantTaskById()', function () {
            it('should get no task using id', function (done) {
                let fakeId = "not_found";

                chai.request('http://localhost:5000')
                    .get('/tasks/'+fakeId)
                    .end((err, res) => {
                        expect(res).to.have.status(500);
                        expect(err).to.be.null;
                        data = res.body;
                        assert.isEmpty(data);
                        done();
                    });
            });
        });
        describe('#GetAllTasks()', function () {
            it('should get all tasks', function (done) {
                chai.request('http://localhost:5000')
                    .get('/tasks')
                    .end((err, res) => {
                        expect(res).to.have.status(200);
                        expect(err).to.be.null;
                        data = res.body;
                        assert.isNotNull(data);
                        done();
                    });
            });
        });
        describe('#UpdateTask()', function () {
            it('should update one task', function (done) {
                let title = "New Title";
                let content = "New Content";
                let _done = true;
                chai.request('http://localhost:5000')
                    .put('/tasks')
                    .send({_id: taskId, title: title, content: content, done: _done, user_id: userId})
                    .end((err, res) => {
                        expect(res).to.have.status(200);
                        expect(err).to.be.null;
                        data = res.body;
                        taskId = data._id.$oid;
                        assert.isNotNull(taskId);
                        assert.equal(data.title, title);
                        assert.equal(data.content, content);
                        assert.equal(data.done, _done);
                        done();
                    });
            });
        });
        describe('#DeleteTask()', function () {
            it('should delete one task', function (done) {
                chai.request('http://localhost:5000')
                    .delete('/tasks/'+taskId)
                    .end((err, res) => {
                        expect(res).to.have.status(200);
                        expect(err).to.be.null;
                        done();
                    });
            });
        });
    });
});