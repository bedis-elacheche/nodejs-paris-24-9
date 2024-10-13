import { exec } from 'node:child_process';

import { Config } from '@jest/types';
import { DockerComposeEnvironment, Wait } from 'testcontainers';

function getRandomAvailablePorts({
  lowestPort = 8000,
  highestPort = 65535,
  take = 1,
}: {
  lowestPort?: number;
  highestPort?: number;
  take?: number;
}) {
  return new Promise<number[]>((resolve, reject) => {
    exec(
      "lsof -i -P -n | grep LISTEN |  awk '{print $(NF-1)}' | cut -d : -f 2",
      (error, stdout) => {
        if (error) {
          return reject(error);
        }

        const listeingPorts = stdout.trim().split('\n').map(Number);

        resolve(
          Array.from(
            { length: highestPort - lowestPort + 1 },
            (_, index) => lowestPort + index,
          )
            .filter((item) => !listeingPorts.includes(item))
            .slice(0, take),
        );
      },
    );
  });
}

export default async function globalSetup(
  _globalConfig: Config.GlobalConfig,
  _projectConfig: Config.ProjectConfig,
) {
  const [REDIS_PORT, MONGO_PORT, MS_USERS_PORT, MS_CHAT_PORT] =
    await getRandomAvailablePorts({ take: 4 });

  const environment = await new DockerComposeEnvironment(
    `${__dirname}/../../../`,
    'docker-compose.yml',
  )
    .withEnvironment({
      REDIS_PORT: `${REDIS_PORT}`,
      MONGO_PORT: `${MONGO_PORT}`,
      MS_USERS_PORT: `${MS_USERS_PORT}`,
      MS_CHAT_PORT: `${MS_CHAT_PORT}`,
    })
    .withWaitStrategy(
      'redis',
      Wait.forLogMessage(/.*ready to accept connections.*/i),
    )
    .withWaitStrategy('db', Wait.forLogMessage(/.*waiting for connections.*/i))
    .withWaitStrategy(
      'ms-users',
      Wait.forLogMessage(/.*application running.*/i),
    )
    .withWaitStrategy('ms-chat', Wait.forLogMessage(/.*application running.*/i))
    .withProjectName('test')
    .up(['db', 'redis', 'ms-users', 'ms-chat']);

  const msChatContainer = environment.getContainer('ms-chat-1');
  const msUsersContainer = environment.getContainer('ms-users-1');

  process.env.MS_CHAT_API_URL = `http://${msChatContainer.getHost()}:${msChatContainer.getFirstMappedPort()}`;
  process.env.MS_USERS_API_URL = `http://${msUsersContainer.getHost()}:${msUsersContainer.getFirstMappedPort()}`;
  globalThis.TEST_CONTAINERS_ENVIRONEMENT = environment;
}
