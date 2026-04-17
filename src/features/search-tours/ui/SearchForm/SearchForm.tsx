import { useMemo, useRef, useState, type FormEvent } from 'react';

import { useCountriesQuery, type Country } from '@entities/country/model';
import { useGeoSearchQuery, type GeoOption } from '@entities/geo/model';
import { Button, Card, Combobox, type ComboboxOption } from '@shared/ui';

import styles from './SearchForm.module.scss';

type SearchOptionsMode = 'countries' | 'search';
type SearchFormOptionKind = 'country' | 'city' | 'hotel';

export interface SearchFormSubmitValue {
  kind: SearchFormOptionKind;
  label: string;
  value: string;
  countryId?: string;
  cityId?: number;
  hotelId?: number;
}

interface SearchFormOption extends ComboboxOption {
  kind: SearchFormOptionKind;
  label: string;
  value: string;
  countryId?: string;
  cityId?: number;
  hotelId?: number;
}

export interface SearchFormProps {
  className?: string;
  onSubmit?: (value: SearchFormSubmitValue) => void;
}

function mapCountryOption(country: Country): SearchFormOption {
  return {
    id: `country-${country.id}`,
    kind: 'country',
    label: country.name,
    value: country.name,
    countryId: country.id,
    imageAlt: `${country.name} flag`,
    imageSrc: country.flagUrl
  };
}

function mapGeoOption(option: GeoOption): SearchFormOption {
  switch (option.kind) {
    case 'country':
      return {
        id: option.id,
        kind: option.kind,
        label: option.label,
        value: option.name,
        countryId: option.countryId,
        imageAlt: `${option.name} flag`,
        imageSrc: option.flagUrl
      };

    case 'city':
      return {
        id: option.id,
        kind: option.kind,
        label: option.label,
        value: option.name,
        cityId: option.cityId,
        description: option.description,
        iconName: option.icon
      };

    case 'hotel':
      return {
        id: option.id,
        kind: option.kind,
        label: option.label,
        value: option.name,
        countryId: option.countryId,
        cityId: option.cityId,
        hotelId: option.hotelId,
        description: option.description,
        iconName: option.icon
      };
  }
}

function getOpenMode(
  value: string,
  selectedOption: SearchFormOption | null
): SearchOptionsMode {
  if (selectedOption?.kind === 'country') {
    return 'countries';
  }

  return value.trim().length > 0 ? 'search' : 'countries';
}

export function SearchForm({ className, onSubmit }: SearchFormProps) {
  const [value, setValue] = useState('');
  const [selectedOption, setSelectedOption] = useState<SearchFormOption | null>(null);
  const [optionsMode, setOptionsMode] = useState<SearchOptionsMode>('countries');
  const selectedOptionRef = useRef<SearchFormOption | null>(null);

  const countriesQuery = useCountriesQuery();
  const geoSearchQuery = useGeoSearchQuery(value, {
    enabled: optionsMode === 'search' && value.trim().length > 0
  });

  const countryOptions = useMemo<SearchFormOption[]>(
    () => (countriesQuery.data ?? []).map(mapCountryOption),
    [countriesQuery.data]
  );
  const geoOptions = useMemo<SearchFormOption[]>(
    () => (geoSearchQuery.data ?? []).map(mapGeoOption),
    [geoSearchQuery.data]
  );


  const options: SearchFormOption[] =
    optionsMode === 'countries' ? countryOptions : geoOptions;


  const handleValueChange = (nextValue: string) => {
    setValue(nextValue);

    if (selectedOption && nextValue !== selectedOption.value) {
      setSelectedOption(null);
      selectedOptionRef.current = null;
    }

    setOptionsMode(nextValue.trim().length > 0 ? 'search' : 'countries');
  };

  const handleSelect = (option: SearchFormOption) => {
    setSelectedOption(option);
    selectedOptionRef.current = option;
    setValue(option.value);
    setOptionsMode(option.kind === 'country' ? 'countries' : 'search');
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const currentSelectedOption = selectedOptionRef.current;

    if (!currentSelectedOption) {
      return;
    }

    const submitValue: SearchFormSubmitValue = {
      kind: currentSelectedOption.kind,
      label: currentSelectedOption.label,
      value: currentSelectedOption.value,
      countryId: currentSelectedOption.countryId,
      cityId: currentSelectedOption.cityId,
      hotelId: currentSelectedOption.hotelId
    };

    onSubmit?.(submitValue);
  };

  const classes = [styles.formCard, className].filter(Boolean).join(' ');

  return (
    <Card className={classes}>
      <div className={styles.header}>
        <h1 className={styles.title}>Форма пошуку турів</h1>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <Combobox<SearchFormOption>
            autoComplete="off"
            id="destination-search"
            onClick={() => setOptionsMode(getOpenMode(value, selectedOption))}
            onFocus={() => setOptionsMode(getOpenMode(value, selectedOption))}
            onSelect={handleSelect}
            onValueChange={handleValueChange}
            options={options}
            placeholder="Choose a country, city, or hotel"
            selectedOption={selectedOption}
            submitOnEnterSelection
            value={value}
          />
        </div>

        <Button className={styles.submitButton} disabled={!selectedOption} type="submit">
          Знайти
        </Button>
      </form>
    </Card>
  );
}
