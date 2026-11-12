import React from 'react';
import { Grid } from '@material-ui/core';
import {
  withModulesManager,
  FormPanel,
  TextInput,
  TextAreaInput,
} from '@openimis/fe-core';
import { injectIntl } from 'react-intl';
import { withTheme, withStyles } from '@material-ui/core/styles';
import {
  DESCRIPTION_MAX_LENGTH,
  PROGRAMME_MAX_CODE_LENGTH,
  PROGRAMME_MAX_NAME_LENGTH,
} from '../constants';
import { defaultHeadPanelStyles } from '../util/styles';

class ProgrammeHeadPanel extends FormPanel {
  render() {
    const { edited, classes } = this.props;
    const readOnly = !!edited?.isDeleted;
    const programme = { ...edited };

    return (
      <Grid container className={classes.item}>
        <Grid item xs={3} className={classes.item}>
          <TextInput
            module="socialProtection"
            label="programme.code"
            required
            readOnly={readOnly}
            onChange={(v) => this.updateAttribute('code', v)}
            value={programme.code ?? ''}
            inputProps={{ maxLength: PROGRAMME_MAX_CODE_LENGTH }}
          />
        </Grid>
        <Grid item xs={3} className={classes.item}>
          <TextInput
            module="socialProtection"
            label="programme.name"
            required
            readOnly={readOnly}
            onChange={(v) => this.updateAttribute('name', v)}
            value={programme.name ?? ''}
            inputProps={{ maxLength: PROGRAMME_MAX_NAME_LENGTH }}
          />
        </Grid>
        <Grid item xs={6} className={classes.item}>
          <TextAreaInput
            module="socialProtection"
            label="programme.description"
            readOnly={readOnly}
            inputProps={{ maxLength: DESCRIPTION_MAX_LENGTH }}
            value={programme.description ?? ''}
            onChange={(v) => this.updateAttribute('description', v)}
          />
        </Grid>
      </Grid>
    );
  }
}

export default withModulesManager(injectIntl(withTheme(withStyles(defaultHeadPanelStyles)(ProgrammeHeadPanel))));
