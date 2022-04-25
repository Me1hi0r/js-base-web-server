const ws = new WebSocket('ws://localhost:9000');

ws.onopen = function () {
 console.log('подключился');
};

ws.onerror = function (err) {
 console.log(err)
}

ws.onmessage = function (message) {
 console.log('Message: %s', message.data);
};

const send = function(params){
 ws.send(JSON.stringify(params));
}