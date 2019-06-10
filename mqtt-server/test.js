var mqtt = require('mqtt')
const opt = {
  username: 'shawnwu_mq',
  password: 'shawnmqpaswd'
}
var client = mqtt.connect('mqtt://120.114.183.20', opt)

client.on('connect', function () {
  client.subscribe('#', function (err) {
    if (!err) {
      client.publish('GIOT-GW/UL/1C497BFA30E0', 'Hello mqtt')
    }
  })
})


