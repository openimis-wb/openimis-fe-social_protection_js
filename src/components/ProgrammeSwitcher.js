import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Button, Divider, ListItemIcon, Menu, MenuItem, Typography,
} from '@material-ui/core';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import CheckIcon from '@material-ui/icons/Check';
import { useModulesManager, useTranslations } from '@openimis/fe-core';
import { fetchMyProgrammes, setMyDefaultProgramme } from '../actions';
import {
  ALL_PROGRAMMES,
  getProgrammeChoice,
  setProgrammeChoice,
} from '../util/programme-context';
import { isFailedOutcome, programmeFailureAlert } from '../util/programme-errors';

const sameUuid = (a, b) => !!a && !!b && String(a).toLowerCase() === String(b).toLowerCase();

// Contributed to core.AppBar: shows the active programme and lets the user switch.
function ProgrammeSwitcher() {
  const dispatch = useDispatch();
  const modulesManager = useModulesManager();
  const { formatMessage, formatMessageWithValues } = useTranslations('socialProtection', modulesManager);
  const memberships = useSelector((state) => state.socialProtection?.myProgrammes);
  const [anchorEl, setAnchorEl] = useState(null);

  if (!memberships?.length) return null;

  if (memberships.length === 1) {
    return (
      <Typography color="inherit" variant="body2" noWrap>
        {memberships[0].programme.name}
      </Typography>
    );
  }

  const choice = getProgrammeChoice();
  const current = memberships.find((m) => sameUuid(m.programme.uuid, choice));
  const close = () => setAnchorEl(null);

  const choose = (value) => {
    close();
    if (value === getProgrammeChoice()) return;
    if (setProgrammeChoice(value)) {
      window.location.reload();
    }
  };

  const makeDefault = async () => {
    close();
    const outcome = await dispatch(setMyDefaultProgramme(
      current.programme.uuid,
      formatMessageWithValues('programme.setDefault.mutationLabel', { name: current.programme.name }),
    ));
    if (isFailedOutcome(outcome)) {
      dispatch(programmeFailureAlert(formatMessage, outcome));
    } else {
      dispatch(fetchMyProgrammes());
    }
  };

  return (
    <>
      <Button
        color="inherit"
        onClick={(event) => setAnchorEl(event.currentTarget)}
        endIcon={<ArrowDropDownIcon />}
        aria-haspopup="true"
      >
        {current ? current.programme.name : formatMessage('programme.switcher.all')}
      </Button>
      <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={close}>
        {memberships.map((membership) => (
          <MenuItem
            key={membership.programme.uuid}
            selected={membership === current}
            onClick={() => choose(membership.programme.uuid)}
          >
            <ListItemIcon>
              {membership === current ? <CheckIcon fontSize="small" /> : null}
            </ListItemIcon>
            {membership.programme.name}
            {membership.isDefault && ` (${formatMessage('programme.switcher.default')})`}
          </MenuItem>
        ))}
        <Divider />
        <MenuItem selected={!current} onClick={() => choose(ALL_PROGRAMMES)}>
          <ListItemIcon>
            {!current ? <CheckIcon fontSize="small" /> : null}
          </ListItemIcon>
          {formatMessage('programme.switcher.all')}
        </MenuItem>
        {current && !current.isDefault && (
          <MenuItem onClick={makeDefault}>
            {formatMessage('programme.switcher.makeDefault')}
          </MenuItem>
        )}
      </Menu>
    </>
  );
}

export default ProgrammeSwitcher;
