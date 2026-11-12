import React from 'react';
import { injectIntl } from 'react-intl';
import { TextInput } from '@openimis/fe-core';
import { Grid } from '@material-ui/core';
import { withTheme, withStyles } from '@material-ui/core/styles';
import _debounce from 'lodash/debounce';
import { CONTAINS_LOOKUP, DEFAULT_DEBOUNCE_TIME, EMPTY_STRING } from '../constants';
import { defaultFilterStyles } from '../util/styles';

function ProgrammeFilter({
  classes, filters, onChangeFilters,
}) {
  const debouncedOnChangeFilters = _debounce(onChangeFilters, DEFAULT_DEBOUNCE_TIME);

  const filterTextFieldValue = (filterName) => filters?.[filterName]?.value ?? EMPTY_STRING;

  const onChangeStringFilter = (filterName) => (value) => debouncedOnChangeFilters([
    {
      id: filterName,
      value,
      filter: `${filterName}_${CONTAINS_LOOKUP}: "${value}"`,
    },
  ]);

  return (
    <Grid container className={classes.form}>
      <Grid item xs={3} className={classes.item}>
        <TextInput
          module="socialProtection"
          label="programme.code"
          value={filterTextFieldValue('code')}
          onChange={onChangeStringFilter('code')}
        />
      </Grid>
      <Grid item xs={3} className={classes.item}>
        <TextInput
          module="socialProtection"
          label="programme.name"
          value={filterTextFieldValue('name')}
          onChange={onChangeStringFilter('name')}
        />
      </Grid>
    </Grid>
  );
}

export default injectIntl(withTheme(withStyles(defaultFilterStyles)(ProgrammeFilter)));
