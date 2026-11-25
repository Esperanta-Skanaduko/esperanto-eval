import { ACTIONS, ANIMATES, FOODS, READABLES, THINGS } from './vocabulary.mjs';

/**
 * Picks a sensible action with a subject and an object, so every generated
 * sentence is plausible ("the girl reads the book", never "the book reads the girl").
 *
 * @param rng - Seeded generator.
 * @returns The action, subject noun and object noun.
 */
export const pickSentenceParts = (rng) => {
  const action = rng.pick(ACTIONS);
  const pool = {
    any: [...ANIMATES, ...THINGS],
    animate: ANIMATES,
    food: FOODS,
    readable: READABLES,
    thing: THINGS,
  }[action.objects];
  const subject = rng.pick(ANIMATES);
  const object = rng.pick(pool.filter((noun) => noun.eo !== subject.eo));
  return { action, subject, object };
};
