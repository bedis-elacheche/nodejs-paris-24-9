import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ObjectId } from 'bson';
import { Cache, createCache } from 'cache-manager';
import { RedisStore, redisStore } from 'cache-manager-redis-yet';
import * as request from 'supertest';
import { GenericContainer, StartedTestContainer, Wait } from 'testcontainers';

import { ConversationController } from './conversation.controller';
import { ConversationService } from './conversation.service';
import { CreateConversationDto } from './dto/create-conversation.dto';

describe('ConversationController', () => {
  let container: StartedTestContainer;
  let store: RedisStore;
  let cacheService: Cache;
  let app: INestApplication;
  let conversationService: ConversationService;

  beforeAll(async () => {
    container = await new GenericContainer('valkey/valkey:8')
      .withExposedPorts(6379)
      .withWaitStrategy(Wait.forLogMessage('Ready to accept connections'))
      .start();

    store = await redisStore({
      url: `redis://${container.getHost()}:${container.getMappedPort(6379)}/0`,
    });
    cacheService = createCache(store);
  });

  afterAll(async () => {
    await store.client.disconnect();
    await container.stop();
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [
        ConversationService,
        { provide: CACHE_MANAGER, useValue: cacheService },
      ],
      controllers: [ConversationController],
    }).compile();

    conversationService =
      moduleFixture.get<ConversationService>(ConversationService);

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('/conversations', () => {
    describe('(POST)', () => {
      it('creates a new conversation', async () => {
        const firstUser = new ObjectId().toString();
        const secondUser = new ObjectId().toString();
        const createConversationDto: CreateConversationDto = {
          subject: 'testing-conversation',
          creatorId: firstUser,
          memberIds: [firstUser, secondUser],
        };

        const { body } = await request(app.getHttpServer())
          .post('/conversations')
          .send(createConversationDto)
          .expect(HttpStatus.CREATED);

        expect(body).toMatchObject(createConversationDto);

        await expect(
          cacheService.get(`conversation:${body.id}`),
        ).resolves.toMatchObject(createConversationDto);
        await expect(
          cacheService.get(`member:${firstUser}`),
        ).resolves.toMatchObject([body.id]);
        await expect(
          cacheService.get(`member:${secondUser}`),
        ).resolves.toMatchObject([body.id]);
      });
    });
  });

  describe('/conversations/:id', () => {
    describe('(GET)', () => {
      it('returns an exception', () => {
        return request(app.getHttpServer())
          .get('/conversations/507f1f77bcf86cd799439011')
          .expect(HttpStatus.NOT_FOUND);
      });

      it('returns a conversation', async () => {
        const firstUser = new ObjectId().toString();
        const secondUser = new ObjectId().toString();
        const createConversationDto: CreateConversationDto = {
          subject: 'testing-conversation',
          creatorId: firstUser,
          memberIds: [firstUser, secondUser],
        };
        const createdConversation = await conversationService.create(
          createConversationDto,
        );

        return request(app.getHttpServer())
          .get(`/conversations/${createdConversation.id}`)
          .expect(HttpStatus.OK)
          .expect(({ body }) =>
            expect(body).toMatchObject(createConversationDto),
          );
      });
    });
  });

  describe('/conversations/member/:id', () => {
    describe('(GET)', () => {
      it('returns an empty collection', () => {
        return request(app.getHttpServer())
          .get('/conversations/member/507f1f77bcf86cd799439011')
          .expect(HttpStatus.OK)
          .expect([]);
      });

      it('returns member conversations', async () => {
        const firstUser = new ObjectId().toString();
        const secondUser = new ObjectId().toString();
        const thirdUser = new ObjectId().toString();

        const firstConversation: CreateConversationDto = {
          subject: 'testing-conversation',
          creatorId: firstUser,
          memberIds: [firstUser, secondUser],
        };
        await conversationService.create(firstConversation);

        const secondConversation: CreateConversationDto = {
          subject: 'another-testing-conversation',
          creatorId: secondUser,
          memberIds: [firstUser, secondUser],
        };
        await conversationService.create(secondConversation);

        const thirdConversation: CreateConversationDto = {
          subject: 'yet-another-testing-conversation',
          creatorId: thirdUser,
          memberIds: [secondUser, thirdUser],
        };
        await conversationService.create(thirdConversation);

        return request(app.getHttpServer())
          .get(`/conversations/member/${firstUser}`)
          .expect(HttpStatus.OK)
          .expect(({ body }) =>
            expect(body).toMatchObject([firstConversation, secondConversation]),
          );
      });
    });
  });
});
