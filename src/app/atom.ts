import { atom } from 'jotai';

export const placeAtom = atom<string>('Kyiv');

export const loadingCityAtom = atom<boolean>(false);
