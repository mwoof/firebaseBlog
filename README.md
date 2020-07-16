# firebaseBlog
This is fully-featured blog REST API built with Node.js for Firebase projects. It allows users to login/out, add profile information, and upload profile pictures, follow other users, post, read, like, comment on, edit/delete, and save blog posts, and receive notifications on relevant activity. To get an idea of what the JSON databse schema looks like, take a look at the dataschema.js doc

Required npms
npm install -g firebase-tools
npm install --save express
npm install --save busboy       //for image upload
npm install --save firebase
npm install --save firebase-admin


API documentation:

    // ForumPost routes
    GET- forumPosts/:sortMethod - Retrieve forum posts, 50 at a time. Default sort is by trending but can be sorted by likes and age if specified. This request is public and does not require the user to be authenticated.
    POST - forumPosts - Post a single post to the forum. Requires a title and text, and will take tags and a document-type perimeter that default to general and post respectively.
    POST - flinkPreview - Get a media rich link preview for a link within a block of text.
    POST - faddTopics - Admin feature for bulk adding topics (for suggestions).
    POST - faddImage - Admin feature for bulk adding images.
    GET- forumPost/:forumPostId - retrieve a specific forum post. This is a public request with no required authentication.
    GET- forumPost/:forumPostId/like - like a specific forum post. Requires user to be authenticated.
    GET- forumPost/:forumPostId/unlike - unlike a specific forum post. Requires user to be authenticated.
    GET- forumPost/:forumPostId/save - save a specific forum post to a collection. Requires user to be authenticated.
    GET- forumPost/:forumPostId/unsave - remove a specific forum post from a collection. Requires user to be authenticated.
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

