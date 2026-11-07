import { Deck, Vocabulary } from '../types';

// Data dikosongkan sesuai permintaan pengguna (Fresh & Clean State)
export const INITIAL_DECKS: Omit<Deck, 'id'>[] = [];

export const INITIAL_VOCABULARY: Omit<Vocabulary, 'id'>[] = [];
