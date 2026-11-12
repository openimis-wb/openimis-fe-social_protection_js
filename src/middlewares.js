import { fetchProjectBeneficiaries, fetchProjectGroupBeneficiaries } from './actions';
import { ACTION_TYPE } from './reducer';
import { REQUEST } from './util/action-type';
import { ALL_PROGRAMMES, getActiveProgramme, setProgrammeChoice } from './util/programme-context';
import { INVALID_PROGRAMME_HEADER_ERROR } from './util/programme-errors';

function decodeCursorOffset(cursor) {
  if (!cursor) return null;

  const decoded = atob(cursor);
  const parts = decoded.split(':');
  const offset = parseInt(parts[1], 10);
  return Number.isNaN(offset) ? null : offset;
}

const projectBeneficiariesMiddleware = (store) => (next) => (action) => {
  const isProjectBeneficiaryRequest = (
    action.type === REQUEST(ACTION_TYPE.SEARCH_PROJECT_BENEFICIARIES)
    || action.type === REQUEST(ACTION_TYPE.SEARCH_PROJECT_GROUP_BENEFICIARIES)
  );

  const fetchAllForProjectId = action.meta?.fetchAllForProjectId;

  // Handle both initial search and batch continuation
  if (isProjectBeneficiaryRequest && fetchAllForProjectId) {
    const isGroup = action.type.includes('GROUP');

    const orderBy = isGroup
      ? 'orderBy: ["group__code"]'
      : 'orderBy: ["individual__last_name", "individual__first_name"]';

    const fetchAllForProjectId = action.meta?.fetchAllForProjectId;
    const batchSize = 100;
    const offset = action?.meta?.offset || 0;

    const modulesManager = action.meta?.modulesManager;

    const fetchFunction = isGroup ? fetchProjectGroupBeneficiaries : fetchProjectBeneficiaries;
    const payloadField = isGroup ? 'groupBeneficiary' : 'beneficiary';

    const params = [
      `enrolledInProject: "${fetchAllForProjectId}"`,
      'isDeleted: false',
      orderBy,
      `first: ${batchSize}`,
      `offset: ${offset}`,
    ];

    const isBatch = offset > 0;

    return store.dispatch(fetchFunction(modulesManager, params, { isBatch }))
      .then((response) => {
        const pageInfo = response?.payload?.data?.[payloadField]?.pageInfo;

        if (pageInfo?.hasNextPage) {
          const nextOffset = decodeCursorOffset(pageInfo?.endCursor) + 1;

          store.dispatch({
            type: action.type,
            meta: {
              ...action.meta,
              isBatch,
              offset: nextOffset,
            },
          });
        }
      });
  }

  return next(action);
};

export default projectBeneficiariesMiddleware;

const responseErrors = (action) => {
  const payload = action?.payload;
  const errors = payload?.errors ?? payload?.response?.errors;
  return Array.isArray(errors) ? errors : [];
};

// A request rejected because the active programme is not valid for the user (the error may come
// from any query, nested types included): the choice is reset to "all my programmes", which sends
// no header, and the page reloads so that every list is read again. Nothing happens when no
// programme is active, so the reload cannot repeat.
export const invalidProgrammeHeaderMiddleware = () => (next) => (action) => {
  const result = next(action);
  if (
    getActiveProgramme()
    && responseErrors(action).some((e) => e?.message?.includes(INVALID_PROGRAMME_HEADER_ERROR))
  ) {
    setProgrammeChoice(ALL_PROGRAMMES);
    window.location.reload();
  }
  return result;
};
