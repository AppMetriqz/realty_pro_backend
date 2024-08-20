import { Injectable, PipeTransform } from "@nestjs/common";
import { extname } from "path";
import { CatchException } from "../exceptions";
import { StatusCodes } from "../constants";
import * as fs from "fs-extra";
import * as _ from "lodash";

@Injectable()
export class CustomFileValidator implements PipeTransform {
  transform(value: Express.Multer.File) {
    if (value) {
      return onCheckFile(value);
    }
    return null;
  }
}
export class CustomFilesValidator implements PipeTransform {
  async transform(values: Array<Express.Multer.File>) {
    const files = _.flatten(_.values(values));

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      await onCheckFile(file, files);
    }

    return files;
  }
}

async function onCheckFile(
  value: Express.Multer.File,
  files?: Array<Express.Multer.File>,
) {
  const fileType = [".jpg", ".jpeg", ".png", ".pdf"];
  const fileExt = extname(value.originalname);
  const fileSize = value.size;
  const maxSize = 2 * 1024 * 1024;

  const error = {
    statusCode: StatusCodes.BadRequest.statusCode,
    error: StatusCodes.BadRequest.error,
    message: "",
  };

  if (!fileType.includes(fileExt)) {
    error.message = `File type is not allowed. Allowed types: ${fileType.join(", ")}`;
    await onDeleteFile(value, files);
    return new CatchException().Error(error);
  }

  if (fileSize > maxSize) {
    error.message = `File size is not allowed. Allowed size per file: 2MB`;
    await onDeleteFile(value, files);
    return new CatchException().Error(error);
  }
  return value;
}

async function onDeleteFile(
  file: Express.Multer.File,
  files: Array<Express.Multer.File>,
) {
  if (_.isArray(files)) {
    for (let i = 0; i < files.length; i++) {
      await fs.remove(files[i].path);
    }
  } else {
    await fs.remove(file.path);
  }
}
