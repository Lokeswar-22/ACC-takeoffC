const path = require('path');
const express = require('express');
const cookieSession = require('cookie-session');

const PORT = process.env.PORT || 3000;
const config = require('./config');
if (config.credentials.client_id == null || config.credentials.client_secret == null) {
    console.error('Missing APS_CLIENT_ID or APS_CLIENT_SECRET env. variables.');
    return;
}
const app = express();
var server = require('http').Server(app);

app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieSession({
    name: 'aps_session',
    keys: ['aps_secure_key'],
    maxAge: 14 * 24 * 60 * 60 * 1000 // 14 days, same as refresh token
}));
app.use(express.json({ limit: '50mb' }));
app.use('/api/aps', require('./routes/oauth'));
app.use('/api/aps', require('./routes/datamanagement'));
app.use('/api/aps', require('./routes/user'));
app.use('/api/aps', require('./routes/acc.takeoff.cost'));
app.use('/api/aps', require('./routes/pricebook'));
app.use('/api/aps', require('./routes/index-api'));

app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.statusCode).json(err);
});


// MyApp.SocketIo is a global object, will be used to send
// status to the client
global.MyApp = {
    SocketIo: require('socket.io')(server)
};
global.MyApp.SocketIo.on('connection', function (socket) {
    console.log('user connected to the socket');

    socket.on('disconnect', function () {
        console.log('user disconnected from the socket');
    });
})

server.listen(PORT, () => { console.log(`Server listening on port ${PORT}`); });
