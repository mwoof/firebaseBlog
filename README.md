# firebaseBlog
This is fully-featured blog REST API built with Node.js for Firebase projects. It allows users to login/out, add profile information, and upload profile pictures, follow other users, post, read, like, comment on, edit/delete, and save blog posts, and receive notifications on relevant activity. A good amount of the code is based off of Classed's video (https://www.youtube.com/watch?v=m_u6P5k0vP0) with the added features of sub-commenting, editing and liking comments and posts, saving/favoriting posts, following other users (and getting notifications when they post posts). To get an idea of what the JSON databse schema looks like, take a look at the dataschema.js doc

Required npms
npm install -g firebase-tools
npm install --save express
npm install --save busboy       //for image upload
npm install --save firebase
npm install --save firebase-admin


API documentation:

    // ForumPost routes
    GET- forumPosts
    POST - forumPosts/:sortMethod
    POST - fforumPost
    POST - flinkPreview
    POST - faddTopics
    POST - faddImage
    GET- forumPost/:forumPostId
    GET- forumPost/:forumPostId/like
    GET- forumPost/:forumPostId/unlike
    GET- forumPost/:forumPostId/save
    GET- forumPost/:forumPostId/unsave
    POST - forumPost/:forumPostId/edit
    DELETE - forumPost/:forumPostId/delete
    POST - forumPost/:forumPostId/comment
    GET- forumComment/:forumCommentId/like
    GET- forumComment/:forumCommentId/unlike
    POST - forumComment/:forumCommentId/edit
    DELETE - forumComment/:forumCommentId/delete

    // admin routes
    POST - indexCollection

    // users routes
    POST - signup
    POST - signup/setProfile
    POST - signup/usernameCheck
    POST - signup/usernameCheck
    POST - signin
    POST - user/plan
    POST - user/image
    POST - user
    GET-user
    GET-user/:username
    GET-user/:username/follow
    GET-user/:username/unfollow
    POST - notifications

    //bet program routes
    POST - beta/signup
    POST - beta/unsubscribe

    //emails routs
    POST - contactForm/submit
    POST - mailingList/subscribe
    POST - mailingList/unsubscribe

