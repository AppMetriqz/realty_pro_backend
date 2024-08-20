import { Global, Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import * as multer from 'multer';
import { extname } from 'path';
import * as CryptoJS from 'crypto-js';
import { v4 as uuidv4 } from 'uuid';

@Global()
@Module({
  imports: [
    MulterModule.register({
      dest: './uploads',
      storage: multer.diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = CryptoJS.MD5(uuidv4());
          const fileExt = extname(file.originalname);
          const newFilename = `${uniqueSuffix}${fileExt}`;
          cb(null, newFilename);
        },
      }),
    }),
  ],
  exports: [MulterModule],
})
export class FileModule {}
