import { HttpStatus, INestApplication } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import {
  MongoDBContainer,
  StartedMongoDBContainer,
} from '@testcontainers/mongodb';
import mongoose from 'mongoose';
import * as request from 'supertest';

import { CreateUserDto } from './dto/create-user.dto';
import { UserController } from './user.controller';
import { User, UserSchema } from './user.model';
import { UserService } from './user.service';

describe('UserController', () => {
  let container: StartedMongoDBContainer;
  let app: INestApplication;
  let userService: UserService;

  beforeAll(async () => {
    container = await new MongoDBContainer('mongo:6').start();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await container.stop();
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(
          `${container.getConnectionString()}/ms-users-test`,
          { directConnection: true },
        ),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
      ],
      controllers: [UserController],
      providers: [UserService],
    }).compile();

    app = moduleFixture.createNestApplication();
    userService = moduleFixture.get<UserService>(UserService);

    await app.init();
  });

  describe('/users', () => {
    describe('(GET)', () => {
      it('returns an empty collection', () => {
        return request(app.getHttpServer())
          .get('/users')
          .expect(HttpStatus.OK)
          .expect([]);
      });

      it('returns users', async () => {
        const johnDoe: CreateUserDto = {
          username: `john-doe-${Date.now()}`,
          firstname: 'John',
          lastname: 'Doe',
          password: 'super-secret',
          age: 42,
        };
        const janeDoe: CreateUserDto = {
          username: `jane-doe-${Date.now()}`,
          firstname: 'Jane',
          lastname: 'Doe',
          password: 'super-secret',
          age: 42,
        };

        await userService.create(johnDoe);
        await userService.create(janeDoe);

        return request(app.getHttpServer())
          .get('/users')
          .expect(HttpStatus.OK)
          .expect(({ body }) => expect(body).toMatchObject([johnDoe, janeDoe]));
      });
    });

    describe('(POST)', () => {
      it('creates a new user', async () => {
        const createUserDto: CreateUserDto = {
          username: `john-doe-${Date.now()}`,
          firstname: 'John',
          lastname: 'Doe',
          password: 'super-secret',
          age: 42,
        };

        await request(app.getHttpServer())
          .post('/users')
          .send(createUserDto)
          .expect(HttpStatus.CREATED)
          .expect(({ body }) => expect(body).toMatchObject(createUserDto));
      });

      it('fails when reusing an existing username', async () => {
        const createUserDto: CreateUserDto = {
          username: `john-doe-${Date.now()}`,
          firstname: 'John',
          lastname: 'Doe',
          password: 'super-secret',
          age: 42,
        };

        await userService.create(createUserDto);

        await request(app.getHttpServer())
          .post('/users')
          .send(createUserDto)
          .expect(HttpStatus.CONFLICT)
          .expect(({ body }) =>
            expect(body).toMatchObject({
              message: 'Username already taken',
            }),
          );
      });
    });
  });

  describe('/users/:id', () => {
    describe('(GET)', () => {
      it('returns an exception', () => {
        return request(app.getHttpServer())
          .get('/users/507f1f77bcf86cd799439011')
          .expect(HttpStatus.NOT_FOUND);
      });

      it('returns users', async () => {
        const johnDoe: CreateUserDto = {
          username: `john-doe-${Date.now()}`,
          firstname: 'John',
          lastname: 'Doe',
          password: 'super-secret',
          age: 42,
        };
        const createdUser = await userService.create(johnDoe);

        return request(app.getHttpServer())
          .get(`/users/${createdUser._id}`)
          .expect(HttpStatus.OK)
          .expect(({ body }) => expect(body).toMatchObject(johnDoe));
      });
    });
  });
});
