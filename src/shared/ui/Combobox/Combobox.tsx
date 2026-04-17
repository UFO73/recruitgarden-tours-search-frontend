import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent as ReactMouseEvent
} from 'react';

import { Icon, type IconName } from '@shared/ui/Icon';
import { Input, type InputProps } from '@shared/ui/Input';
import { Popover } from '@shared/ui/Popover';

import styles from './Combobox.module.scss';

export interface ComboboxOption {
  id: string;
  label: string;
  description?: string;
  disabled?: boolean;
  iconName?: IconName;
}

export interface ComboboxProps extends Omit<
  InputProps,
  'className' | 'defaultValue' | 'onChange' | 'onSelect' | 'value'
> {
  className?: string;
  contentClassName?: string;
  emptyMessage?: string;
  inputClassName?: string;
  onSelect: (option: ComboboxOption) => void;
  onValueChange: (value: string) => void;
  options: ComboboxOption[];
  selectedOption?: ComboboxOption | null;
  value: string;
}

function getFirstEnabledIndex(options: ComboboxOption[]) {
  return options.findIndex((option) => !option.disabled);
}

function getNextEnabledIndex(
  options: ComboboxOption[],
  currentIndex: number,
  direction: 1 | -1
) {
  if (options.length === 0) {
    return -1;
  }

  let nextIndex = currentIndex;
  let checkedOptions = 0;

  while (checkedOptions < options.length) {
    nextIndex = (nextIndex + direction + options.length) % options.length;
    checkedOptions += 1;

    if (!options[nextIndex]?.disabled) {
      return nextIndex;
    }
  }

  return -1;
}

export function Combobox({
  className,
  contentClassName,
  emptyMessage = 'No options found.',
  inputClassName,
  onBlur,
  onClick,
  onFocus,
  onKeyDown,
  onSelect,
  onValueChange,
  options,
  selectedOption = null,
  value,
  ...inputProps
}: ComboboxProps) {
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const selectedIndex = useMemo(
    () =>
      selectedOption
        ? options.findIndex((option) => option.id === selectedOption.id)
        : -1,
    [options, selectedOption]
  );

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handlePointerDown = (event: Event) => {
      if (!(event.target instanceof Node)) {
        return;
      }

      if (!rootRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setHighlightedIndex(-1);
      return;
    }

    setHighlightedIndex(
      selectedIndex >= 0 ? selectedIndex : getFirstEnabledIndex(options)
    );
  }, [isOpen, options, selectedIndex]);

  const rootClasses = [styles.combobox, className].filter(Boolean).join(' ');
  const inputClasses = [styles.input, inputClassName].filter(Boolean).join(' ');

  const handleOpen = () => {
    if (!inputProps.disabled) {
      setIsOpen(true);
    }
  };

  const handleSelect = (option: ComboboxOption) => {
    if (option.disabled) {
      return;
    }

    onSelect(option);
    setIsOpen(false);
    setHighlightedIndex(options.findIndex((item) => item.id === option.id));
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    onValueChange(event.target.value);
    handleOpen();
  };

  const handleInputFocus = (event: FocusEvent<HTMLInputElement>) => {
    onFocus?.(event);

    if (!event.defaultPrevented) {
      handleOpen();
    }
  };

  const handleInputClick = (event: ReactMouseEvent<HTMLInputElement>) => {
    onClick?.(event);

    if (!event.defaultPrevented) {
      handleOpen();
    }
  };

  const handleInputBlur = (event: FocusEvent<HTMLInputElement>) => {
    onBlur?.(event);
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);

    if (event.defaultPrevented) {
      return;
    }

    switch (event.key) {
      case 'ArrowDown': {
        event.preventDefault();

        if (!isOpen) {
          handleOpen();
          break;
        }

        setHighlightedIndex((currentIndex) =>
          getNextEnabledIndex(options, currentIndex < 0 ? -1 : currentIndex, 1)
        );
        break;
      }

      case 'ArrowUp': {
        event.preventDefault();

        if (!isOpen) {
          handleOpen();
          break;
        }

        setHighlightedIndex((currentIndex) =>
          getNextEnabledIndex(options, currentIndex < 0 ? 0 : currentIndex, -1)
        );
        break;
      }

      case 'Enter': {
        if (!isOpen || highlightedIndex < 0) {
          return;
        }

        event.preventDefault();

        const highlightedOption = options[highlightedIndex];

        if (highlightedOption) {
          handleSelect(highlightedOption);
        }

        break;
      }

      case 'Escape': {
        if (!isOpen) {
          return;
        }

        event.preventDefault();
        setIsOpen(false);
        break;
      }
    }
  };

  return (
    <div className={rootClasses} ref={rootRef}>
      <Popover
        contentClassName={[styles.content, contentClassName].filter(Boolean).join(' ')}
        isOpen={isOpen}
        trigger={
          <div className={styles.trigger}>
            <Input
              {...inputProps}
              aria-activedescendant={
                highlightedIndex >= 0
                  ? `${listboxId}-option-${highlightedIndex}`
                  : undefined
              }
              aria-autocomplete="list"
              aria-controls={isOpen ? listboxId : undefined}
              aria-expanded={isOpen}
              className={inputClasses}
              onBlur={handleInputBlur}
              onChange={handleInputChange}
              onClick={handleInputClick}
              onFocus={handleInputFocus}
              onKeyDown={handleInputKeyDown}
              role="combobox"
              value={value}
            />
            <span className={styles.chevron}>
              <Icon name="chevron-down" size={18} />
            </span>
          </div>
        }
      >
        <div className={styles.list} id={listboxId} role="listbox">
          {options.length > 0 ? (
            options.map((option, index) => {
              const isHighlighted = index === highlightedIndex;
              const isSelected = selectedOption?.id === option.id;
              const optionClasses = [
                styles.option,
                isHighlighted ? styles.highlighted : '',
                isSelected ? styles.selected : '',
                option.disabled ? styles.disabled : ''
              ]
                .filter(Boolean)
                .join(' ');

              return (
                <button
                  key={option.id}
                  aria-selected={isSelected}
                  className={optionClasses}
                  disabled={option.disabled}
                  id={`${listboxId}-option-${index}`}
                  onClick={() => handleSelect(option)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  role="option"
                  type="button"
                >
                  {option.iconName ? (
                    <span className={styles.optionIcon}>
                      <Icon name={option.iconName} size={18} />
                    </span>
                  ) : null}
                  <span className={styles.optionContent}>
                    <span className={styles.optionLabel}>{option.label}</span>
                    {option.description ? (
                      <span className={styles.optionDescription}>
                        {option.description}
                      </span>
                    ) : null}
                  </span>
                  {isSelected ? (
                    <span className={styles.optionCheck}>
                      <Icon name="check" size={16} />
                    </span>
                  ) : null}
                </button>
              );
            })
          ) : (
            <div className={styles.empty}>{emptyMessage}</div>
          )}
        </div>
      </Popover>
    </div>
  );
}
