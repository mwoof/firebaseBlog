const { admin, db } = require('../util/admin');

const config = require('../util/config');

const firebase = require('firebase');
firebase.initializeApp(config);

const {
  validateSignupData,
  validateSigninData,
  reduceUserDetails
} = require('../util/validators');

// Sign users up
exports.signup = (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    username: req.body.username
  };

  const { valid, errors } = validateSignupData(newUser);

  if (!valid) return res.status(400).json(errors);

  const noImg = 'no-img.jpg';

  let token, userId;
  db.doc(`/users/${newUser.username}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        return res.status(400).json({ username: 'this username is already taken' });
      } else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password);
      }
    })
    .then((data) => {
      userId = data.user.uid;
      return data.user.getIdToken();
    })
    .then((idToken) => {
      token = idToken;
      const userCredentials = {
        username: newUser.username,
        email: newUser.email,
        createdAt: new Date().toISOString(),
        imageUrl: `https://firebasestorage.googleapis.com/v0/b/${
          config.storageBucket
        }/o/images%2FuserProfiles%2F${noImg}?alt=media`,
        userId
      };
      return db.doc(`/users/${newUser.username}`).set(userCredentials);
    })
    .then(() => {
      return res.status(201).json({ token });
    })
    .catch((err) => {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        return res.status(400).json({ email: 'Email is already is use' });
      } else {
        return res
          .status(500)
          .json({ general: 'Something went wrong, please try again' });
      }
    });
};
// Log user in
exports.signin = (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password
  };

  const { valid, errors } = validateSigninData(user);

  if (!valid) return res.status(400).json(errors);
  else {
    firebase
      .auth()
      .signInWithEmailAndPassword(user.email, user.password)
      .then((data) => {
        return data.user.getIdToken();
      })
      .then((token) => {
        return res.json({ token });
      })
      .catch((err) => {
        console.error(err);
        // auth/wrong-password
        // auth/user-not-user
        return res
          .status(403)
          .json({ general: 'Your email or password is incorrect' });
      });
  }
};


// Add user details
exports.addUserDetails = (req, res) => {
  let userDetails = reduceUserDetails(req.body);

  db.doc(`/users/${req.user.username}`)
    .update(userDetails)
    .then(() => {
      return res.json({ message: 'Details added successfully' });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};
// Get any user's details
exports.getUserDetails = (req, res) => {
  let userData = {};
  // TODO: get saves-----------------------------------------------//////////////////////////////
  db.doc(`/users/${req.params.username}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        userData.user = doc.data();
        return db
          .collection('forumPosts')
          .where('username', '==', req.params.username)
          .orderBy('createdAt', 'desc')
          .get();
      } else {
        return res.status(404).json({ errror: 'User not found' });
      }
    })
    .then((data) => {
      userData.forumPosts = [];
      data.forEach((doc) => {
        userData.forumPosts.push({
          body: doc.data().body,
          createdAt: doc.data().createdAt,
          username: doc.data().username,
          userImage: doc.data().userImage,
          likeCount: doc.data().likeCount,
          commentCount: doc.data().commentCount,
          forumPostId: doc.id
        });
      });
      return res.json(userData);
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};
// Get own user details
exports.getAuthenticatedUser = (req, res) => {
  // TODO: get saves----------------------------------------/////////////////////////
  let userData = {};
  db.doc(`/users/${req.user.username}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        userData.credentials = doc.data();
        return db
          .collection('forumLikes')
          .where('username', '==', req.user.username)
          .get();
      }
    })
    .then((data) => {
      userData.likes = [];
      data.forEach((doc) => {
        userData.likes.push(doc.data());
      });
      return db
        .collection('userSaves')
        .where('username', '==', req.user.username)
        .where('compType', '==', 'forumPost')
        .get();
    })
    .then((data) => {
      userData.savedPosts = [];
      data.forEach((doc) => {
        userData.savedPosts.push(doc.data());
      });
      return db
        .collection('notifications')
        .where('recipient', '==', req.user.username)
        .orderBy('createdAt', 'desc')
        .limit(10)
        .get();
    })
    .then((data) => {
      userData.notifications = [];
      data.forEach((doc) => {
        userData.notifications.push({
          recipient: doc.data().recipient,
          sender: doc.data().sender,
          createdAt: doc.data().createdAt,
          forumPostId: doc.data().forumPostId,
          type: doc.data().type,
          read: doc.data().read,
          notificationId: doc.id
        });
      });
      return res.json(userData);
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};
// Upload a profile image for user
exports.uploadImage = (req, res) => {
  const BusBoy = require('busboy');
  const path = require('path');
  const os = require('os');
  const fs = require('fs');

  const busboy = new BusBoy({ headers: req.headers });

  let imageToBeUploaded = {};
  let imageFileName;

  busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
    // console.log(fieldname, file, filename, encoding, mimetype);
    if (mimetype !== 'image/jpeg' && mimetype !== 'image/png') {
      return res.status(400).json({ error: 'Wrong file type submitted' });
    }
    // my.image.png => ['my', 'image', 'png']
    const imageExtension = filename.split('.')[filename.split('.').length - 1];
    // TODO: Make delete the old profile image and make a new one with the users id + 'profilePic' + extention

      imageFileName = `${req.user.uid}-ProPic.${imageExtension}`;


    const filepath = path.join(os.tmpdir(), imageFileName);
    imageToBeUploaded = { filepath, mimetype };
    file.pipe(fs.createWriteStream(filepath));
  });


  busboy.on('finish', () => {

    let LastFile = req.user.imageUrl.split("/o/images%2FuserProfiles%2F").pop().replace("?alt=media","");
    console.log(LastFile);

    admin
      .storage()
      .bucket('flipit-238117.appspot.com')
      .file(`images/userProfiles/${LastFile}`)
      .delete()
      .then(() => {
        console.log('Old profile picture successfully removed');
      })
      .catch((err) => {
        console.log(err.code === 404 ? "" : `Error removing old profile picture: ${err.message}`);
      });

    admin
      .storage()
      .bucket()
      .upload(imageToBeUploaded.filepath, {
        destination: `images/userProfiles/${imageFileName}`,
        resumable: false,
        metadata: {
          metadata: {
            contentType: imageToBeUploaded.mimetype
          }
        }
      })
      .then(() => {
        // const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/images%2FuserProfiles%2F${imageFileName}?alt=media`;
        console.log(imageFileName);
        const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/images%2FuserProfiles%2F${imageFileName}?alt=media`; // https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/images%2FuserProfiles%2F${imageFileName}?alt=media
        return db.doc(`/users/${req.user.username}`).update({ imageUrl });
      })
      .then(() => {
        return res.json({ message: 'image uploaded successfully' });
      })
      .catch((err) => {
        console.error(err);
        return res.status(500).json({ error: 'something went wrong' });
      });
  });


  busboy.end(req.rawBody);
};


//follow a user
exports.followUser = (req, res) => {

  const followDocument = db
    .collection('userFollows')
    .where('followeeUsername', '==', req.params.username)
    .where('followerUsername', '==', req.user.username)
    .limit(1);

  const followeeDoc = db.doc(`/users/${req.params.username}`);

  followeeDoc
    .get()
    .then((doc) => {
      if (doc.exists) {
        return followDocument.get();
      } else {
        return res.status(404).json({ error: `The user you are trying to follow does not exist` });
      }
    })
    .then((data) => {
      if (data.empty) {
        return db
          .collection('userFollows')
          .add({
            followeeUsername: req.params.username,
            followerUsername: req.user.username
          })
          .then(() => {
            return followeeDoc.update({ followers: admin.firestore.FieldValue.increment(1) });
          })
          .then(() => {
            return res.json({ message: `You are now following ${req.params.username}` });
          });
      } else {
        return res.status(400).json({ error: `You already follow ${req.params.username}` });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};

//unfollow a user
exports.unfollowUser = (req, res) => {
  const followDocument = db
    .collection('userFollows')
    .where('followeeUsername', '==', req.params.username)
    .where('followerUsername', '==', req.user.username)
    .limit(1);

  const followeeDoc = db.doc(`/users/${req.params.username}`);

  followeeDoc
    .get()
    .then((doc) => {
      if (doc.exists) {
        return followDocument.get();
      } else {
        return res.status(404).json({ error: 'The user you are trying to unfollow does not exist' });
      }
    })
    .then((data) => {
      if (data.empty) {
        return res.status(400).json({ error: `You don't follow ${req.params.username}`});
      } else {
        return db
          .doc(`/userFollows/${data.docs[0].id}`)
          .delete()
          .then(() => {
            ///make database trigger
            return followeeDoc.update({ followers: admin.firestore.FieldValue.increment(-1) });
          })
          .then(() => {
            return res.json({ message: `You are no longer following ${req.params.username}` });
          });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};


exports.markNotificationsRead = (req, res) => {
  let batch = db.batch();
  req.body.forEach((notificationId) => {
    const notification = db.doc(`/notifications/${notificationId}`);
    batch.update(notification, { read: true });
  });
  batch
    .commit()
    .then(() => {
      return res.json({ message: 'Notifications marked read' });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};
