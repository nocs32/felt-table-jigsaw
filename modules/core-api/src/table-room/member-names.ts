// Names the table hands out until people pick their own: "Teal Otter", "Amber Heron".
const adjectives = [
  'Teal', 'Amber', 'Coral', 'Misty', 'Sunny', 'Velvet', 'Copper', 'Mossy', 'Rosy', 'Silver',
  'Golden', 'Indigo', 'Olive', 'Plum', 'Sandy', 'Frosty', 'Breezy', 'Cosy', 'Lucky', 'Nimble',
] as const;

const animals = [
  'Otter', 'Fox', 'Badger', 'Heron', 'Lynx', 'Panda', 'Koala', 'Owl', 'Wren', 'Hare',
  'Seal', 'Moose', 'Gecko', 'Finch', 'Bison', 'Robin', 'Puffin', 'Marten', 'Beaver', 'Lemur',
] as const;

const attempts = 12;

const pick = <T>(items: readonly T[], random: () => number): T | undefined => items[Math.floor(random() * items.length)];

const randomName = (random: () => number): string => `${pick(adjectives, random) ?? 'Teal'} ${pick(animals, random) ?? 'Otter'}`;

// A random name nobody at the table has; after a few clashes a number makes it unique.
export const pickMemberName = (taken: ReadonlySet<string>, random: () => number): string => {
  for (let attempt = 0; attempt < attempts; attempt++) {
    const name = randomName(random);

    if (!taken.has(name)) return name;
  }

  const base = randomName(random);
  let suffix = 2;

  while (taken.has(`${base} ${suffix}`)) {
    suffix++;
  }

  return `${base} ${suffix}`;
};
