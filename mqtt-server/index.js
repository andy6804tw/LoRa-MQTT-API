var mqtt = require('mqtt');
const fetch = require('node-fetch');
// const opt={
//   username: 'admin',
//   password: 'admin'
// }
// var client = mqtt.connect('mqtt://104.199.215.165', opt)

// client.on('connect', function () {
//   client.subscribe('GIOT-GW/UL/1C497BFA30E0', function (err) {
//     // if (!err) {
//     //   client.publish('GIOT-GW/UL/1C497BFA30E0', 'Hello mqtt')
//     // }
//   })
// })

// client.on('message', function (topic, message) {
//   // message is Buffer
//   console.log(JSON.parse(message.toString())[0]);
//   const data = JSON.parse(message.toString())[0].data;
//   // client.end()

//   if (data !=='00000000'){
//     fetch("http://localhost:8005/mqtt", {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify({
//         data_object: JSON.parse(message.toString())[0],
//       })
//     })
//       .then((response) => response.text())
//       .then((responseJsonData) => {
//         console.log(responseJsonData);
//       })
//       .catch((error) => {
//       })
//   }
  

// })




var mqtt = require('mqtt')
const opt = {
  username: 'shawnwu_mq',
  password: 'shawnmqpaswd'
}
var client = mqtt.connect('mqtt://120.114.183.20', opt)

client.on('connect', function () {
  client.subscribe('#', function (err) {
    // if (!err) {
    //   client.publish('GIOT-GW/UL/1C497BFA30E0', 'Hello mqtt')
    // }
  })
})

client.on('message', function (topic, message) {
  // message is Buffer
  if (message.indexOf('repeater')>0){
    let messageObj = JSON.parse(message.toString())[0];
    console.log(messageObj);
    const data = messageObj.data;
    // client.end()

    if (data !== '00000000') {
      fetch("http://localhost:8005/mqtt", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data_object: messageObj,
        })
      })
        .then((response) => response.text())
        .then((responseJsonData) => {
          console.log(responseJsonData);
        })
        .catch((error) => {
        })
    }
  }else{
    console.log('invalid');
  }
  

})
