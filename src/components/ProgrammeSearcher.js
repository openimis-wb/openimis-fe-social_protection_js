import React, { useEffect, useState } from 'react';
import { injectIntl } from 'react-intl';
import {
  clearConfirm,
  coreConfirm,
  formatMessage,
  formatMessageWithValues,
  historyPush,
  Searcher,
  withHistory,
  withModulesManager,
} from '@openimis/fe-core';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { IconButton, Tooltip } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import {
  DEFAULT_PAGE_SIZE,
  RIGHT_PROGRAMME_DELETE,
  RIGHT_PROGRAMME_UPDATE,
  ROWS_PER_PAGE_OPTIONS,
  SOCIAL_PROTECTION_ROUTE_PROGRAMME,
} from '../constants';
import { deleteProgramme, fetchProgrammes } from '../actions';
import { isFailedOutcome, programmeFailureAlert } from '../util/programme-errors';
import ProgrammeFilter from './ProgrammeFilter';

function ProgrammeSearcher({
  intl,
  modulesManager,
  history,
  rights,
  programmeFailureAlert,
  coreConfirm,
  clearConfirm,
  confirmed,
  fetchProgrammes,
  deleteProgramme,
  fetchingProgrammes,
  errorProgrammes,
  programmes,
  programmesPageInfo,
  programmesTotalCount,
}) {
  const [programmeToDelete, setProgrammeToDelete] = useState(null);
  const [deletedProgrammeUuids, setDeletedProgrammeUuids] = useState([]);

  const translate = (id) => formatMessage(intl, 'socialProtection', id);

  useEffect(() => {
    if (!programmeToDelete) return;
    coreConfirm(
      formatMessageWithValues(intl, 'socialProtection', 'programme.delete.confirm.title', {
        code: programmeToDelete.code,
        name: programmeToDelete.name,
      }),
      translate('programme.delete.confirm.message'),
    );
  }, [programmeToDelete]);

  useEffect(() => {
    if (programmeToDelete && confirmed) {
      const programme = programmeToDelete;
      setDeletedProgrammeUuids((uuids) => [...uuids, programme.id]);
      deleteProgramme(
        programme,
        formatMessageWithValues(intl, 'socialProtection', 'programme.delete.mutationLabel', {
          name: programme.name,
        }),
      ).then((outcome) => {
        if (isFailedOutcome(outcome)) {
          setDeletedProgrammeUuids((uuids) => uuids.filter((uuid) => uuid !== programme.id));
          programmeFailureAlert(translate, outcome);
        }
      });
    }
    if (programmeToDelete && confirmed !== null) {
      setProgrammeToDelete(null);
    }
    return () => confirmed && clearConfirm(false);
  }, [confirmed]);

  const headers = () => {
    const result = ['programme.code', 'programme.name', 'programme.description'];
    if (rights.includes(RIGHT_PROGRAMME_UPDATE)) result.push('emptyLabel');
    if (rights.includes(RIGHT_PROGRAMME_DELETE)) result.push('emptyLabel');
    return result;
  };

  const programmeUpdatePageUrl = (programme) => (
    `${modulesManager.getRef(SOCIAL_PROTECTION_ROUTE_PROGRAMME)}/${programme?.id}`
  );

  const onDoubleClick = (programme, newTab = false) => rights.includes(RIGHT_PROGRAMME_UPDATE)
    && !deletedProgrammeUuids.includes(programme.id)
    && historyPush(modulesManager, history, SOCIAL_PROTECTION_ROUTE_PROGRAMME, [programme?.id], newTab);

  const itemFormatters = () => {
    const formatters = [
      (programme) => programme.code,
      (programme) => programme.name,
      (programme) => programme.description,
    ];
    if (rights.includes(RIGHT_PROGRAMME_UPDATE)) {
      formatters.push((programme) => (
        <Tooltip title={translate('programme.editButtonTooltip')}>
          <IconButton
            href={programmeUpdatePageUrl(programme)}
            onClick={(e) => e.stopPropagation() && onDoubleClick(programme)}
            disabled={deletedProgrammeUuids.includes(programme.id)}
          >
            <EditIcon />
          </IconButton>
        </Tooltip>
      ));
    }
    if (rights.includes(RIGHT_PROGRAMME_DELETE)) {
      formatters.push((programme) => !programme.isDeleted && (
        <Tooltip title={translate('programme.deleteButtonTooltip')}>
          <IconButton
            onClick={() => setProgrammeToDelete(programme)}
            disabled={deletedProgrammeUuids.includes(programme.id)}
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      ));
    }
    return formatters;
  };

  const isRowDisabled = (_, programme) => deletedProgrammeUuids.includes(programme.id);

  const defaultFilters = () => ({
    isDeleted: {
      value: false,
      filter: 'isDeleted: false',
    },
  });

  const programmeFilter = (props) => (
    <ProgrammeFilter
      intl={props.intl}
      classes={props.classes}
      filters={props.filters}
      onChangeFilters={props.onChangeFilters}
    />
  );

  return (
    <Searcher
      module="socialProtection"
      FilterPane={programmeFilter}
      fetch={fetchProgrammes}
      items={programmes.filter((programme) => !deletedProgrammeUuids.includes(programme.id))}
      itemsPageInfo={programmesPageInfo}
      fetchedItems={fetchingProgrammes}
      errorItems={errorProgrammes}
      tableTitle={formatMessageWithValues(intl, 'socialProtection', 'programme.searcherResultsTitle', {
        programmesTotalCount,
      })}
      headers={headers}
      itemFormatters={itemFormatters}
      sorts={() => [['code', true], ['name', true], null]}
      rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
      defaultPageSize={DEFAULT_PAGE_SIZE}
      defaultOrderBy="code"
      rowIdentifier={(programme) => programme.id}
      onDoubleClick={onDoubleClick}
      defaultFilters={defaultFilters()}
      rowDisabled={isRowDisabled}
      rowLocked={isRowDisabled}
      onFiltersApplied={() => setDeletedProgrammeUuids([])}
    />
  );
}

const mapStateToProps = (state) => ({
  fetchingProgrammes: state.socialProtection.fetchingProgrammes,
  errorProgrammes: state.socialProtection.errorProgrammes,
  programmes: state.socialProtection.programmes,
  programmesPageInfo: state.socialProtection.programmesPageInfo,
  programmesTotalCount: state.socialProtection.programmesTotalCount,
  confirmed: state.core.confirmed,
});

const mapDispatchToProps = (dispatch) => bindActionCreators(
  {
    fetchProgrammes,
    deleteProgramme,
    programmeFailureAlert,
    coreConfirm,
    clearConfirm,
  },
  dispatch,
);

export default withHistory(
  withModulesManager(injectIntl(connect(mapStateToProps, mapDispatchToProps)(ProgrammeSearcher))),
);
