'use client';

import { ReactNode, useEffect, useMemo, useState } from 'react';
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
import { deleteTreatment } from '@/supabase/actions/treatmentActions';

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
    unsortableHeaders = [],
    useHeaderTranslationForRows = [],
    patientCategory,
    addMessage,
    buttonAddIconName,
    deleteDialogMessage,
  } = props;

  const t = useDictionary();
  let filledFormFields = formFields;

  const headers = data?.length
    ? excludedHeaders
      ? Object.keys(data[0]).filter((key) => !excludedHeaders.includes(key))
      : Object.keys(data[0])
    : null;

  if (editAction && formFields) {
    headers?.push(editMessage ?? 'Edit');
  }

  if (deleteAction) {
    headers?.push(deleteMessage ?? 'Delete');
  }

  const cellClasses = 'p-3 text-font text-base border-b border-font/20';

  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>(initialSortOrder);
  const [sortedHeader, setSortedHeader] = useState<string | null>(null);
  const [tableData, setTableData] = useState(data ?? []);

  const [containerRef, isVisible] = useElementInViewport();

  const [rangeStart, setRangeStart] = useState(ROWS_TO_LOAD);
  const [moreDataToLoad, setMoreDataToLoad] = useState(true);

  useEffect(() => {
    setTableData(data ?? []);
    setRangeStart(ROWS_TO_LOAD);

    if ((data?.length ?? 0) <= ROWS_TO_LOAD - 1) {
      setMoreDataToLoad(false);
    } else {
      setMoreDataToLoad(true);
    }
  }, [data]);

  useEffect(() => {
    if (!moreDataToLoad || !isVisible) return;

    fetchData();
  }, [isVisible, tableData]);

  async function fetchData() {
    if (!moreDataToLoad) return;

    const rangeTo = rangeStart + ROWS_TO_LOAD - 1;
    setRangeStart(rangeTo + 1);

    const newData = await loadRows?.({
      from: rangeStart,
      to: rangeTo,
      ascending: sortOrder === 'asc',
      element: sortedHeader ?? undefined,
      category: patientCategory,
    });

    if (newData && newData?.length) {
      setTableData((prevData) => {
        const existingIds = new Set(prevData.map((item) => item.id));
        const filteredNewData = newData.filter(
          (item) => !existingIds.has(item.id)
        );
        return [...prevData, ...filteredNewData];
      });
    } else {
      setMoreDataToLoad(false);
    }
  }

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
  }, []);

  async function sortDataByHeader(header: string, order: SortOrder) {
    if (!tableData) return;

    const newSortedData = await loadRows?.({
      from: 0,
      to: rangeStart - 1,
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
                label={t.search}
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
                            t?.[
                              convertSnakeToCamelCase(header) as keyof typeof t
                            ] ?? header
                          }
                        />
                      ) : (
                        (t?.[
                          convertSnakeToCamelCase(header) as keyof typeof t
                        ] ?? header)
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredData?.map((entry, index) => {
                  const { clickableCellHeader, clickableCellFunction } =
                    clickableCell || {};

                  return (
                    <tr
                      key={index}
                      className={`hover:bg-background/50 ${onClickRow ? 'cursor-pointer' : ''}`}
                      onClick={() => onClickRow?.(entry)}
                    >
                      {headers?.map((header, index) => {
                        filledFormFields = formFields?.map((field) =>
                          !field.value
                            ? { ...field, value: entry[field.element] }
                            : field
                        );

                        filledFormFields?.push({
                          element: 'id',
                          label: 'id',
                          value: entry['id'],
                          containerClassName: '-mt-7',
                          type: 'hidden',
                        });

                        return (
                          <td
                            key={index}
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
                              (t?.[
                                convertSnakeToCamelCase(
                                  header
                                ) as keyof typeof t
                              ] ?? header)
                            ) : (
                              entry[header]
                            )}

                            {header === editMessage &&
                            editAction &&
                            filledFormFields ? (
                              <EditForm
                                formFunctionality='edit'
                                formAction={editAction}
                                formFields={filledFormFields}
                                asLink
                                label=''
                                addMessage={addMessage || ''}
                                editMessage={
                                  t[editMessage as keyof typeof t] ?? ''
                                }
                                buttonAddIconName={buttonAddIconName || ''}
                              />
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
                                  t[deleteMessage as keyof typeof t] ?? ''
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
  const { emptyPatientData } = useDictionary();

  return (
    <EditableTable
      deleteMessage='deletePatient'
      editMessage='editPatient'
      emptyTableMessage={emptyPatientData ?? ''}
      addSearchBar={true}
      unsortableHeaders={['phone', 'deletePatient', 'editPatient']}
      {...props}
    />
  );
}

export function EditableTreatmentTable(props: EditableTableProps) {
  const { emptyTreatmentData, addTreatment, deleteTreatmentMessage } =
    useDictionary();

  return (
    <EditableTable
      deleteMessage='deleteTreatment'
      editMessage='editTreatment'
      emptyTableMessage={emptyTreatmentData ?? ''}
      initialSortOrder='desc'
      unsortableHeaders={['deleteTreatment', 'editTreatment']}
      addMessage={addTreatment ?? ''}
      buttonAddIconName='post_add'
      deleteDialogMessage={deleteTreatmentMessage ?? ''}
      deleteAction={deleteTreatment}
      {...props}
    />
  );
}

export function EditableTODOListTable(props: EditableTableProps) {
  const { addTODOItem, emptyTODOList, deleteTODOItemMessage } = useDictionary();

  return (
    <EditableTable
      deleteMessage='deleteTODOItem'
      editMessage='editTODOItem'
      addMessage={addTODOItem ?? ''}
      emptyTableMessage={emptyTODOList ?? 'No TODO items.'}
      excludedHeaders={['id']}
      unsortableHeaders={['deleteTODOItem', 'editTODOItem']}
      useHeaderTranslationForRows={['done']}
      buttonAddIconName='add_task'
      deleteDialogMessage={deleteTODOItemMessage ?? ''}
      clickableCell={{
        clickableCellHeader: 'done',
        clickableCellFunction: (rowData) =>
          toggleTODOItemDone(Number(rowData.id), Boolean(rowData.done)),
      }}
      {...props}
    />
  );
}
