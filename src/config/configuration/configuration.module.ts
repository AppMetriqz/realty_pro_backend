import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import development from '../envs/development';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [development],
    }),
  ],
})
export class ConfigurationModule {}
