import { registerRequestHeaderProvider } from '@openimis/fe-core';

export const PROGRAMME_HEADER = 'X-Programme';
export const PROGRAMME_STORAGE_KEY = 'socialProtection.activeProgramme';
// Stored choice meaning "every programme of the user": no header is sent.
export const ALL_PROGRAMMES = 'all';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const normalize = (value) => {
  if (value === ALL_PROGRAMMES) return ALL_PROGRAMMES;
  return typeof value === 'string' && UUID_PATTERN.test(value) ? value.toLowerCase() : null;
};

const readStored = () => {
  try {
    return normalize(window.localStorage.getItem(PROGRAMME_STORAGE_KEY));
  } catch (e) {
    return null;
  }
};

const writeStored = (value) => {
  try {
    if (value) {
      window.localStorage.setItem(PROGRAMME_STORAGE_KEY, value);
    } else {
      window.localStorage.removeItem(PROGRAMME_STORAGE_KEY);
    }
    return readStored() === value;
  } catch (e) {
    return false;
  }
};

const choiceAtLoad = readStored();
let choice = choiceAtLoad;

// Choice found in storage when this module was loaded: a programme uuid, ALL_PROGRAMMES or null (never chosen).
export const getProgrammeChoiceAtLoad = () => choiceAtLoad;

export const getProgrammeChoice = () => choice;

// Uuid sent in the X-Programme header, null when no programme is selected.
export const getActiveProgramme = () => (choice && choice !== ALL_PROGRAMMES ? choice : null);

// Sets the choice (uuid, ALL_PROGRAMMES or null). Returns whether it was persisted;
// without working storage the choice only holds for the current page load.
export const setProgrammeChoice = (value) => {
  choice = normalize(value);
  return writeStored(choice);
};

// Picks the programme to work in from the user's memberships: a still valid stored choice,
// else the membership flagged default, else the only membership, else none.
export const resolveProgrammeChoice = (memberships, stored) => {
  if (stored === ALL_PROGRAMMES) return ALL_PROGRAMMES;
  const uuids = (memberships || []).map((m) => normalize(m?.programme?.uuid)).filter(Boolean);
  if (stored && uuids.includes(stored)) return stored;
  const preferred = (memberships || []).find((m) => m?.isDefault);
  if (preferred && normalize(preferred.programme?.uuid)) return normalize(preferred.programme.uuid);
  if (uuids.length === 1) return uuids[0];
  return null;
};

if (typeof registerRequestHeaderProvider === 'function') {
  registerRequestHeaderProvider(() => {
    const active = getActiveProgramme();
    return active ? { [PROGRAMME_HEADER]: active } : {};
  });
}
