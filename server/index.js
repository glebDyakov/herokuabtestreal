const moment = require('moment')
const mongoose = require('mongoose')
const path = require('path')
const express = require('express')
const app = express()

const PORT = process.env.PORT || 4000
app.use(express.urlencoded({ extended: true }));
const url = `mongodb+srv://glebClusterUser:glebClusterUserPassword@cluster0.fvfru.mongodb.net/abtestreal?retryWrites=true&w=majority`;

var options = {
    root: path.join(__dirname, 'views'),
}

const connectionParams={
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true 
}

mongoose.connect(url,connectionParams)
    .then( () => {
        console.log('Connected to database ')
    })
    .catch( (err) => {
        console.error(`Error connecting to the database. \n${err}`);
    })

const UsersSchema = new mongoose.Schema({
    userid: {
        default: "1",
        type: String
    },
    dateregistration:{
        default: new Date().toLocaleString(),
        type: String
    },
    datelastactivity:{
        default: new Date().toLocaleString(),
        type: String
    }
},
{ collection : 'myusers' });

const UsersModel = mongoose.model('UsersModel', UsersSchema, 'myusers');
    
app.get('/', (req, res)=>{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, X-Access-Token, X-Socket-ID, Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    let query = UsersModel.find({});
    query.exec( (err, allUsers) => {
        if (err){
            return
        }
        return res.json(allUsers)
    });
})

app.get('/calculateretentionxday', (req, res)=>{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, X-Access-Token, X-Socket-ID, Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");

    
    let query = UsersModel.find({  });
    query.exec( (err, allUsers) => {
        console.time("result")
        if (err){
            return res.send('error')
        }
        let usersReturns =  allUsers.filter((user) => {
            let dateOfBegin = moment(user.dateregistration.split('.')[2] + "-" + user.dateregistration.split('.')[1] + "-" + user.dateregistration.split('.')[0])
            let dateOfEnd = moment(user.datelastactivity.split('.')[2] + "-" + user.datelastactivity.split('.')[1] + "-" + user.datelastactivity.split('.')[0])
            if(dateOfBegin.clone().add(Number(req.query.retentionday), 'day').isBefore(dateOfEnd)){
                return true
            }
            return false
        })
        let usersInstallApp =  allUsers.filter((user) => {
            let dateOfBegin = moment(user.dateregistration.split('.')[2] + "-" + user.dateregistration.split('.')[1] + "-" + user.dateregistration.split('.')[0])
            let dateOfEnd = moment()
            if(dateOfBegin.clone().subtract(Number(req.query.retentionday), 'day').isBefore(dateOfEnd)){
                return true
            }
            return false
        })
        let result = usersReturns.length / usersInstallApp.length * 100
        
        console.timeLog ("answer time");
        console.timeEnd("result");
        return res.json({ result: result,  })
    });
})

app.get('/users/add', async (req, res)=>{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, X-Access-Token, X-Socket-ID, Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    if(Array(req.query.userdateregistration)[0] === undefined){
        res.send(`user not found`)
        return
    } else if(Array(req.query.userdateregistration)[0] !== undefined) {
        new UsersModel({ userid: req.query.userid, dateregistration: req.query.userdateregistration, datelastactivity: req.query.userdatelastactivity }).save(function (err) {
            if(err){
                console.log(err)
                res.send(`user not found`)
                return
            } else {
                res.redirect('/')
            }
        })
    }
})

app.listen(PORT)