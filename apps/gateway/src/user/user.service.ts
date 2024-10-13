import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

import { Config } from '../config';
import { CreateUserInput, User } from './user.model';

@Injectable()
export class UserService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService<Config>,
  ) {}

  async createUser(user: CreateUserInput): Promise<User> {
    const { data } = await firstValueFrom(
      this.httpService.post<User>(
        `${this.configService.get('MS_USERS_API_URL')}/users`,
        user,
      ),
    );

    return data;
  }

  async getUserById(id: string): Promise<User> {
    const { data } = await firstValueFrom(
      this.httpService.get<User>(
        `${this.configService.get('MS_USERS_API_URL')}/users/${id}`,
      ),
    );

    return data;
  }
  async getAllUsers(): Promise<User[]> {
    const { data } = await firstValueFrom(
      this.httpService.get<User[]>(
        `${this.configService.get('MS_USERS_API_URL')}/users`,
      ),
    );

    return data;
  }
}
