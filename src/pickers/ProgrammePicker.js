import React, { useState } from 'react';
import { TextField } from '@material-ui/core';

import {
  Autocomplete, useModulesManager, useTranslations, useGraphqlQuery,
} from '@openimis/fe-core';

function ProgrammePicker(props) {
  const {
    multiple,
    required,
    label,
    nullLabel,
    withLabel = false,
    placeholder,
    withPlaceholder = false,
    readOnly,
    value,
    onChange,
    filter,
    filterSelectedOptions,
  } = props;

  const modulesManager = useModulesManager();
  const [filters, setFilters] = useState({ isDeleted: false });
  const { formatMessage } = useTranslations('socialProtection', modulesManager);

  const { isLoading, data, error } = useGraphqlQuery(
    `
    query ProgrammePicker($name: String, $isDeleted: Boolean) {
      programme(name_Icontains: $name, isDeleted: $isDeleted, orderBy: ["code"]) {
        edges {
          node {
            id
            uuid
            code
            name
          }
        }
      }
    }
  `,
    filters,
    { skip: true },
  );

  const programmes = data?.programme?.edges?.map((edge) => edge.node) ?? [];

  return (
    <Autocomplete
      multiple={multiple}
      error={error}
      readOnly={readOnly}
      options={programmes}
      isLoading={isLoading}
      value={value}
      getOptionLabel={(option) => `${option.code} ${option.name}`}
      onChange={(selected) => onChange(selected, selected ? `${selected.code} ${selected.name}` : null)}
      filterOptions={filter}
      filterSelectedOptions={filterSelectedOptions}
      onInputChange={(name) => setFilters({ name, isDeleted: false })}
      renderInput={(inputProps) => (
        <TextField
          /* eslint-disable-next-line react/jsx-props-no-spreading */
          {...inputProps}
          required={required}
          label={(withLabel && (label || nullLabel)) || formatMessage('ProgrammePicker.label')}
          placeholder={(withPlaceholder && placeholder) || formatMessage('ProgrammePicker.placeholder')}
        />
      )}
    />
  );
}

export default ProgrammePicker;
