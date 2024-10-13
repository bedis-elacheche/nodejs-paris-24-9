import { Config } from '@jest/types';
import { StartedDockerComposeEnvironment } from 'testcontainers';

export default async function globalTearDown(
  _globalConfig: Config.GlobalConfig,
  _projectConfig: Config.ProjectConfig,
) {
  await (
    globalThis.TEST_CONTAINERS_ENVIRONEMENT as StartedDockerComposeEnvironment
  ).down();
}
