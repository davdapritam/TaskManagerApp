const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('./db/mongoose');
const jwt = require('jsonwebtoken');

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Methods", "GET, POST, HEAD, OPTIONS,PUT, PATCH, DELETE")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-access-token, x-refresh-token, _id");
    res.header(
        'Access-Control-Expose-Headers',
        'x-access-token, x-refresh-token'
    );
    next();
});


// ------------------>>>>>>>> MiddleWares <<<<<<<<<---------------------------
app.use(bodyParser.json());

// Verify Refresh Token
let verifySession = (req, res, next) => {
    // Grab the refresh token from the header
    let refreshToken = req.header('x-refresh-token');
    
    // grabbing the id from the request header
    let _id = req.header('_id');
    
    User.findByIdAndToken(_id, refreshToken).then((user) => {
        if(!user){
            return Promise.reject({
                'error' : 'User Not Found. Make Sure that the refresh token and user id are correct!'
            });
        }
        
        req.user_id = user._id;
        req.userObject = user;
        req.refreshToken = refreshToken;
        
        let setSessionValid = false;
        
        user.sessions.forEach((session) => {
            if(session.token === refreshToken){
                if(User.refreshTokenExpired(session.expireAt) === false){
                    
                    setSessionValid = true;
                }
            }
        });
        
        if(setSessionValid){
            next();
        } else {
            return Promise.reject({
                'error' : 'Refresh Token has expired or the session is invalid'
            });
        }
    }).catch((e) => {
        console.log("Refresh Token has expired or the session is invalid")
        res.status(401).send(e);
    });
}


// check wheather the request has valid JWT access token
let authenticate = (req, res, next) => {
    let token = req.header('x-access-token');
    
    // Verify JWT
    jwt.verify(token, User.getJWTSecret(), (err, decoded) => {
        if(err){
            // if there was an error
            // Jwt is invalid
            console.log("JWT TOKEN IS INVALID!")
            res.status(401).send(err);
        } else {
            // JWT IS VALID
            req.user_id = decoded._id; 
            next();
        }
    });
    
}


// ------------------>>>>>>>> Mongoose Models <<<<<<<<<---------------------------
const { List, Task, User} = require('./db/models');
const res = require('express/lib/response');


// ------------------>>>>>>>> ALL ROUTES <<<<<<<<<---------------------------

// ROUTES FOR LIST

// GET
app.get('/lists', authenticate, (req, res) => {
    // Here we want to return the array of all the lists in the database
   List.find({
       _userId: req.user_id
   }).then((lists) => {
       res.send(lists);
   }) 
});

// POST
app.post('/lists', authenticate, (req, res) => {
    // Here we want to create a new list and return the new list document to the user
    let title = req.body.title;
    
    let newList = new List({
        title,
        _userId: req.user_id
    });
    
    newList.save().then((listObject) => {
        // Here the full list object is returned
        res.send(listObject);
    })
});

// PATCH
app.patch('/lists/:id', authenticate, (req, res) => {
    // here we want to update a particular list
    List.findOneAndUpdate({ _id: req.params.id, _userId: req.user_id }, {
        $set: req.body
    }).then(() => {
        res.sendStatus(200);
    });
});

// DELETE
app.delete('/lists/:id', authenticate, (req, res) => {
    // here we want to delete the particular list
    List.findOneAndRemove({ 
        _id: req.params.id, 
        _userId: req.user_id
     }).then((removedList) => {
        res.send(removedList);
        
        console.log(removedList._id);
        // delete all the task from the particular list with deleting list all tasks related to it will also delete
        deletedTasksfromList(removedList._id);
        
    });
});


// ALL ROUTES FOR TASKS

// GET - All Tasks
app.get('/lists/:listId/tasks', authenticate, (req, res) => {
    // We want to return all the task that belong to the particular list
    Task.find({
        _listId: req.params.listId
    }).then((tasks) => {
        res.send(tasks);
    });
});

