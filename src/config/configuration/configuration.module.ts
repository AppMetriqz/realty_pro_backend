import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import development from '../envs/development';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'production' ? '.env' : '.env.development',
      load: [development],
      ignoreEnvFile: false,
    }),
  ],
})
export class ConfigurationModule {}
