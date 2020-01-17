const { db, admin } = require('../util/admin');


// Fetch all forumPosts
exports.getAllForumPosts = (req, res) => {
  db.collection('forumPosts')
    .orderBy('createdAt', 'desc')
    .get()
    .then((data) => {
      let forumPosts = [];
      data.forEach((doc) => {
        forumPosts.push({
          forumPostId: doc.id,
          title: doc.data().title,
          body: doc.data().body,
          username: doc.data().username,
          createdAt: doc.data().createdAt,
          commentCount: doc.data().commentCount,
          likeCount: doc.data().likeCount,
          userImage: doc.data().userImage
        });
      });
      return res.json(forumPosts);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};
// Fetch one forumPost
exports.getForumPost = (req, res) => {
  let forumPostData = {};
  db.doc(`/forumPosts/${req.params.forumPostId}`)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(404).json({ error: 'ForumPost not found' });
      }
      forumPostData = doc.data();
      forumPostData.id = doc.id;
      return db
        .collection('forumComments')
        .orderBy('likeCount', 'desc')
        .orderBy('createdAt', 'desc')
        .where('forumPostId', '==', req.params.forumPostId)
        .get();
    })
    .then((data) => {
      forumPostData.comments = [];
      buildComments(forumPostData, data);
      return res.json(forumPostData);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};


//post a post
exports.postOneForumPost = (req, res) => {
  if (req.body.body.trim() === '' || req.body.title.trim() === '') {
    return res.status(400).json({ body: 'Neither the Title or the Body can be left blank' });
  }

  const newForumPost = {
    title: req.body.title,
    body: req.body.body,
    username: req.user.username,
    userImage: req.user.imageUrl,
    createdAt: new Date().toISOString(),
    likeCount: 0,
    commentCount: 0,
    edited: false
  };

  db.collection('forumPosts')
    .add(newForumPost)
    .then((doc) => {
      const resForumPost = newForumPost;
      resForumPost.forumPostId = doc.id;
      res.json(resForumPost);
    })
    .catch((err) => {
      res.status(500).json({ error: 'something went wrong' });
      console.error(err);
    });
};
//like a posts
exports.likeForumPost = (req, res) => {
  return likeComponent('Post', req.params.forumPostId, req, res);
};
//unlike a posts
exports.unlikeForumPost = (req, res) => {
  return unlikeComponent('Post', req.params.forumPostId, req, res);
};
//save a posts
exports.saveForumPost = (req, res) => {

  const saveDocument = db
    .collection('userSaves')
    .where('compType', '==', 'forumPost')
    .where('username', '==', req.user.username)
    .where('linkId', '==', req.params.forumPostId)
    .limit(1);

    const postDoc = db.doc(`/forumPosts/${req.params.forumPostId}`);

    postDoc
      .get()
      .then((doc) => {
        if (doc.exists) {
          return saveDocument.get();
        } else {
          return res.status(404).json({ error: `Post does not exist` });
        }
      })
      .then((data) => {
        if (data.empty) {
          return db
            .collection('userSaves')
            .add({
              compType: 'forumPost',
              username:  req.user.username,
              linkId: req.params.forumPostId
            })
            .then(() => {
              return res.json({ message: `Post saved` });
            });
        } else {
          return res.status(400).json({ error: `You already saved this Post`});
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({ error: err.code });
      });
};
//unsave a posts
exports.unsaveForumPost = (req, res) => {
  const saveDocument = db
    .collection('userSaves')
    .where('compType', '==', 'forumPost')
    .where('username', '==', req.user.username)
    .where('linkId', '==', req.params.forumPostId)
    .limit(1);

  const postDoc = db.doc(`/forumPosts/${req.params.forumPostId}`);

  postDoc
    .get()
    .then((doc) => {
      if (doc.exists) {
        return saveDocument.get();
      } else {
        return res.status(404).json({ error: 'Post does not exist' });
      }
    })
    .then((data) => {
      if (data.empty) {
        return res.status(400).json({ error: `This post is not saved`});
      } else {
        return db
          .doc(`/userSaves/${data.docs[0].id}`)
          .delete()
          .then(() => {
            return res.json({ message: `Post unsaved` });
          });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};
//edit a posts
exports.editForumPost = (req, res) => {
  return editComponent("Post", req.params.forumPostId, req, res);
};
// Delete a forumPost
exports.deleteForumPost = (req, res) => {
  return deleteComponent('Post', req.params.forumPostId, req, res);
};


//unlike a comment
exports.postComment = (req, res) => {
  return commentComponent(req.params.forumPostId, req.params.forumPostId, req, res);
};
//unlike a comment
exports.postSubcomment = (req, res) => {
  return commentComponent(req.params.forumPostId, req.params.forumCommentId, req, res);
};
//edit a comment or subcomment
exports.editForumComment = (req, res) => {
  return editComponent("Comment", req.params.forumCommentId, req, res);
};
//like a comment or subcomment
exports.likeForumComment = (req, res) => {
  return likeComponent('Comment', req.params.forumCommentId, req, res);
};
//unlike a comment or subcomment
exports.unlikeForumComment = (req, res) => {
  return unlikeComponent('Comment', req.params.forumCommentId, req, res);
};
// Delete a forumComment or subcomment
exports.deleteForumComment = (req, res) => {
  return deleteComponent('Comment', req.params.forumCommentId, req, res);
};



function buildComments(object, data) {
  data.forEach((doc) => {
    if (doc.data().parentId === object.id) {
      let comm = {
        id: doc.id,
        data: doc.data(),
        comments: []
      };
      object.comments.push(comm);
      let index = object.comments.findIndex(x => x.id === doc.id);
      buildComments(object.comments[index], data);
    }
  });
}
function editComponent (compType, id, req, res) {
  if (!req.body.body) {
    return res.status(404).json({ error: `${compType} edit cannot be blank` });
  }

  const compDocument = db.collection(`forum${compType}s`).doc(id);
  const edits = db.collection(`forumEdits`).doc(id);
  const editDate = new Date().toISOString().replace(".", ":");

  let componentDocument;
  let flags = true;
  let newJSON;
  let oldJSON;

  const batch = db.batch();

  compDocument
    .get()
    .then((doc) => {
      if (doc.exists && doc.data().username === req.user.username) {
        flags = false;
        componentDocument = doc.data();
        componentDocument.body = req.body.body;

        if(doc.data().title) {
           newJSON = {
            title: req.body.title,
            body: req.body.body,
            edited: true
           };
           oldJSON = {
             [editDate]: {
               title: doc.data().title,
               body:  doc.data().body,
             }
           };
           componentDocument.title = req.body.title;
        } else {
           newJSON = {
               body: req.body.body,
               edited: true
           };
           oldJSON = {
             [editDate]: {
               body: doc.data().body,
             }
           };
         }
        batch.update(compDocument, newJSON);
        return edits.get();
      }
      return res.status(404).json({ error: `you cannot edit this ${compType}` });
    })
    .then((data) => {
      if (!flags) {
        if(data.exists) {
          return batch.update(edits, oldJSON);
        }
        return batch.set(edits, oldJSON);
      }
    })
    .then(() => {
      return batch.commit();
    })
    .then(() => {
      res.json(componentDocument);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
}
function commentComponent (postId, parentId, req, res) {
  if (req.body.body.trim() === '') return res.status(400).json({ comment: 'Must not be empty' });

  const newComment = {
    body: req.body.body,
    createdAt: new Date().toISOString(),
    forumPostId: postId,
    parentId: parentId,
    username: req.user.username,
    userImage: req.user.imageUrl,
    likeCount: 0,
    edited: false
  };

  const parentPost =
    db.doc(`/forumPosts/${postId}`).get()
       .then((doc) => {
         if (!doc.exists) {
           res.status(404).json({ error: 'Post not found' });
           return false;
         }
         return true;
       })
       .catch((err) => {res.status(500).json({ error: 'something went wrong while checking the post' });});

  const parentComment =
    postId === parentId ? true :
      db.doc(`/forumComments/${parentId}`).get()
       .then((doc) => {
         if (!doc.exists) {
           res.status(404).json({ error: 'Comment not found' });
           return false;
         }
         if (doc.data().forumPostId !== postId) {
           console.log(doc.forumPostId, postId);
           res.status(404).json({ error: 'Comment is not affiliated with this post' });
           return false;
         }
         return true;
        })
        .catch((err) => {res.status(500).json({ error: 'something went wrong while checking the comment' });});

    Promise.all([parentPost, parentComment])
    .then((values) => {
      if (values[0] && values[1]) {
        return db.collection('forumComments')
        .add(newComment)
        .then(() => {
          res.json(newComment);
        });
      }
      return console.log("there was an error");
    })
    .catch((err) => {
        res.status(500).json({ error: 'somethign went wrong with the submission' });
    });
}
function likeComponent (compType, id, req, res) {
      const compDocument = db.doc(`/forum${compType}s/${id}`);
      const likeDocument = db
        .collection('forumLikes')
        .where('username', '==', req.user.username)
        .where('compType', '==', compType)  ///not sure if we need this
        .where('compId', '==', id)
        .limit(1);

      let compData;

      compDocument
        .get()
        .then((doc) => {
          if (doc.exists) {
            compData = doc.data();
            compData.likeCount++;
            compData.compId = doc.id;
            compData.linkInfo = compData.forumPostId || doc.id;  //if there is not postId (used to create a link to the liked component for blogs)
            return likeDocument.get();
          } else {
            return res.status(404).json({ error: `${compType} not found` });
          }
        })
        .then((data) => {
          if (data.empty) {
            return db
              .collection('forumLikes')
              .add({
                username: req.user.username,
                compId: id,
                compType: `forum${compType}`,
                linkInfo: compData.linkInfo
              })
              .then(() => {
                return compDocument.update({ likeCount: admin.firestore.FieldValue.increment(1) });
              })
              .then(() => {
                return res.json(compData);
              });
          } else {
            return res.status(400).json({ error: 'You already liked this' });
          }
        })
        .catch((err) => {
          console.error(err);
          res.status(500).json({ error: err.code });
        });
}
function unlikeComponent (compType, id, req, res) {
  const likeDocument = db
    .collection('forumLikes')
    .where('username', '==', req.user.username)
    .where('compType', '==', `forum${compType}`)  ///not sure if we need this
    .where('compId', '==', id)
    .limit(1);

  const compDocument = db.doc(`/forum${compType}s/${id}`);

  let compData;

  compDocument
    .get()
    .then((doc) => {
      if (doc.exists) {
        compData = doc.data();
        compData.likeCount--;
        compData.Id = doc.id;
        return likeDocument.get();
      } else {
        return res.status(404).json({ error: `${compType} not found` });
      }
    })
    .then((data) => {
      if (data.empty) {
        return res.status(400).json({ error: "you don't like this" });
      } else {
        return db
          .doc(`/forumLikes/${data.docs[0].id}`)
          .delete()
          .then(() => {
            return compDocument.update({ likeCount: admin.firestore.FieldValue.increment(-1) });
          })
          .then(() => {
            res.json(compData);
          });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
}
function deleteComponent (compType, id, req, res) {
  const document = db.doc(`/forum${compType}s/${id}`);
  document
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(404).json({ error: `${compType} not found` });
      }
      if (doc.data().username !== req.user.username) {
        return res.status(403).json({ error: 'Unauthorized' });
      } else {
        return document.delete();
      }
    })
    .then(() => {
      res.json({ message: `${compType} deleted successfully` });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
}
