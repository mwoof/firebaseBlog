
//This is how the firebase collections and documents will look


let db = {
  users: [
    {
      userId: 'dh23ggj5h32g543j5gf43',
      email: 'user@email.com',
      userName: 'user',
      createdAt: '2019-03-15T10:59:52.798Z',
      imageUrl: 'images/userProfiles/dsfsdkfghskdfgs/dgfdhfgdh',
      bio: 'Hello, my name is user, nice to meet you',
      website: 'https://user.com',
      location: 'Lonodn, UK'
    }
  ],
  userFollows: [
    {
      followeeUsername: 'user1',
      followerUsername: 'user2',
    }
  ],
  userSaves: [
    {
      compType: 'forumPost',
      linkId: 'dh23ggj5h32g543j5gf43',               //the id necesary to build the link on the fron end
      userName: 'user'
    }
  ],
  notifications: [
    {
      recipient: 'user',
      sender: 'john',
      read: 'true | false',
      forumPostId: 'kdjsfgdksuufhgkdsufky',
      NotificationType: 'like | comment | console',  // TODO: will have to be modified for things other than forumPosts
      createdAt: '2019-03-15T10:59:52.798Z',
      compId: 'kdjsfgdksuufhgkdsufky',
      compType: 'forumPost',
      linkInfo: 'kdjsfgdksuufhgkdsufky'              //the id necesary to build the link on the fron end
    }
  ],
  forumPosts: [
    {
      userName: 'user',
      title: 'title',
      body: 'This is a sample scream',
      createdAt: '2019-03-15T10:59:52.798Z',
      likeCount: 5,
      commentCount: 3,
      edited: true
    }
  ],
  forumComments: [
    {
      userName: 'user',
      forumPostId: 'kdjsfgdksuufhgkdsufky',
      body: 'nice one mate!',
      createdAt: '2019-03-15T10:59:52.798Z'
    }
  ],
  forumEdits: [
    {
      '2020-01-17T20:17:37:829Z': {
          title: 'title',                         //not applicable for comments
          body: 'This is a sample scream',
        }
      }
  ],
  credentials: [
    {
      userId: 'N43KJ5H43KJHREW4J5H3JWMERHB',
      email: 'user@email.com',
      userName: 'user',
      createdAt: '2019-03-15T10:59:52.798Z',
      imageUrl: 'images/userProfiles/dsfsdkfghskdfgs/dgfdhfgdh',
      bio: 'Hello, my name is user, nice to meet you',
      website: 'https://user.com',
      location: 'Lonodn, UK'
    }
  ],
  likes: [
    {
      userName: 'user',
      compType: 'forumPost | forumComment',
      compId: 'csRvt21qDqSeLqXv3mAr',
      linkInfo: 'hh7O5oWfWucVzGbHH2pa'               //for comments the linkInfo is the posts link
    },
  ]
};
