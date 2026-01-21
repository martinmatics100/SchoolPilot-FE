import React, { useEffect, useState } from "react";
import {
  BulkEditableTable,
  type BulkColumn,
} from "../../../../components/bulk-editable-table";
import { BulkActionBar } from "../../../../components/bulk-editable-table/bulk-actionBar";
import { useEnums } from "../../../../hooks/useEnums";
import { useAuth } from "../../../../context";
import { fetchClasses } from "../../../../api/classServices";
import { createStudentsBulk } from "../../../../api/studentService";

type StudentRow = {
  firstName: string;
  lastName: string;
  gender: string;
  classId: string;
  streamType?: number | null;
};

export default function CreateStudentsBulk() {
  const { enums } = useEnums({ fetchPermissionData: false });
  const { selectedAccount } = useAuth();

  const [classes, setClasses] = useState<any[]>([]);
  const [rows, setRows] = useState<StudentRow[]>([
    { firstName: "", lastName: "", gender: "", classId: "", streamType: null },
  ]);

  useEffect(() => {
    if (!selectedAccount) return;

    fetchClasses(selectedAccount).then((data) =>
      setClasses(
        data.map((c: any) => ({
          id: c.id,
          name: c.className,
          classLevel: c.classLevel,
        }))
      )
    );
  }, [selectedAccount]);

  const createEmptyRow = (): StudentRow => ({
    firstName: "",
    lastName: "",
    gender: "",
    classId: "",
    streamType: null,
  });

  const columns: BulkColumn<StudentRow>[] = [
    {
      key: "firstName",
      label: "First Name",
      type: "text",
      required: true,
      minWidth: 200,
    },
    {
      key: "lastName",
      label: "Last Name",
      type: "text",
      required: true,
      minWidth: 200,
    },
    {
      key: "gender",
      label: "Gender",
      type: "select",
      required: true,
      minWidth: 160,
      options:
        enums?.Gender?.map((g) => ({
          value: g.value.toString(),
          label: g.displayName || g.name,
        })) ?? [],
    },
    {
      key: "classId",
      label: "Class",
      type: "select",
      required: true,
      minWidth: 220,
      options: classes.map((c) => ({
        value: c.id,
        label: c.name,
      })),
    },
    {
      key: "streamType",
      label: "Stream",
      type: "select",
      required: false, // ✅ only required if senior class
      minWidth: 200,
      options:
        enums?.StreamType?.map((s) => ({
          value: s.value.toString(),
          label: s.displayName || s.name,
        })) ?? [],
      // ✅ Custom visibility logic per row
      isVisible: (row: StudentRow) => {
        const selectedClass = classes.find((c) => c.id === row.classId);
        return selectedClass?.classLevel === 4; // show only for senior classes
      },
    },
  ];

  const isInvalid = rows.some((r) => {
    const selectedClass = classes.find((c) => c.id === r.classId);
    const isSenior = selectedClass?.classLevel === 4;
    return (
      !r.firstName ||
      !r.lastName ||
      !r.gender ||
      !r.classId ||
      (isSenior && !r.streamType) // ✅ require stream if senior
    );
  });

  const handleSave = async () => {
    const payload = {
      students: rows.map((r) => ({
        firstName: r.firstName.trim(),
        lastName: r.lastName.trim(),
        gender: Number(r.gender),
        classRoomId: r.classId,
        streamType: r.streamType !== null ? Number(r.streamType) : null,
      })),
    };

    console.log("FINAL PAYLOAD:", payload);
    await createStudentsBulk(selectedAccount, payload);
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4">Bulk Add Students</h2>

      <BulkEditableTable
        columns={columns}
        rows={rows}
        onChange={setRows}
        createEmptyRow={createEmptyRow}
      />

      <BulkActionBar
        onSave={handleSave}
        onAddRows={(count) =>
          setRows((prev) => [
            ...prev,
            ...Array.from({ length: count }, createEmptyRow),
          ])
        }
        disableSave={isInvalid}
        saveLabel="Bulk Create"
      />
    </div>
  );
}
