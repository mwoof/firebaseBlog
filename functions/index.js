const functions = require('firebase-functions');
const app = require('express')();
const FBAuth = require('./util/fbAuth');

const cors = require('cors');
app.use(cors());

const { db, admin } = require('./util/admin');

const {
  getAllForumPosts,
  getForumPost,
  postOneForumPost,
  likeForumPost,
  unlikeForumPost,
  saveForumPost,
  unsaveForumPost,
  editForumPost,
  deleteForumPost,
  postComment,
  postSubcomment,
  likeForumComment,
  unlikeForumComment,
  editForumComment,
  deleteForumComment

} = require('./handlers/forumPosts');
const {
  signup,
  signin,
  uploadImage,
  addUserDetails,
  getAuthenticatedUser,
  getUserDetails,
  markNotificationsRead,
  followUser,
  unfollowUser
} = require('./handlers/users');


// ForumPost routes
app.get('/forumPosts', getAllForumPosts);
app.post('/forumPost', FBAuth, postOneForumPost);
app.get('/forumPost/:forumPostId', getForumPost);
app.get('/forumPost/:forumPostId/like', FBAuth, likeForumPost);
app.get('/forumPost/:forumPostId/unlike', FBAuth, unlikeForumPost);
app.get('/forumPost/:forumPostId/save', FBAuth, saveForumPost);
app.get('/forumPost/:forumPostId/unsave', FBAuth, unsaveForumPost);
app.post('/forumPost/:forumPostId/edit', FBAuth, editForumPost);
app.delete('/forumPost/:forumPostId/delete', FBAuth, deleteForumPost);
app.post('/forumPost/:forumPostId/comment', FBAuth, postComment);
app.post('/forumComment/:forumPostId/:forumCommentId/comment', FBAuth, postSubcomment);
app.get('/forumComment/:forumCommentId/like', FBAuth, likeForumComment);
app.get('/forumComment/:forumCommentId/unlike', FBAuth, unlikeForumComment);
app.post('/forumComment/:forumCommentId/edit', FBAuth, editForumComment);
app.delete('/forumComment/:forumCommentId/delete', FBAuth, deleteForumComment);

// users routes
app.post('/signup', signup);
app.post('/signin', signin);
app.post('/user/image', FBAuth, uploadImage);
app.post('/user', FBAuth, addUserDetails);
app.get('/user', FBAuth, getAuthenticatedUser);
app.get('/user/:username', getUserDetails);
app.get('/user/:username/follow', FBAuth, followUser);
app.get('/user/:username/unfollow', FBAuth, unfollowUser);
app.post('/notifications', FBAuth, markNotificationsRead);




exports.api = functions.https.onRequest(app);

//followhandlers
exports.createNotificationOnForumFollow = functions
  .firestore
  .document('userFollows/{forumFollowId}')
  .onCreate((snapshot) => {
    return db
      .doc(`/users/${snapshot.data().followerUsername}`)
      .get()
      .then((doc) => {
        if (
          doc.exists &&
          doc.data().username !== snapshot.data().followeeUsername
        ) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().username,
            sender: snapshot.data().followerUsername,
            NotificationType: 'follow',
            read: false,
            linkInfo: snapshot.data().followerUsername,
            compId: snapshot.data().followerUsername,
            compType: 'userFollow'
          });
        }
      })
      .catch((err) => console.error(err));
  });
exports.deleteNotificationOnForumUnfollow = functions
  .firestore
  .document('userFollows/{forumLikeId}')
  .onDelete((snapshot) => {
    return db
      .doc(`/notifications/${snapshot.id}`)
      .delete()
      .catch((err) => {
        console.error(err);
        return;
      });
  });

//post handler
exports.onForumPostCreate = functions
  .firestore
  .document('/forumPosts/{forumPostId}')
  .onCreate((snapshot, context) => {
    console.log( snapshot.data().username );
    const batch = db.batch();
    return db
      .collection('userFollows')
      .where('followeeUsername', '==', snapshot.data().username)
      .get()
      .then((data) => {
        // const noteRef = db.collection('notifications').doc();
        // console.log("teh data array has length: " + data.length);
        data.forEach((doc) => {
          console.log("running foreach loop");
          batch.create(db.collection('notifications').doc(), {
            createdAt: new Date().toISOString(),
            recipient: doc.data().followerUsername,
            sender: snapshot.data().username,
            NotificationType: 'post',
            read: false,
            linkInfo: context.params.forumPostId,
            compId: context.params.forumPostId,
            compType: 'forumPost'
          });
        });
        console.log(batch[0], batch [1]);
        return batch.commit();
      })
      .catch((err) => console.error(err));
  });
exports.onForumPostDelete = functions
  .firestore
  .document('/forumPosts/{forumPostId}')
  .onDelete((snapshot, context) => {
    const forumPostId = context.params.forumPostId;
    const batch = db.batch();
    batch.delete(db.doc(`/forumEdits/${snapshot.id}`));

    return db
      .collection('userSaves')
      .where('linkId', '==', snapshot.id)
      .where('compType', '==', 'forumPost')
      .get()
      .then((data) => {
        data.forEach((doc) => {
          batch.delete(db.doc(`/userSaves/${doc.id}`));
        });
        return db
          .collection('forumComments')
          .where('forumPostId', '==', forumPostId)
          .get();
      })
      .then((data) => {
        data.forEach((doc) => {
          batch.delete(db.doc(`/forumComments/${doc.id}`));
        });
        return db
          .collection('forumLikes')
          .where('compType', '==', "forumPost")
          .where('compId', '==', forumPostId)
          .get();
        })
      .then((data) => {
        data.forEach((doc) => {
          batch.delete(db.doc(`/forumLikes/${doc.id}`));
        });
        return db
          .collection('notifications')
          .where('compType', '==', "forumPost")
          .where('compId', '==', forumPostId)
          .get();
      })
      .then((data) => {
        data.forEach((doc) => {
          batch.delete(db.doc(`/notifications/${doc.id}`));
        });
        return batch.commit();
      })
      .catch((err) => console.error(err));
  });

