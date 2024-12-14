import { getUsername } from '../../modules/utils/user';
import { MIN_USERNAME_LENGTH, MAX_USERNAME_LENGTH, VALID_USERNAME_CHARACTERS } from '../../modules/consts';
import { ParsedUrlQuery } from 'querystring';

describe('getUsername', () => {
  it('should return the username from query values if defined', () => {
    const queryValues: ParsedUrlQuery = { username: 'testuser' };
    const result = getUsername(queryValues);
    expect(result).toBe('testuser');
  });

  it('should return a random username if query username is null', () => {
    const queryValues: ParsedUrlQuery = { username: 'null' };
    const result = getUsername(queryValues);
    const validCharactersRegex = new RegExp(`^[${VALID_USERNAME_CHARACTERS}]+$`);
    expect(result).toMatch(validCharactersRegex);
  });

  it('should return a username with length between MIN_USERNAME_LENGTH and MAX_USERNAME_LENGTH', () => {
    const queryValues: ParsedUrlQuery = { username: 'null' };
    const result = getUsername(queryValues);
    expect(result.length).toBeGreaterThanOrEqual(MIN_USERNAME_LENGTH);
    expect(result.length).toBeLessThanOrEqual(MAX_USERNAME_LENGTH);
  });
});