// GET - Find An Paticular Task
app.get('/lists/:listId/tasks/:taskId' , authenticate, (req, res) => {
    // We want to return the particular task
    Task.findOne({
        _listId: req.params.listId,
        _id: req.params.taskId
    }).then((task) => {
        res.send(task);
    });
});

// POST
app.post('/lists/:listId/tasks', authenticate, (req, res) => {
    // we want to post the task in a particular list
    
    List.findOne({
        _id: req.params.listId,
        _userId: req.user_id
    }).then((list) => {
        if(list){
            return true;
        }
        
        return false;
    }).then((canCreateTask) => {
        if(canCreateTask){
            
            let newTask = new Task({
                title: req.body.title,
                _listId: req.params.listId
            });
            
            newTask.save().then((newTaskObject) => {
                res.send(newTaskObject);
            });
        } else {
            res.sendStatus(404);
        }
    })
    
});

// PATCH
app.patch('/lists/:listId/tasks/:taskId',authenticate, (req, res) => {
    // We want to update the particular task under particular list
    
    List.findOne({
        _id : req.params.listId,
        _userId : req.user_id
    }).then((list) => {
        
        if(list){
            
            return true;
        }
        
        return false;
    }).then((canUpdateTask) => {
        if(canUpdateTask){
            Task.findOneAndUpdate({
                _listId: req.params.listId,
                _id: req.params.taskId
            },{ 
                $set: req.body
            }).then(() => {
                res.send({message : 'Updated Successfully'});
            });
        } else {
            res.status(404);
        }
    })
    
});

// DELETE
app.delete('/lists/:listId/tasks/:taskId',authenticate, (req, res) => {
    // we want to delete the particular task under particular list
    
    List.findOne({
        _id : req.params.listId,
        _userId : req.user_id
    }).then((list) => {
        if(list){
            
            return true;
        }
        
        return false;
    }).then((canDeleteTask) => {
        
        if(canDeleteTask){
            
            Task.findOneAndRemove({
                _listId: req.params.listId,
                _id: req.params.taskId
            }).then((deletedTask) => {
                res.send(deletedTask);
            });
        } else {
            res.status(404);
        }
    });
});


// ---------------->>>>>>> USER ROUTES <<<<<<-------------------

// SIGNUP ROUTE
app.post('/users', (req, res) => {
    // User SignUP
    
    let body = req.body;
    let newUser = new User(body);
    
    newUser.save().then(() => {
        return newUser.createSession();
    }).then((refreshToken) => {
        // session created and refreshtoken is returned
        // now generate auth token for the user
        
        return newUser.generateAccessAuthToken().then((accessToken) => {
            // access token is generated and returned
            
            return { accessToken, refreshToken };
        });
    }).then((authTokens) => {
        res.header('x-access-token', authTokens.accessToken)
        res.header('x-refresh-token', authTokens.refreshToken)
        res.send(newUser)
    }).catch((e) => {
        res.status(400).send(e);
    });
});

// LOGIN ROUTE
app.post('/users/login', (req, res) => {
    
    let email = req.body.email;
    let password = req.body.password;
    
    User.findByCredentials(email, password).then((user) => {
        
        return user.createSession().then((refreshToken) => {
            
            return user.generateAccessAuthToken().then((accessToken)=> {
                
                return { accessToken, refreshToken };
            });
        }).then((authTokens) => {
            res
                .header('x-access-token', authTokens.accessToken)
                .header('x-refresh-token', authTokens.refreshToken)
                .send(user);
        })
    }).catch((e) => {
        console.log(e)
        res.status(400).send(e);
    }); 
})


// generates and return the access token
app.get('/users/me/access-token', verifySession, (req, res) =>{ 
    
    req.userObject.generateAccessAuthToken().then((accessToken) => {
        res.header('x-access-token', accessToken).send({ accessToken });
    }).catch((e) => {
        res.status(400).send(e);
    })
})


// HELPER METHODS ==> DELETE
let deletedTasksfromList = (listId) => {
    Task.deleteMany({
        _listId: listId
    }).then(() => {
        console.log("deleted all task from the list!");
    });
} 

app.listen(3000, ()=>{ 
    console.log("Listening On Port 3000");
});