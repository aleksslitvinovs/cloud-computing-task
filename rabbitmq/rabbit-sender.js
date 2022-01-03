var amqp = require('amqplib/callback_api');
amqp.connect('amqp://127.0.0.1:5672', function (error0, connection) {
    if (error0) { throw error0; }
    connection.createChannel(function (error1, channel) {
        if (error1) {
            throw error1;
        }
        var queue = 'my-queue';
        var data = {"name": "janis","phone":1234};
        var msg = JSON.stringify(data);
        channel.assertQueue(queue, {
            durable: true
        });
        channel.sendToQueue(queue, Buffer.from
            (msg)); console.log(" [x] Sent %s", msg);
    });
});