export class MinLengthError extends Error {
  constructor(minLength: number) {
    super(`The length "${minLength}" of the string is less than the minimum length.`);
  }
}

export class MaxLengthError extends Error {
  constructor(maxLength: number) {
    super(`The length "${maxLength}" of the string is greater than the maximum length.`);
  }
}

export class InvalidCharacterError extends Error {
  constructor(character: string) {
    super(`The character "${character}" is invalid for username.`);
  }
}