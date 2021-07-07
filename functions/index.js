
const functions = require("firebase-functions");

const express = require('express');
const app = express();


const FBAuth = require('./util/fbAuth');
const {
    getAllScreams,
    postOneScream,
    getScream,
    commentOnScream,
likeScream, 
unlikeScream,
deleteScream}= require('./handlers/screams');

const {
    signup,
     login,
     uploadImage,
     getAuthenticatedUser,
     addUserDetails} = require('./handlers/users');  

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

app.post('/login',login);

app.post('/user/image',FBAuth, uploadImage);
app.get('/user',FBAuth,getAuthenticatedUser);



 exports.api= functions.https.onRequest(app);

 exports.createNotificationOnLike = functions.region('us-central1').firestore.document('likes/{id}')
 .onCreate((snapshot)=>{
     
 })