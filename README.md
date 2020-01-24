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
        get     /forumPosts
        post    /forumPost
        get     /forumPost/:forumPostId
        get     /forumPost/:forumPostId/like
        get     /forumPost/:forumPostId/unlike
        get     /forumPost/:forumPostId/save
        get     /forumPost/:forumPostId/unsave
        post    /forumPost/:forumPostId/edit
        delete  /forumPost/:forumPostId/delete
        post    /forumPost/:forumPostId/comment
        post    /forumComment/:forumPostId/:forumCommentId/comment
        get     /forumComment/:forumCommentId/like
        get     /forumComment/:forumCommentId/unlike
        post    /forumComment/:forumCommentId/edit
        delete  /forumComment/:forumCommentId/delete

    // users routes
        post   /signup
        post   /signin
        post   /user/image
        post   /user
        get    /user
        get    /user/:username
        get    /user/:username/follow
        get    /user/:username/unfollow
        post   /notifications
