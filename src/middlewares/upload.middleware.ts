import multer from "multer";
import { Request, Response, NextFunction } from "express";
import { ErrorResponse } from "@utils/responseHandler.utils";

// file-type v16 is CJS, expose { fromBuffer } synchronously via require.
// We avoid a dynamic `await import("file-type")` because tsc (module: commonjs)
// rewrites it to an interop require which breaks for ESM-only versions, and
// keeps behavior stable if the dep is ever re-upgraded.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { fromBuffer } = require("file-type") as {
  fromBuffer: (
    buffer: Buffer
  ) => Promise<{ ext: string; mime: string } | undefined>;
};

const ALLOWED_MIMES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

const storage = multer.memoryStorage();

export const uploadImage = (fieldName: string) => {
  const mw = multer({
    storage,
    limits: { fileSize: MAX_SIZE, files: 1 },
    fileFilter: (_req, file, cb) => {
      if (!ALLOWED_MIMES.has(file.mimetype)) {
        return cb(new Error(`Mimetype not allowed: ${file.mimetype}`));
      }
      cb(null, true);
    },
  }).single(fieldName);

  return (req: Request, res: Response, next: NextFunction) => {
    mw(req, res, (err: any) => {
      if (err) {
        // Multer errors → BadRequest. Otros también.
        if (err.code === "LIMIT_FILE_SIZE") {
          return ErrorResponse.INVALID_FIELD(
            res,
            fieldName,
            "File too large (max 5MB)"
          );
        }
        return ErrorResponse.INVALID_FIELD(res, fieldName, err.message);
      }
      if (!req.file)
        return ErrorResponse.INVALID_FIELD(res, fieldName, "File is required");
      next();
    });
  };
};

// Middleware posterior: valida magic-bytes. Rechaza si el contenido real no matchea
// los mimetypes permitidos, incluso si el .ext y el mimetype declarado son image/*.
export const validateImageMagicBytes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.file)
    return ErrorResponse.INVALID_FIELD(res, "image", "File is required");
  try {
    const type = await fromBuffer(req.file.buffer);
    if (!type || !ALLOWED_MIMES.has(type.mime)) {
      return ErrorResponse.INVALID_FIELD(
        res,
        "image",
        "File content is not a valid image"
      );
    }
    // Adjuntar metadata al req para el siguiente middleware/controller
    (req as any).detectedFileType = type;
    next();
  } catch (ex) {
    console.log("❌ Error in validateImageMagicBytes:", ex);
    return ErrorResponse.UNEXPECTED_ERROR(res);
  }
};
