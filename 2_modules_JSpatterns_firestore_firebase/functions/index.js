const functions = require('firebase-functions');

// exports.randomNumber = functions.https.onRequest((request, response) => {
//     const number = Math.round(Math.random() * 100);
//     response.send(number.toString());
// })

// http callable function
// exports.sayHello = functions.https.onCall((data, context) => {
//   const name = data.name;
//   return `hello ${name} :)`;
// });

// firestore trigger
exports.fetchTasks = functions.firestore.document('tasks/{taskID}')
  .onWrite((change, context) => {
    console.log(change.after.data());
    // 
    const taskID = context.params.taskID;
    // 
    return [taskID, change.after.data()];
  });