const express = require('express');
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');

const app = express();

app.use(express.json());

let users = {};

app.use(express.urlencoded({extended: true}))
app.use('/', express.static(__dirname + '/public'))

const generateRTCtoken = (uid, channel, role) => {
    console.log(1111)
    const appID = 'fd71747548e148de852032e31386f6bc';
    const appCertificate = 'ffc7b1a7888f433cb5b3bbcb59519a4b';
    const expirationTimeInSeconds = 3600;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    const token = RtcTokenBuilder.buildTokenWithUid(appID,appCertificate,channel,uid,role,privilegeExpiredTs);
    return token;
}

app.post('/fetch-token', (req, res) => {
    const token = generateRTCtoken(req.body.uid, req.body.channel, req.body.role);
    res.status(201).json({
        status: "Success",
        token
    })
})

app.get('/get-users', (req,res) => {
    console.log(users)
    res.status(200).json({obj: users});
})

app.post('/add-user', (req, res) => {
    users[req.body.uid] = req.body.room;
    res.status(201).json({status: "OK"})
})

app.get('/room', (req,res) => {
    res.sendFile(__dirname+'/public/room.html')
}) 

app.get('/server', (req, res) => {
    res.status(200).json({
        status: "Success",
        message: "Server Started!"
    })
})

app.listen(4444, () => {
    console.log('started listening on http://localhost:4444');
})