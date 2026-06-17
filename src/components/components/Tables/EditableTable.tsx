'use client';

import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dayjs from 'dayjs';
import { convertSnakeToCamelCase, replaceEntry } from '@/helpers';
import { useDictionary } from '@/components/providers/DictionaryProvider';
import { GoogleIcon } from '@/components/atoms/GoogleIcon';
import EditForm, { EditFormProps } from '@/components/molecules/EditForm';
import { Input, InputProps } from '@/components/atoms/Input';
import DeleteButton from '@/components/molecules/DeleteButton';
import { Button } from '@/components/atoms/Button';
import { useElementInViewport } from '@/app/hooks/useElementInViewport';
import {
  LoadRowsFunction,
  PatientCategory,
  SupabaseArray,
} from '@/types/GeneralTypes';
import { ROWS_TO_LOAD } from '@/types/GlobalTypes';
import { Loading } from '../Loading';
import { toggleTODOItemDone } from '@/supabase/actions/todoListActions';

type EditableTableProps = {
  data: SupabaseArray;
  excludedHeaders?: string[];
  onClickRow?: (rowData: { [key: string]: string }) => void;
  clickableCell?: {
    clickableCellHeader: string;
    clickableCellFunction: (rowData: { [key: string]: string }) => void;
  };
  tableHeader?: ReactNode;
  tableClassName?: string;
  editAction?: (formData: FormData) => Promise<void>;
  deleteAction?: (id: number) => Promise<void>;
  formFields?: InputProps[];
  addSearchBar?: boolean;
  initialSortOrder?: SortOrder;
  loadRows?: LoadRowsFunction;
  onEditClick?: (rowData: { [key: string]: string }) => void;
  unsortableHeaders?: string[];
  useHeaderTranslationForRows?: string[];
  patientCategory?: PatientCategory;
  deleteDialogMessage?: string;
} & Partial<EditFormProps>;

type SpecificTableProps = EditableTableProps & {
  deleteMessage?: string;
  editMessage?: string;
  emptyTableMessage: string;
};

type SortOrder = 'asc' | 'desc';

