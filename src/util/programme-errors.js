import { coreAlert } from '@openimis/fe-core';

// Backend error keys of the programme feature, mapped to translation ids of the module.
export const PROGRAMME_ERROR_KEYS = {
  'social_protection.programme.invalid_header': 'programme.error.invalidHeader',
  'social_protection.programme.not_a_member': 'programme.error.notAMember',
  'social_protection.programme.not_found': 'programme.error.notFound',
  'social_protection.programme.benefit_plan_out_of_scope': 'programme.error.benefitPlanOutOfScope',
  'social_protection.programme.no_users': 'programme.error.noUsers',
  'social_protection.programme.unknown_users': 'programme.error.unknownUsers',
  'social_protection.validation.programme.code_exists': 'programme.error.codeExists',
  'social_protection.validation.programme.has_benefit_plans': 'programme.error.hasBenefitPlans',
};

export const INVALID_PROGRAMME_HEADER_ERROR = 'social_protection.programme.invalid_header';

// Translation id for the first known error key found in `text`, null when none matches.
export const programmeErrorTranslationId = (text) => {
  if (!text) return null;
  const haystack = String(text);
  const key = Object.keys(PROGRAMME_ERROR_KEYS).find((k) => haystack.includes(k));
  return key ? PROGRAMME_ERROR_KEYS[key] : null;
};

// A mutation log with status 1 is a failed mutation.
export const isFailedOutcome = (outcome) => outcome?.status === 1;

// Alert action describing a failed mutation; `translate` maps a module translation id to text.
export const programmeFailureAlert = (translate, outcome) => {
  const translationId = programmeErrorTranslationId(outcome?.error);
  return coreAlert(
    translate('programme.error.title'),
    translate(translationId || 'programme.error.generic'),
    outcome?.error || undefined,
  );
};
