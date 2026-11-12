import React from 'react';
import {
  Helmet, withModulesManager, formatMessage, withTooltip, historyPush,
} from '@openimis/fe-core';
import { injectIntl } from 'react-intl';
import { withTheme, withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { Fab } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import {
  RIGHT_PROGRAMME_CREATE,
  RIGHT_PROGRAMME_SEARCH,
  SOCIAL_PROTECTION_ROUTE_PROGRAMME,
} from '../constants';
import ProgrammeSearcher from '../components/ProgrammeSearcher';

const styles = (theme) => ({
  page: theme.page,
  fab: theme.fab,
});

function ProgrammesPage(props) {
  const {
    intl, classes, rights, modulesManager, history,
  } = props;

  const onAdd = () => historyPush(modulesManager, history, SOCIAL_PROTECTION_ROUTE_PROGRAMME);

  return (
    rights.includes(RIGHT_PROGRAMME_SEARCH) && (
    <div className={classes.page}>
      <Helmet title={formatMessage(intl, 'socialProtection', 'programme.helmet')} />
      <ProgrammeSearcher rights={rights} />
      {rights.includes(RIGHT_PROGRAMME_CREATE)
        && withTooltip(
          <div className={classes.fab}>
            <Fab color="primary" onClick={onAdd}>
              <AddIcon />
            </Fab>
          </div>,
          formatMessage(intl, 'socialProtection', 'createButton.tooltip'),
        )}
    </div>
    )
  );
}

const mapStateToProps = (state) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
});

export default withModulesManager(injectIntl(withTheme(withStyles(styles)(
  connect(mapStateToProps)(ProgrammesPage),
))));
