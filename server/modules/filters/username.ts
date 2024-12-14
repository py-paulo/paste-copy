import {
  MinLengthError,
  MaxLengthError,
  InvalidCharacterError,
} from "../errors";
import {
  MIN_USERNAME_LENGTH,
  MAX_USERNAME_LENGTH,
  VALID_USERNAME_CHARACTERS,
} from "../consts";

export function validateUsername(username: string): void {
  if (username.length < MIN_USERNAME_LENGTH) {
    throw new MinLengthError(MIN_USERNAME_LENGTH);
  }

  if (username.length > MAX_USERNAME_LENGTH) {
    throw new MaxLengthError(MAX_USERNAME_LENGTH);
  }

  for (const char of username) {
    if (!VALID_USERNAME_CHARACTERS.includes(char)) {
      throw new InvalidCharacterError(`Username contains invalid character: ${char}`);
    }
  }
}