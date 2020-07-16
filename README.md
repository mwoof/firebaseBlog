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
    GET- forumPost/:forumPostId - retrieve a specific forum post and all it's media, stats and comments. This is a public request with no required authentication.
    GET- forumPost/:forumPostId/like - like a specific forum post. Requires user to be authenticated.
    GET- forumPost/:forumPostId/unlike - unlike a specific forum post. Requires user to be authenticated.
    GET- forumPost/:forumPostId/save - save a specific forum post to a collection. Requires user to be authenticated.
    GET- forumPost/:forumPostId/unsave - remove a specific forum post from a collection. Requires user to be authenticated.
    POST - forumPost/:forumPostId/edit - edit a specific forum post. Requires user to be authenticated and either be an admin or original author of post.
    DELETE - forumPost/:forumPostId/delete - delete a specific forum post. Requires user to be authenticated and either be an admin or original author of post.
    POST - forumPost/:forumPostId/comment - comment on a specif post. Requires user to be authenticated.
    GET- forumComment/:forumCommentId/like - like a specific comment on a forum post. Requires user to be authenticated.
    GET- forumComment/:forumCommentId/unlike -  unlike a specific comment on a forum post. Requires user to be authenticated.
    POST - forumComment/:forumCommentId/edit - edit a specific comment on a forum post. Requires user to be authenticatedand either be an admin or original author of comment.
    DELETE - forumComment/:forumCommentId/delete - delete a specific comment on a forum post. Requires user to be authenticatedand either be an admin or original author of comment.

    // admin routes
    POST - indexCollection - Index all searchable information int he forum post database (designed specifically for Algolia)

    // users routes
    POST - signup - create a basic account with email and password.
    POST - signup/setProfile - add profile information (profile picture, username, bio, account type) to existing account.
    POST - signup/usernameCheck - check if a username is available.
    POST - signin - sign in to an existing account with username and password or 3rd party authentication (Google, Facebook, Twitter, Microsoft).
    POST - user/plan - add or change a users plan.
    POST - user/image - add or change a users profile picture.
    POST - user - edit textual information for a user account (bio, email, interests).
    GET-user - retrieve all information for an authenticated user (notifications, profile, posts, comments, saves).
    GET-user/:username - get all publicly available information for a specific user.
    GET-user/:username/follow - follow a specific user. Requires user to be authenticated.
    GET-user/:username/unfollow - unfollow a specific user. Requires user to be authenticated.
    POST - notifications - mark a notification as read.

    //bet program routes
    POST - beta/signup - sign up for the beta brogram via email.
    POST - beta/unsubscribe - unsubscribe from the beta program

    //emails routs
    POST - contactForm/submit - submit a contact form. It will be distributed to the appropriate admins.
    POST - mailingList/subscribe - subscribe to the mailing list.
    POST - mailingList/unsubscribe - unsubscribe from the mailing list.

