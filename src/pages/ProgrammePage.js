import React, { useEffect, useState } from 'react';
import {
  Form,
  withHistory,
  formatMessage,
  formatMessageWithValues,
  coreConfirm,
  clearConfirm,
  withModulesManager,
} from '@openimis/fe-core';
import { injectIntl } from 'react-intl';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import _ from 'lodash';
import { withTheme, withStyles } from '@material-ui/core/styles';
import DeleteIcon from '@material-ui/icons/Delete';
import { RIGHT_PROGRAMME_DELETE, RIGHT_PROGRAMME_UPDATE } from '../constants';
import {
  fetchProgramme, clearProgramme, createProgramme, updateProgramme, deleteProgramme,
} from '../actions';
import { isFailedOutcome, programmeFailureAlert } from '../util/programme-errors';
import ProgrammeHeadPanel from '../components/ProgrammeHeadPanel';
import ProgrammeMembersPanel from '../components/ProgrammeMembersPanel';

const styles = (theme) => ({
  page: theme.page,
  paper: theme.paper.classes,
});

function ProgrammePage({
  intl,
  classes,
  rights,
  history,
  programmeUuid,
  programme,
  fetchProgramme,
  clearProgramme,
  createProgramme,
  updateProgramme,
  deleteProgramme,
  programmeFailureAlert,
  coreConfirm,
  clearConfirm,
  confirmed,
  modulesManager,
}) {
  const [editedProgramme, setEditedProgramme] = useState({});
  const [confirmedAction, setConfirmedAction] = useState(() => null);
  const [reset, setReset] = useState(() => false);

  const translate = (id) => formatMessage(intl, 'socialProtection', id);

  useEffect(() => {
    if (programmeUuid) {
      fetchProgramme([`id: "${programmeUuid}"`]);
    }
  }, [programmeUuid]);

  useEffect(() => {
    if (confirmed && confirmedAction) confirmedAction();
    return () => confirmed && clearConfirm(null);
  }, [confirmed]);

  useEffect(() => {
    setEditedProgramme(programme);
    if (!programmeUuid && programme?.id) {
      const routeRef = modulesManager.getRef('socialProtection.route.programme');
      history.replace(`/${routeRef}/${programme.id}`);
      setReset(true);
    }
  }, [programme]);

  useEffect(() => () => clearProgramme(), []);

  const back = () => history.goBack();

  const titleParams = (value) => ({ code: value?.code, name: value?.name });

  const isMandatoryFieldsEmpty = () => !(editedProgramme?.code && editedProgramme?.name);

  const canSave = () => !isMandatoryFieldsEmpty()
    && !editedProgramme?.isDeleted
    && !_.isEqual(programme, editedProgramme);

  const handleSave = async () => {
    const params = titleParams(editedProgramme);
    const isUpdate = !!programme?.id;
    const outcome = await (isUpdate
      ? updateProgramme(
        editedProgramme,
        formatMessageWithValues(intl, 'socialProtection', 'programme.update.mutationLabel', params),
      )
      : createProgramme(
        editedProgramme,
        formatMessageWithValues(intl, 'socialProtection', 'programme.create.mutationLabel', params),
      ));
    if (isFailedOutcome(outcome)) {
      programmeFailureAlert(translate, outcome);
      return;
    }
    fetchProgramme(isUpdate ? [`id: "${programme.id}"`] : [`code: "${editedProgramme.code}"`]);
  };

  const openDeleteConfirmDialog = () => {
    setConfirmedAction(() => async () => {
      const outcome = await deleteProgramme(
        programme,
        formatMessageWithValues(intl, 'socialProtection', 'programme.delete.mutationLabel', {
          name: programme?.name,
        }),
      );
      if (isFailedOutcome(outcome)) {
        programmeFailureAlert(translate, outcome);
      } else {
        back();
      }
    });
    coreConfirm(
      formatMessageWithValues(intl, 'socialProtection', 'programme.delete.confirm.title', {
        code: programme?.code,
        name: programme?.name,
      }),
      translate('programme.delete.confirm.message'),
    );
  };

  const actions = [
    !!programme && !programme.isDeleted && rights.includes(RIGHT_PROGRAMME_DELETE) && {
      doIt: openDeleteConfirmDialog,
      icon: <DeleteIcon />,
      tooltip: translate('programme.deleteButtonTooltip'),
    },
  ];

  return (
    rights.includes(RIGHT_PROGRAMME_UPDATE) && (
    <div className={classes.page}>
      <Form
        module="socialProtection"
        className={classes}
        title="programme.pageTitle"
        titleParams={titleParams(programme)}
        openDirty
        programme={programme}
        edited={editedProgramme}
        onEditedChanged={setEditedProgramme}
        back={back}
        reset={reset}
        mandatoryFieldsEmpty={isMandatoryFieldsEmpty}
        canSave={canSave}
        save={handleSave}
        HeadPanel={ProgrammeHeadPanel}
        Panels={[ProgrammeMembersPanel]}
        rights={rights}
        actions={actions}
        setConfirmedAction={setConfirmedAction}
        saveTooltip={translate(`programme.saveButton.tooltip.${canSave() ? 'enabled' : 'disabled'}`)}
      />
    </div>
    )
  );
}

const mapStateToProps = (state, props) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
  programmeUuid: props.match.params.programme_uuid,
  confirmed: state.core.confirmed,
  programme: state.socialProtection.programme,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchProgramme,
  clearProgramme,
  createProgramme,
  updateProgramme,
  deleteProgramme,
  programmeFailureAlert,
  coreConfirm,
  clearConfirm,
}, dispatch);

export default withHistory(
  withModulesManager(injectIntl(withTheme(withStyles(styles)(
    connect(mapStateToProps, mapDispatchToProps)(ProgrammePage),
  )))),
);
