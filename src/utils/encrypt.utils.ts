import bcrypt from "bcryptjs";

export default class EncryptUtils{
  
  /** Encrypt the string provider */
  static encryptString = async (string: string) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(string, salt)
  }

  /** Compare the string encrypt with the string vanilla */
  static compareStringEncrypt = async (encryptString: string, vanillaString: string) => {
    return await bcrypt.compare(encryptString, vanillaString)
  }
}


