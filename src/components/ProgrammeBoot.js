import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchMyProgrammes } from '../actions';
import {
  getProgrammeChoiceAtLoad,
  resolveProgrammeChoice,
  setProgrammeChoice,
} from '../util/programme-context';

// Contributed to core.Boot: loads the user's programmes and settles the active programme.
// The page reloads once when the settled choice differs from the one stored at load,
// so that every request after the reload carries the right X-Programme header.
function ProgrammeBoot() {
  const dispatch = useDispatch();

  useEffect(() => {
    let cancelled = false;
    dispatch(fetchMyProgrammes()).then((response) => {
      const memberships = response?.payload?.data?.myProgrammes;
      if (cancelled || !Array.isArray(memberships)) return;
      const stored = getProgrammeChoiceAtLoad();
      const settled = resolveProgrammeChoice(memberships, stored);
      if (settled === stored) return;
      if (setProgrammeChoice(settled)) {
        window.location.reload();
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}

export default ProgrammeBoot;