//comment handlers
exports.createNotificationOnForumComment = functions
  .firestore
  .document('forumComments/{forumCommentId}')
  .onCreate((snapshot) => {
    //check if coment it top level
    if(snapshot.data().forumPostId === snapshot.data().parentId) {
    //if comment is top level
      return db
        .doc(`/forumPosts/${snapshot.data().forumPostId}`)
        .get()
        .then((doc) => {
          if (
            doc.exists &&
            doc.data().username !== snapshot.data().username
          ) {
            return db.doc(`/notifications/${snapshot.id}`).set({
              createdAt: new Date().toISOString(),
              recipient: doc.data().username,
              sender: snapshot.data().username,
              NotificationType: 'comment',
              read: false,
              linkInfo: doc.id, //the forumPost ID
              compId: snapshot.id,
              compType: 'forumComment'

            });
          }
        })
        .catch((err) => {
          console.error(err);
          return;
        });
      }
      //if commment is subcomment
      return db
        .doc(`/forumComments/${snapshot.data().parentId}`)
        .get()
        .then((doc) => {
          if (
            doc.exists &&
            doc.data().username !== snapshot.data().username
          ) {
            return db.doc(`/notifications/${snapshot.id}`).set({
              createdAt: new Date().toISOString(),
              recipient: doc.data().username,
              sender: snapshot.data().username,
              NotificationType: 'comment',
              read: false,
              linkInfo: snapshot.data().forumPostId, //the forumPost ID
              compId: doc.id,
              compType: 'forumComment'
            });
          }
        })
        .catch((err) => {
          console.error(err);
          return;
        });
  });
exports.onCommentCreateIncrementPostCount = functions
  .firestore
  .document('forumComments/{forumCommentId}')
  .onCreate((snapshot) => {
    return db
      .doc(`/forumPosts/${snapshot.data().forumPostId}`)
      .update({ commentCount: admin.firestore.FieldValue.increment(1) })
      .catch((err) => {
        console.error(err);
        return;
      });
  });
exports.onForumCommentDelete = functions
  .firestore
  .document('/forumComments/{forumCommentId}')
  .onDelete((snapshot, context) => {
    const forumCommentId = context.params.forumCommentId;
    const forumPostId = snapshot.data().forumPostId;
    const batch = db.batch();
    batch.delete(db.doc(`/forumEdits/${snapshot.id}`));

    return db
      .doc(`/forumPosts/${snapshot.data().forumPostId}`)
      .get()
      // .update({commentCount: admin.firestore.FieldValue.increment(-1)})
      .then((post) => {
        if(post.exists) {
          batch.update(db.doc(`/forumPosts/${post.id}`), {commentCount: admin.firestore.FieldValue.increment(-1)});
        }
        return db
          .collection('forumComments')
          .where('parentId', '==', forumCommentId)
          .get();
      })
      //delete subcomments
      .then((data) => {
        data.forEach((doc) => {
          batch.delete(db.doc(`/forumComments/${doc.id}`));
        });
        return db
          .collection('forumLikes')
          .where('compType', '==', "forumComment")
          .where('compId', '==', forumCommentId)
          .get();
      })
      //delete forumLikes and their notifications
      .then((data) => {
        data.forEach((doc) => {
          batch.delete(db.doc(`/forumLikes/${doc.id}`));
        });
        return db
          .collection('notifications')
          .where('compType', '==', 'forumComment')
          .where('compId', '==', forumCommentId)
          .get();
      })
      //remove any notificaitons
      .then((data) => {
        data.forEach((doc) => {
          batch.delete(db.doc(`/notifications/${doc.id}`));
        });
        return batch.commit();
      })
      .catch((err) => console.error(err));
  });

//like handlers
exports.createNotificationOnForumLike = functions
  .firestore
  .document('forumLikes/{forumLikeId}')
  .onCreate((snapshot) => {
    return db
      .doc(`/${snapshot.data().compType}s/${snapshot.data().compId}`)
      .get()
      .then((doc) => {
        if (
          doc.exists &&
          doc.data().username !== snapshot.data().username
        ) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().username,
            sender: snapshot.data().username,
            NotificationType: 'like',
            read: false,
            linkInfo: snapshot.data().linkInfo,
            compId: doc.id,
            compType: snapshot.data().compType
          });
        }
      })
      .catch((err) => console.error(err));
  });
exports.deleteNotificationOnForumUnLike = functions
  .firestore
  .document('forumLikes/{forumLikeId}')
  .onDelete((snapshot) => {
    return db
      .doc(`/notifications/${snapshot.id}`)
      .delete()
      .catch((err) => {
        console.error(err);
        return;
      });
  });

//user handlers
exports.onUserImageChange = functions
  .firestore
  .document('/users/{userId}')
  .onUpdate((change) => {
    console.log(change.before.data());
    console.log(change.after.data());
    if (change.before.data().imageUrl !== change.after.data().imageUrl) {
      console.log('image has changed');
      const batch = db.batch();
      return db
        .collection('forumPosts')
        .where('username', '==', change.before.data().username)
        .get()
        .then((data) => {
          data.forEach((doc) => {
            const forumPost = db.doc(`/forumPosts/${doc.id}`);
            batch.update(forumPost, { userImage: change.after.data().imageUrl });
          });
          return batch.commit();
        });
    } else return true;
  });
