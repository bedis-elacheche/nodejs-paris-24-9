import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';

import { AppModule } from './app.module';
import { CreateConversationInput } from './conversation/conversation.model';
import { CreateMessageInput } from './message/message.model';
import { CreateUserInput } from './user/user.model';

describe('AppModule (E2E)', () => {
  let app: INestApplication;

  let firstUserId: string;
  let secondUserId: string;
  let thirdUserId: string;
  let firstConversationId: string;
  let secondConversationId: string;
  let thirdConversationId: string;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('Signup users:', () => {
    const createUserRequest = async (
      payload: Omit<CreateUserInput, 'password'>,
    ) =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation TestCreateUser(
                $data: CreateUserInput!
            ) {
                signup(
                createUserData: $data
                ) {
                id
                lastname
                username
                firstname
                age
                conversations {
                    createdAt
                    messages {
                    createdAt
                    }
                }
                }
            }`,
          variables: {
            data: { ...payload, password: 'password' },
          },
        })
        .expect(HttpStatus.OK)
        .then(({ body }) => body);

    it('first user', async () => {
      const body = await createUserRequest({
        username: 'john-doe',
        firstname: 'John',
        lastname: 'Doe',
        age: 42,
      });

      expect(body).toMatchObject({
        data: {
          signup: {
            username: 'john-doe',
            firstname: 'John',
            lastname: 'Doe',
            age: 42,
            conversations: [],
          },
        },
      });

      firstUserId = body.data.signup.id;
    });

    it('second user', async () => {
      const body = await createUserRequest({
        username: 'jane-doe',
        firstname: 'Jane',
        lastname: 'Doe',
        age: 42,
      });

      expect(body).toMatchObject({
        data: {
          signup: {
            username: 'jane-doe',
            firstname: 'Jane',
            lastname: 'Doe',
            age: 42,
            conversations: [],
          },
        },
      });

      secondUserId = body.data.signup.id;
    });

    it('third user', async () => {
      const body = await createUserRequest({
        username: 'john-smith',
        firstname: 'John',
        lastname: 'Smith',
        age: 42,
      });

      expect(body).toMatchObject({
        data: {
          signup: {
            username: 'john-smith',
            firstname: 'John',
            lastname: 'Smith',
            age: 42,
            conversations: [],
          },
        },
      });

      thirdUserId = body.data.signup.id;
    });

    it('user with existing username', async () => {
      const body = await createUserRequest({
        username: 'john-smith',
        firstname: 'John',
        lastname: 'Smith',
        age: 42,
      });

      expect(body).toMatchObject({
        errors: [
          {
            message: 'Request failed with status code 409',
            path: ['signup'],
          },
        ],
        data: null,
      });
    });
  });

  describe('Create converastions:', () => {
    const createConversation = (data: CreateConversationInput) =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation TestCreateConversation(
                $data: CreateConversationInput!
            ) {
                createConversation(
                createConversationData: $data
                ) {
                id
                creator {
                    id
                    username
                }
                members {
                    id
                    username
                }
                messages {
                    createdAt
                }
                }
            }`,
          variables: {
            data,
          },
        })
        .expect(HttpStatus.OK)
        .then(({ body }) => body);

    it('with a single member', async () => {
      const body = await createConversation({
        subject: 'signle-member_conversation',
        creatorId: firstUserId,
        memberIds: [firstUserId],
      });

      expect(body).toMatchObject({
        data: {
          createConversation: {
            creator: {
              id: firstUserId,
              username: 'john-doe',
            },
            members: [{ id: firstUserId, username: 'john-doe' }],
            messages: [],
          },
        },
      });

      firstConversationId = body.data.createConversation.id;
    });

    it('with two members', async () => {
      const body = await createConversation({
        subject: 'two-members_conversation',
        creatorId: secondUserId,
        memberIds: [secondUserId, thirdUserId],
      });

      expect(body).toMatchObject({
        data: {
          createConversation: {
            creator: {
              id: secondUserId,
              username: 'jane-doe',
            },
            members: [
              { id: secondUserId, username: 'jane-doe' },
              { id: thirdUserId, username: 'john-smith' },
            ],
            messages: [],
          },
        },
      });

      secondConversationId = body.data.createConversation.id;
    });

    it('with more members', async () => {
      const body = await createConversation({
        subject: 'many-members_conversation',
        creatorId: thirdUserId,
        memberIds: [thirdUserId, secondUserId, firstUserId],
      });

      expect(body).toMatchObject({
        data: {
          createConversation: {
            creator: {
              id: thirdUserId,
              username: 'john-smith',
            },
            members: [
              { id: thirdUserId, username: 'john-smith' },
              { id: secondUserId, username: 'jane-doe' },
              { id: firstUserId, username: 'john-doe' },
            ],
            messages: [],
          },
        },
      });

      thirdConversationId = body.data.createConversation.id;
    });
  });

  describe('Send messages:', () => {
    const sendMessage = (data: CreateMessageInput) =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation TestSendMessage($data: CreateMessageInput!) {
              sendMessage(sendMessageData: $data) {
                  author {
                    id
                    username
                  }
                  content
                  createdAt
               }
            }`,
          variables: {
            data,
          },
        })
        .expect(HttpStatus.OK)
        .then(({ body }) => body);

    it('on second conversation', async () => {
      const firstMessageBody = await sendMessage({
        content: 'Hey Jane!',
        authorId: thirdUserId,
        conversationId: secondConversationId,
      });

      expect(firstMessageBody).toMatchObject({
        data: {
          sendMessage: {
            author: {
              id: thirdUserId,
              username: 'john-smith',
            },
            content: 'Hey Jane!',
          },
        },
      });

      const secondMessageBody = await sendMessage({
        content: 'Hello John!',
        authorId: secondUserId,
        conversationId: secondConversationId,
      });

      expect(secondMessageBody).toMatchObject({
        data: {
          sendMessage: {
            author: {
              id: secondUserId,
              username: 'jane-doe',
            },
            content: 'Hello John!',
          },
        },
      });
    });
  });

  describe('Query conversations:', () => {
    it("member's conversations", async () => {
      await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            query TestGetConversations($memberId: ID!) {
              conversations(memberId: $memberId) {
                createdAt
                creator {
                  id
                  username
                }
                id
                members {
                  id
                  username
                }
                messages {
                  author {
                    id
                    username
                  }
                  content
                  createdAt
                }
              }
            }`,
          variables: {
            memberId: firstUserId,
          },
        })
        .expect(HttpStatus.OK)
        .expect(({ body }) =>
          expect(body).toMatchObject({
            data: {
              conversations: [
                {
                  creator: {
                    id: firstUserId,
                    username: 'john-doe',
                  },
                  id: firstConversationId,
                  members: [
                    {
                      id: firstUserId,
                      username: 'john-doe',
                    },
                  ],
                  messages: [],
                },
                {
                  creator: {
                    id: thirdUserId,
                    username: 'john-smith',
                  },
                  id: thirdConversationId,
                  members: [
                    {
                      id: thirdUserId,
                      username: 'john-smith',
                    },
                    {
                      id: secondUserId,
                      username: 'jane-doe',
                    },
                    {
                      id: firstUserId,
                      username: 'john-doe',
                    },
                  ],
                  messages: [],
                },
              ],
            },
          }),
        );
    });

    it('a single conversation', async () => {
      await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
              query TestGetConversation($conversationId: ID!) {
                conversation(id: $conversationId) {
                  createdAt
                  creator {
                    id
                    username
                  }
                  id
                  members {
                    id
                    username
                  }
                  messages {
                    author {
                      id
                      username
                    }
                    content
                    createdAt
                  }
                }
              }`,
          variables: {
            conversationId: secondConversationId,
          },
        })
        .expect(HttpStatus.OK)
        .expect(({ body }) =>
          expect(body).toMatchObject({
            data: {
              conversation: {
                creator: {
                  id: secondUserId,
                  username: 'jane-doe',
                },
                id: secondConversationId,
                members: [
                  {
                    id: secondUserId,
                    username: 'jane-doe',
                  },
                  {
                    id: thirdUserId,
                    username: 'john-smith',
                  },
                ],
                messages: [
                  {
                    author: {
                      id: thirdUserId,
                      username: 'john-smith',
                    },
                    content: 'Hey Jane!',
                  },
                  {
                    author: {
                      id: secondUserId,
                      username: 'jane-doe',
                    },
                    content: 'Hello John!',
                  },
                ],
              },
            },
          }),
        );
    });
  });

  describe('Query users:', () => {
    it('all users', async () => {
      await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            query TestGetUsers {
              users {
                id
                username
                firstname
                lastname
                age
                conversations {
                  id
                }
              }
            }`,
          variables: {},
        })
        .expect(HttpStatus.OK)
        .expect(({ body }) =>
          expect(body).toMatchObject({
            data: {
              users: [
                {
                  id: firstUserId,
                  username: 'john-doe',
                  firstname: 'John',
                  lastname: 'Doe',
                  age: 42,
                  conversations: [
                    {
                      id: firstConversationId,
                    },
                    {
                      id: thirdConversationId,
                    },
                  ],
                },
                {
                  id: secondUserId,
                  username: 'jane-doe',
                  firstname: 'Jane',
                  lastname: 'Doe',
                  age: 42,
                  conversations: [
                    {
                      id: secondConversationId,
                    },
                    {
                      id: thirdConversationId,
                    },
                  ],
                },
                {
                  id: thirdUserId,
                  username: 'john-smith',
                  firstname: 'John',
                  lastname: 'Smith',
                  age: 42,
                  conversations: [
                    {
                      id: secondConversationId,
                    },
                    {
                      id: thirdConversationId,
                    },
                  ],
                },
              ],
            },
          }),
        );
    });

    it('a single user', async () => {
      await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
              query TestGetUser($userId: ID!) {
                user(id: $userId) {
                  id
                  username
                  firstname
                  lastname
                  age
                  conversations {
                    id
                  }
                }
              }`,
          variables: {
            userId: firstUserId,
          },
        })
        .expect(HttpStatus.OK)
        .expect(({ body }) =>
          expect(body).toMatchObject({
            data: {
              user: {
                id: firstUserId,
                username: 'john-doe',
                firstname: 'John',
                lastname: 'Doe',
                age: 42,
                conversations: [
                  {
                    id: firstConversationId,
                  },
                  {
                    id: thirdConversationId,
                  },
                ],
              },
            },
          }),
        );
    });
  });
});
