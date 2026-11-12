import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { injectIntl } from 'react-intl';
import {
  Divider, Grid, IconButton, Paper, Tooltip, Typography, Button,
} from '@material-ui/core';
import { withTheme, withStyles } from '@material-ui/core/styles';
import DeleteIcon from '@material-ui/icons/Delete';
import {
  PublishedComponent,
  Table,
  decodeId,
  formatMessage,
  formatMessageWithValues,
} from '@openimis/fe-core';
import {
  DEFAULT_PAGE_SIZE,
  RIGHT_PROGRAMME_UPDATE,
  ROWS_PER_PAGE_OPTIONS,
} from '../constants';
import {
  addProgrammeMembers,
  fetchProgrammeMembers,
  removeProgrammeMembers,
} from '../actions';
import { isFailedOutcome, programmeFailureAlert } from '../util/programme-errors';

const styles = (theme) => ({
  paper: theme.paper.paper,
  tableTitle: theme.table.title,
  item: theme.paper.item,
});

const memberName = (member) => [member.lastName, member.otherNames].filter(Boolean).join(' ');

// Members of the programme being edited, with removal and addition through the user picker.
function ProgrammeMembersPanel({
  intl, classes, edited, rights,
}) {
  const dispatch = useDispatch();
  const members = useSelector((state) => state.socialProtection.programmeMembers);
  const totalCount = useSelector((state) => state.socialProtection.programmeMembersTotalCount);
  const fetching = useSelector((state) => state.socialProtection.fetchingProgrammeMembers);
  const error = useSelector((state) => state.socialProtection.errorProgrammeMembers);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [usersToAdd, setUsersToAdd] = useState([]);

  const programmeId = edited?.id;
  const canUpdate = rights.includes(RIGHT_PROGRAMME_UPDATE) && !edited?.isDeleted;
  const translate = (id) => formatMessage(intl, 'socialProtection', id);

  const load = (nextPage = page, nextPageSize = pageSize) => dispatch(fetchProgrammeMembers(
    programmeId,
    [`first: ${nextPageSize}`, `offset: ${nextPage * nextPageSize}`],
  ));

  useEffect(() => {
    if (programmeId) load();
  }, [programmeId]);

  const apply = async (action, userIds, labelId) => {
    const outcome = await dispatch(action(
      programmeId,
      userIds,
      formatMessageWithValues(intl, 'socialProtection', labelId, { name: edited?.name }),
    ));
    if (isFailedOutcome(outcome)) {
      dispatch(programmeFailureAlert(translate, outcome));
      return false;
    }
    load();
    return true;
  };

  const onAdd = async () => {
    const userIds = usersToAdd.map((user) => decodeId(user.id));
    if (await apply(addProgrammeMembers, userIds, 'programme.members.add.mutationLabel')) {
      setUsersToAdd([]);
    }
  };

  const onRemove = (member) => apply(
    removeProgrammeMembers,
    [member.userId],
    'programme.members.remove.mutationLabel',
  );

  const headers = ['programme.members.username', 'programme.members.name', 'programme.members.default'];
  if (canUpdate) headers.push('emptyLabel');

  const itemFormatters = [
    (member) => member.username,
    (member) => memberName(member),
    (member) => (member.isDefault ? translate('programme.members.isDefault') : ''),
  ];
  if (canUpdate) {
    itemFormatters.push((member) => (
      <Tooltip title={translate('programme.members.removeTooltip')}>
        <IconButton onClick={() => onRemove(member)}>
          <DeleteIcon />
        </IconButton>
      </Tooltip>
    ));
  }

  if (!programmeId) return null;

  return (
    <Paper className={classes.paper}>
      <Grid container alignItems="center" className={classes.tableTitle}>
        <Grid item xs={12}>
          <Typography>
            {formatMessageWithValues(intl, 'socialProtection', 'programme.members.title', {
              count: totalCount ?? 0,
            })}
          </Typography>
        </Grid>
      </Grid>
      <Divider />
      {canUpdate && (
        <Grid container alignItems="flex-end" className={classes.item}>
          <Grid item xs={6} className={classes.item}>
            <PublishedComponent
              pubRef="admin.UserPicker"
              module="socialProtection"
              multiple
              filterSelectedOptions
              value={usersToAdd}
              onChange={(users) => setUsersToAdd(users || [])}
            />
          </Grid>
          <Grid item xs={3} className={classes.item}>
            <Button
              variant="contained"
              color="primary"
              disabled={!usersToAdd.length}
              onClick={onAdd}
            >
              {translate('programme.members.addButton')}
            </Button>
          </Grid>
        </Grid>
      )}
      <Table
        module="socialProtection"
        headers={headers}
        itemFormatters={itemFormatters}
        items={members}
        fetching={fetching}
        error={error}
        withPagination
        page={page}
        pageSize={pageSize}
        count={totalCount ?? 0}
        rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
        onChangePage={(_, nextPage) => {
          setPage(nextPage);
          load(nextPage, pageSize);
        }}
        onChangeRowsPerPage={(nextPageSize) => {
          setPage(0);
          setPageSize(nextPageSize);
          load(0, nextPageSize);
        }}
      />
    </Paper>
  );
}

export default injectIntl(withTheme(withStyles(styles)(ProgrammeMembersPanel)));
