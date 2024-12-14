import { ParsedUrlQuery } from 'querystring';
import { VALID_USERNAME_CHARACTERS, MIN_USERNAME_LENGTH, MAX_USERNAME_LENGTH } from '../consts';

/**
 * Retorna um nome de usuário a partir dos valores da query, caso
 * não esteja definido retorna um nome de usuário aleatório.
 * @param queryValues 
 * @returns {string} Nome de usuário.
 */
export function getUsername(queryValues: ParsedUrlQuery): string {
  if (queryValues.username !== 'null') {
    return queryValues.username as string;
  } else {
    return _generateUsername();
  }
}

/**
 * Gera um nome de usuário aleatório.
 *
 * @returns {string} O nome de usuário gerado.
 */
function _generateUsername(): string {
  const length = Math.floor(
    Math.random() * (MAX_USERNAME_LENGTH - MIN_USERNAME_LENGTH + 1)
  ) + MIN_USERNAME_LENGTH;

  let username = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * VALID_USERNAME_CHARACTERS.length);
    username += VALID_USERNAME_CHARACTERS[randomIndex];
  }

  return username;
}