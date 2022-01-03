var amqp = require('amqplib/callback_api');
amqp.connect('amqp://127.0.0.1:5672', function (error0, connection) {
    if (error0) {
        throw error0;
    }
    connection.createChannel(function (error1, channel) {
        if (error1) {
            throw error1;
        }
        var queue = 'my-queue';
        channel.assertQueue(queue, {
            durable: true
        });
        console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);
        channel.consume(queue, function (msg) {
            console.log(" [x] Received %s", msg.content.toString());
            var json_data = JSON.parse(msg.content);
            console.log("name is " + json_data.name);
        }, {
            noAck: true
        });
    });
});