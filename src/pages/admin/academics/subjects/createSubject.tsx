import React, { useEffect, useState } from "react";
import DynamicForm, { type FormField } from "../../../../components/my-form";
import MessageDisplay from "../../../../components/message-display";
import { NavigationButton } from "../../../../components/navigation-button";
import { useEnums } from "../../../../hooks/useEnums";
import { useAuth } from "../../../../context";
import { fetchClasses } from "../../../../api/classServices";
import {
  createSubject,
  fetchClassSubjects,
} from "../../../../api/subjectServies";

const CreateSubject = () => {
  const { enums, isLoading } = useEnums({ fetchPermissionData: false });
  const { apiClient, selectedAccount } = useAuth();

  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [alertMessage, setAlertMessage] = useState<any>({});
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [availableSubjects, setAvailableSubjects] = useState<
    { value: string; label: string }[]
  >([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  useEffect(() => {
    if (!selectedAccount) return;

    fetchClasses(selectedAccount).then((res) => {
      setClasses(
        res.map((c: any) => ({
          value: c.id,
          label: c.className,
        })),
      );
    });
  }, [selectedAccount]);

  const handleClassChange = async (classId: string) => {
    setSelectedClassId(classId);
    setSelectedSubjects([]);

    try {
      const response = await fetchClassSubjects(apiClient, classId);

      const offeredSubjectValues: number[] = response.map((s: any) => s.value);

      const enumsFromLocal = enums?.AcademicSubjects || [];

      const filteredSubjects = enumsFromLocal
        .filter((s: any) => !offeredSubjectValues.includes(Number(s.value)))
        .map((s: any) => ({
          value: String(s.value),
          label: s.displayName || s.name,
        }));

      setAvailableSubjects(filteredSubjects);
    } catch (err) {
      console.error("Failed to fetch class subjects", err);

      const enumsFromLocal = enums?.AcademicSubjects || [];
      setAvailableSubjects(
        enumsFromLocal.map((s: any) => ({
          value: String(s.value),
          label: s.displayName || s.name,
        })),
      );
    }
  };

  useEffect(() => {
    if (isLoading) return;

    const fields: FormField[] = [
      {
        name: "classId",
        label: "Class",
        type: "select",
        required: true,
        options: classes,
        placeholder: "Select class",
        onChange: handleClassChange,
      },
      {
        name: "subjectIds",
        label: "Subjects Offered",
        type: "multiselect",
        required: true,
        options: availableSubjects,
        placeholder: "Select subjects for this class",
      },
    ];

    setFormFields(fields);
  }, [isLoading, classes, availableSubjects]);

  const handleSubmit = async (data: any) => {
    try {
      const payload = {
        classId: data.classId,
        subjectIds: data.subjectIds.map((id: string) => Number(id)),
      };

      await createSubject(apiClient, payload);

      setAlertMessage({
        feMessage: "Subjects assigned to class successfully",
        httpStatus: 200,
      });

      const newlyAssigned = data.subjectIds.map((id: string) => id.toString());
      setAvailableSubjects((prev) =>
        prev.filter((s) => !newlyAssigned.includes(s.value)),
      );
      setSelectedSubjects([]);
    } catch (error) {
      setAlertMessage({
        feMessage: "Failed to assign subjects to class",
        httpStatus: 500,
      });
    }
  };

  if (isLoading) return null;

  return (
    <>
      <MessageDisplay {...alertMessage} />
      <NavigationButton to="">Back</NavigationButton>

      <DynamicForm
        key={selectedClassId}
        title="Assign Subjects to Class"
        fields={formFields}
        onSubmit={handleSubmit}
        columns={2}
        initialValues={{
          classId: selectedClassId,
          subjectIds: selectedSubjects,
        }}
      />
    </>
  );
};

export default CreateSubject;
