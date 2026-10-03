export interface Country {
  /** ISO 3166-1 alpha-2 code, also the flag file name. */
  code: string;
  name: string;
  capital: string;
  region: string;
  subregion: string;
  /** 1 = well known, 3 = obscure. */
  tier: 1 | 2 | 3;
  /** False when the capital is disputed or gives the answer away. */
  capitalQuestions: boolean;
}
