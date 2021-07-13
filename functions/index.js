
const functions = require("firebase-functions");

const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({ origin: true }));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
const xhr = new XMLHttpRequest()
const url = 'https://us-central1-enabledchat.cloudfunctions.net/api'
const xhr = new XMLHttpRequest()
xhr.open('POST', url)

const FBAuth = require('./util/fbAuth');

const {db} = require('./util/admin');


const {
    getAllScreams,
    postOneScream,
    getScream,
    commentOnScream,
    likeScream, 
    unlikeScream,
    deleteScream
  }= require('./handlers/screams');

const {
    signup,
     login,
     uploadImage,
     getAuthenticatedUser,
     addUserDetails,
     getUserDetails,
     markNotificationsRead    
    } = require('./handlers/users');  

//Scream routes
app.get('/screams',getAllScreams);
app.post('/scream', FBAuth, postOneScream);
app.get('/scream/:screamId',getScream);
app.delete('/scream/:screamId',FBAuth,deleteScream);
//delete a scream
app.get('/scream/:screamId/like', FBAuth,likeScream);
app.get('/scream/:screamId/unlike',FBAuth,unlikeScream);
app.post('/scream/:screamId/comment', FBAuth,commentOnScream);
//like a scream
//unlike a scream
//comment on a scream


//users routes
app.post('/user',FBAuth,addUserDetails);
app.post('/signup', signup);

app.post('/login',Login);

app.post('/user/image',FBAuth, uploadImage);
app.get('/user',FBAuth,getAuthenticatedUser);
app.get('/user/:handle',getUserDetails);
app.post('/notifications',FBAuth,markNotificationsRead);

 exports.api= functions.https.onRequest(app);

 exports.createNotificationOnLike = functions
  .region('us-central1')
  .firestore.document('likes/{id}')
  .onCreate((snapshot) => {
    return db.doc(`/screams/${snapshot.data().screamId}`)
      .get()
      .then((doc) => {
        if (doc.exists && doc.data().userHandle !== snapshot.data().userHandle) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            type: 'like',
            read: false,
            screamId: doc.id
          });
        }
      })
      .catch((err) => console.error(err));
  });
exports.deleteNotificationOnUnLike = functions
  .region('us-central1')
  .firestore.document('likes/{id}')
  .onDelete((snapshot) => {
    return db
      .doc(`/notifications/${snapshot.id}`)
      .delete()
      .catch((err) => {
        console.error(err);
        return;
      });
  });
exports.createNotificationOnComment = functions
  .region('us-central1')
  .firestore.document('comments/{id}')
  .onCreate((snapshot) => {
    return db
      .doc(`/screams/${snapshot.data().screamId}`)
      .get()
      .then((doc) => {
        if (doc.exists
          && doc.data().userHandle !== snapshot.data().userHandle)
       {
          return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            type: 'comment',
            read: false,
            screamId: doc.id
          });
        }
      })
      .catch((err) => 
        console.error(err));
  });

  exports.onUserImageChange = functions.region('us-central1').firestore.document('/users/{userId}')
          .onUpdate((change)=>{
            console.log(change.before.data());
            console.log(change.after.data());
            if(change.before.data().imageUrl !== change.after.data().imageUrl){
              console.log('Image has changed!');
              let batch = db.batch();
            return db.collection('screams').where('userHandle','==',change.before.data().handle).get()
            .then((data)=>{
              data.forEach(doc =>{
                const scream = db.doc(`/screams/${doc.id}`);
                batch.update(scream,{userImage:change.after.data().imageUrl})
              })
              return batch.commit();
            });
            }  else return true;

          });

  exports.onScreamDelete = functions
  .region('us-central1')
  .firestore.document('/screams/{screamId}')
  .onDelete((snapshot,context) =>{
    const screamId = context.params.screamId;
    const batch = db.batch();
    return db.collection('comments').where('screamId','==',screamId).get()
    .then(data =>{
      data.forEach(doc =>{
        batch.delete(db.doc(`/comments/${doc.id}`));

      })
      return db.collection('likes').where('screamId','==',screamId);
    })
    .then(data =>{
      data.forEach(doc =>{
        batch.delete(db.doc(`/likes/${doc.id}`));
      })
      return db.collection('notifications').where('screamId','==',screamId).get();
    })
    .then(data=>{
      data.forEach(doc=>{
        batch.delete(db.doc(`/likes/${doc.id}`));
      })
      return batch.commit();
    })
    .catch(err=> console.error(err));
  })
