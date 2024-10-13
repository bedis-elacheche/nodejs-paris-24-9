import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { HydratedDocument, Model } from 'mongoose';

import type { CreateUserDto } from './dto/create-user.dto';
import { User } from './user.model';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<HydratedDocument<User>> {
    if (await this.findByUsername(createUserDto.username)) {
      throw new ConflictException('Username already taken');
    }

    return this.userModel.create(createUserDto);
  }

  async findAll(): Promise<HydratedDocument<User>[]> {
    return this.userModel.find().exec();
  }

  async findByUsername(
    username: string,
  ): Promise<HydratedDocument<User> | null> {
    return this.userModel.findOne({ username }).exec();
  }

  async findById(userId: string): Promise<HydratedDocument<User> | null> {
    return this.userModel.findById(userId).exec();
  }
}