export default function EditableTable(props: SpecificTableProps) {
  const {
    data,
    excludedHeaders,
    onClickRow,
    clickableCell,
    tableHeader,
    tableClassName,
    editAction,
    deleteAction,
    formFields,
    editMessage,
    deleteMessage,
    emptyTableMessage,
    addSearchBar = false,
    initialSortOrder = 'asc',
    loadRows,
    onEditClick,
    unsortableHeaders = [],
    useHeaderTranslationForRows = [],
    patientCategory,
    addMessage,
    buttonAddIconName,
    deleteDialogMessage,
  } = props;

  const dictionary = useDictionary();
  const t = dictionary;

  const headers = useMemo(() => {
    const baseHeaders = data?.length
      ? excludedHeaders
        ? Object.keys(data[0]).filter((key) => !excludedHeaders.includes(key))
        : Object.keys(data[0])
      : [];

    if (editAction && formFields) {
      baseHeaders.push(editMessage ?? 'Edit');
    }

    if (deleteAction) {
      baseHeaders.push(deleteMessage ?? 'Delete');
    }

    return baseHeaders;
  }, [data, excludedHeaders, editAction, formFields, editMessage, deleteAction, deleteMessage]);

  const cellClasses = 'p-3 text-font text-base border-b border-font/20';

  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>(initialSortOrder);
  const [sortedHeader, setSortedHeader] = useState<string | null>(null);
  const [tableData, setTableData] = useState(data ?? []);

  const [containerRef, isVisible] = useElementInViewport();

  const rangeStartRef = useRef(ROWS_TO_LOAD);
  const loadingRef = useRef(false);
  const [moreDataToLoad, setMoreDataToLoad] = useState(true);

  useEffect(() => {
    setTableData(data ?? []);
    rangeStartRef.current = ROWS_TO_LOAD;

    if ((data?.length ?? 0) <= ROWS_TO_LOAD - 1) {
      setMoreDataToLoad(false);
    } else {
      setMoreDataToLoad(true);
    }
  }, [data]);

  const fetchData = useCallback(async () => {
    if (!moreDataToLoad || loadingRef.current) return;

    loadingRef.current = true;
    const currentRangeStart = rangeStartRef.current;
    const rangeTo = currentRangeStart + ROWS_TO_LOAD - 1;

    try {
      const newData = await loadRows?.({
        from: currentRangeStart,
        to: rangeTo,
        ascending: sortOrder === 'asc',
        element: sortedHeader ?? undefined,
        category: patientCategory,
      });

      if (newData && newData?.length) {
        rangeStartRef.current = currentRangeStart + ROWS_TO_LOAD;
        setTableData((prevData) => {
          const existingIds = new Set(prevData.map((item) => item.id));
          const filteredNewData = newData.filter(
            (item) => !existingIds.has(item.id)
          );
          return [...prevData, ...filteredNewData];
        });

        if (newData.length < ROWS_TO_LOAD) {
          setMoreDataToLoad(false);
        }
      } else {
        setMoreDataToLoad(false);
      }
    } finally {
      loadingRef.current = false;
    }
  }, [moreDataToLoad, loadRows, sortOrder, sortedHeader, patientCategory]);

  useEffect(() => {
    if (!moreDataToLoad || !isVisible) return;

    fetchData();
  }, [isVisible, moreDataToLoad, fetchData]);

  const filteredData = useMemo(() => {
    if (!searchTerm) return tableData;

    return tableData?.filter((entry) =>
      Object.values(entry).some((value) =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, tableData]);

  useEffect(() => {
    if (headers && headers.length > 0 && !sortedHeader) {
      const initialHeader = headers[0];
      setSortedHeader(initialHeader);
    }
  }, [headers, sortedHeader]);

  async function sortDataByHeader(header: string, order: SortOrder) {
    if (!tableData) return;

    const newSortedData = await loadRows?.({
      from: 0,
      to: rangeStartRef.current - 1,
      ascending: order === 'asc',
      element: header,
      category: patientCategory,
    });

    if (!newSortedData) return;

    setSortedHeader(header);
    setTableData(newSortedData);
  }

  return (
    <>
      {tableHeader}

      {tableData?.length ? (
        <div
          className={`overflow-x-auto ${tableClassName ? tableClassName : 'col-span-6 md:col-span-12'}`}
        >
          {addSearchBar && (
            <div className='relative flex items-center md:justify-end'>
              <Input
                label={t?.general?.search || 'Search'}
                element='searchTerm'
                value={searchTerm}
                labelClassName='!ml-9 !text-font'
                className='border-base-dark !border-2 !pl-9'
                containerClassName='mb-3 mt-4 lg:w-1/2'
                onChange={(e) => setSearchTerm(e.target.value)}
                type='search'
              >
                <GoogleIcon
                  iconName='search'
                  iconClassName='text-2xl absolute text-base-dark mr-2 left-2 top-3'
                />
              </Input>
            </div>
          )}

          {filteredData?.length === 0 ? (
            <div>{emptyTableMessage}</div>
          ) : (
            <table className='mb-6 w-full text-left md:mb-12'>
              <colgroup>
                {headers?.map((_header, index) => (
                  <col key={index} />
                ))}
              </colgroup>
              <thead>
                <tr>
                  {headers?.map((header, index) => (
                    <th
                      key={index}
                      className={`bg-background text-base ${cellClasses}`}
                    >
                      {!unsortableHeaders.includes(header) ? (
                        <Button
                          iconName={
                            sortOrder === 'asc'
                              ? 'arrow_upward'
                              : 'arrow_downward'
                          }
                          asLink
                          className='group'
                          iconPlacement='right'
                          iconClassName={`${sortedHeader === header ? 'opacity-100' : 'opacity-0'} transition-opacity group-hover:opacity-100`}
                          onClick={async () => {
                            const newSortOrder: SortOrder =
                              sortedHeader != header
                                ? 'asc'
                                : sortOrder === 'asc'
                                  ? 'desc'
                                  : 'asc';

                            setSortOrder(newSortOrder);
                            sortDataByHeader(header, newSortOrder);
                          }}
                          label={
                            (() => {
                              const camelHeader = convertSnakeToCamelCase(header);
                              const categories = Object.values(t || {});
                              for (const cat of categories) {
                                if (cat && typeof cat === 'object' && camelHeader in cat) {
                                  return (cat as Record<string, string>)[camelHeader];
                                }
                              }
                              return header;
                            })()
                          }
                        />
                      ) : (
                        (() => {
                          const camelHeader = convertSnakeToCamelCase(header);
                          const categories = Object.values(t || {});
                          for (const cat of categories) {
                            if (cat && typeof cat === 'object' && camelHeader in cat) {
                              return (cat as Record<string, string>)[camelHeader];
                            }
                          }
                          return header;
                        })()
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredData?.map((entry, rowIndex) => {
                  const { clickableCellHeader, clickableCellFunction } =
                    clickableCell || {};

                  return (
                    <tr
                      key={rowIndex}
                      className={`hover:bg-background/50 ${onClickRow ? 'cursor-pointer' : ''}`}
                      onClick={() => onClickRow?.(entry)}
                    >
                      {headers.map((header, colIndex) => {
                        const filledFormFields = formFields?.map((field) =>
                          !field.value
                            ? { ...field, value: entry[field.element] }
                            : field
                        ) || [];

                        filledFormFields.push({
                          element: 'id',
                          label: 'id',
                          value: entry['id'],
                          containerClassName: '-mt-7',
                          type: 'hidden',
                        });

                        return (
                          <td
                            key={colIndex}
                            className={`${cellClasses} ${clickableCellHeader === header ? 'text-link hover:text-link-hover cursor-pointer font-semibold' : ''}`}
                            onClick={(e) => {
                              if (
                                clickableCell &&
                                clickableCellHeader === header &&
                                entry[header] !== ''
                              ) {
                                e.stopPropagation();
                                clickableCellFunction?.(entry);
                              }
                            }}
                          >
                            {typeof entry[header] === 'boolean' ? (
                              <GoogleIcon
                                iconName={
                                  entry[header]
                                    ? 'check_box'
                                    : 'check_box_outline_blank'
                                }
                                iconClassName={`${
                                  entry[header]
                                    ? '!text-green-700'
                                    : '!text-red-700'
                                } [vertical-align:bottom]`}
                                ariaLabel={
                                  entry[header] ? 'todo done' : 'todo not done'
                                }
                              />
                            ) : useHeaderTranslationForRows.includes(header) &&
                              entry[header] != undefined ? (
                              (() => {
                                const camelValue = convertSnakeToCamelCase(String(entry[header]));
                                const categories = Object.values(t || {});
                                for (const cat of categories) {
                                  if (cat && typeof cat === 'object' && camelValue in cat) {
                                    return (cat as Record<string, string>)[camelValue];
                                  }
                                }
                                return String(entry[header]);
                              })()
                            ) : (
                              header.includes('time') && entry[header] ? dayjs(entry[header]).format('DD/MM/YYYY HH:mm') : entry[header]
                            )}

                            {header === editMessage && (editAction || onEditClick) ? (
                              onEditClick ? (
                                <div onClick={(e) => e.stopPropagation()}>
                                  <Button
                                    iconName='edit'
                                    asLink
                                    onClick={() => {
                                      onEditClick(entry);
                                    }}
                                    label=''
                                  />
                                </div>
                              ) : editAction && filledFormFields ? (
                                <EditForm
                                  formFunctionality='edit'
                                  formAction={editAction}
                                  formFields={filledFormFields}
                                  asLink
                                  label=''
                                  addMessage={addMessage || ''}
                                  editMessage={
                                    (() => {
                                      const categories = Object.values(t || {});
                                      for (const cat of categories) {
                                        if (cat && typeof cat === 'object' && editMessage in cat) {
                                          return (cat as Record<string, string>)[editMessage];
                                        }
                                      }
                                      return editMessage;
                                    })()
                                  }
                                  buttonAddIconName={buttonAddIconName || ''}
                                />
                              ) : undefined
                            ) : undefined}

                            {header === deleteMessage && deleteAction ? (
                              <DeleteButton
                                deleteAction={() =>
                                  deleteAction(Number(entry['id']))
                                }
                                message={replaceEntry(
                                  deleteDialogMessage || '',
                                  entry['treatment'] || entry['todo'] || ''
                                )}
                                className='!text-red-700 hover:!text-red-500'
                                asLink
                                dialogHeadline={
                                  (() => {
                                    const categories = Object.values(t || {});
                                    for (const cat of categories) {
                                      if (cat && typeof cat === 'object' && deleteMessage in cat) {
                                        return (cat as Record<string, string>)[deleteMessage];
                                      }
                                    }
                                    return deleteMessage;
                                  })()
                                }
                              />
                            ) : undefined}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          {moreDataToLoad && loadRows && <Loading ref={containerRef} />}
        </div>
      ) : (
        <div className='col-span-6 md:col-span-12'>{emptyTableMessage}</div>
      )}
    </>
  );
}

export function EditablePatientTable(props: EditableTableProps) {
  const dictionary = useDictionary();

  return (
    <EditableTable
      deleteMessage='deletePatient'
      editMessage='editPatient'
      emptyTableMessage={dictionary?.feedback?.emptyPatientData || ''}
      addSearchBar={true}
      unsortableHeaders={['phone', 'deletePatient', 'editPatient']}
      {...props}
    />
  );
}

export function EditableAppointmentTable(props: EditableTableProps & { editMessage?: string; deleteMessage?: string }) {
  const dictionary = useDictionary();

  return (
    <EditableTable
      emptyTableMessage={dictionary?.feedback?.emptyPatientData || ''}
      initialSortOrder='desc'
      unsortableHeaders={['phone_number', 'patient_id']}
      excludedHeaders={['id', 'patient_id', 'created_at', 'phone_number']}
      {...props}
    />
  );
}

export function EditableTreatmentTable(props: EditableTableProps) {
  const dictionary = useDictionary();

  return (
    <EditableTable
      deleteMessage='deleteTreatment'
      editMessage='editTreatment'
      emptyTableMessage={dictionary?.feedback?.emptyTreatmentData || ''}
      initialSortOrder='desc'
      unsortableHeaders={['deleteTreatment', 'editTreatment']}
      addMessage={dictionary?.edit?.addTreatment || ''}
      buttonAddIconName='post_add'
      deleteDialogMessage={dictionary?.feedback?.deleteTreatmentMessage || ''}
      {...props}
    />
  );
}

export function EditableTODOListTable(props: EditableTableProps) {
  const dictionary = useDictionary();

  return (
    <EditableTable
      deleteMessage='deleteTODOItem'
      editMessage='editTODOItem'
      addMessage={dictionary?.todo?.addTODOItem || ''}
      emptyTableMessage={dictionary?.todo?.emptyTODOList || 'No TODO items.'}
      excludedHeaders={['id']}
      unsortableHeaders={['deleteTODOItem', 'editTODOItem']}
      useHeaderTranslationForRows={['done']}
      buttonAddIconName='add_task'
      deleteDialogMessage={dictionary?.todo?.deleteTODOItemMessage || ''}
      clickableCell={{
        clickableCellHeader: 'done',
        clickableCellFunction: (rowData) =>
          toggleTODOItemDone(Number(rowData.id), Boolean(rowData.done)),
      }}
      {...props}
    />
  );
}
