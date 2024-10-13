import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Cache, createCache } from 'cache-manager';
import { RedisStore, redisStore } from 'cache-manager-redis-yet';
import * as request from 'supertest';
import { GenericContainer, StartedTestContainer, Wait } from 'testcontainers';

import { CreateMessageDto } from './dto/create-message.dto';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';

describe('MessageController', () => {
  let container: StartedTestContainer;
  let store: RedisStore;
  let cacheService: Cache;
  let app: INestApplication;
  let messageService: MessageService;

  beforeAll(async () => {
    container = await new GenericContainer('redis:4.0-alpine')
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
        MessageService,
        { provide: CACHE_MANAGER, useValue: cacheService },
      ],
      controllers: [MessageController],
    }).compile();

    messageService = moduleFixture.get<MessageService>(MessageService);

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    app.close();
  });

  describe('/messages', () => {
    describe('(POST)', () => {
      it('creates a new message', async () => {
        const createMessageDto: CreateMessageDto = {
          conversationId: `testing-conversation-${Date.now()}`,
          authorId: 'john-doe',
          content: 'hello world',
        };

        const { body } = await request(app.getHttpServer())
          .post('/messages')
          .send(createMessageDto)
          .expect(HttpStatus.CREATED);

        expect(body).toMatchObject(createMessageDto);

        await expect(
          cacheService.get(`message:${body.conversationId}:${body.id}`),
        ).resolves.toMatchObject(createMessageDto);
      });
    });
  });

  describe('/messages/conversation/:id', () => {
    describe('(GET)', () => {
      it('returns an empty collection', async () => {
        await request(app.getHttpServer())
          .get('/messages/conversation/testing-conversation')
          .expect(HttpStatus.OK)
          .expect([]);
      });

      it('returns conversation messages', async () => {
        const conversationId = `testing-conversation-${Date.now()}`;
        const firstMessage: CreateMessageDto = {
          conversationId,
          authorId: 'john-doe',
          content: 'Ping',
        };
        await messageService.create(firstMessage);

        const secondMessage: CreateMessageDto = {
          conversationId,
          authorId: 'jane-doe',
          content: 'Pong',
        };
        await messageService.create(secondMessage);

        const anotherMessage: CreateMessageDto = {
          conversationId: Date.now().toString(),
          authorId: 'jane-doe',
          content: 'Hello',
        };
        await messageService.create(anotherMessage);

        await request(app.getHttpServer())
          .get(`/messages/conversation/${conversationId}`)
          .expect(HttpStatus.OK)
          .expect(({ body }) =>
            expect(body).toMatchObject([firstMessage, secondMessage]),
          );
      });
    });
  });
});
