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

interface SubjectAssignment {
  subjectId: number;
  subjectType: number;
  applicableStream?: number | null;
}

const SubjectAssignmentType = {
  Core: 1,
  Elective: 2,
} as const;

const StreamType = {
  Science: 1,
  Arts: 2,
  Commercial: 3,
} as const;

const CreateSubject = () => {
  const { enums, isLoading } = useEnums({ fetchPermissionData: false });
  const { apiClient, selectedAccount } = useAuth();

  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [alertMessage, setAlertMessage] = useState<any>({});
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [isSeniorClass, setIsSeniorClass] = useState(false);

  const [coreSubjects, setCoreSubjects] = useState<any[]>([]);
  const [streamSubjects, setStreamSubjects] = useState({
    Science: [],
    Arts: [],
    Commercial: [],
  });

  const [selectedCoreSubjects, setSelectedCoreSubjects] = useState<string[]>([]);
  const [selectedStreamSubjects, setSelectedStreamSubjects] = useState({
    Science: [] as string[],
    Arts: [] as string[],
    Commercial: [] as string[],
  });

  const checkIfSeniorClass = (className: string) => {
    return className.includes("SSS") || className.includes("S.S.S");
  };

  // Fetch classes
  useEffect(() => {
    if (!selectedAccount) return;

    fetchClasses(selectedAccount).then((res) => {
      setClasses(
        res.map((c: any) => ({
          value: c.id,
          label: c.className,
        }))
      );
    });
  }, [selectedAccount]);

  // Handle class change
  const handleClassChange = async (classId: string) => {
    const selectedClassData = classes.find((c) => c.value === classId);
    setSelectedClass(selectedClassData);

    const isSenior = checkIfSeniorClass(selectedClassData?.label || "");
    setIsSeniorClass(isSenior);

    try {
      const response = await fetchClassSubjects(apiClient, classId);

      const subjectsData = response.subjects || response;

      // ✅ API returns assigned subjects
      const assigned = subjectsData.map((s: any) =>
        String(s.value)
      );

      setSelectedCoreSubjects(assigned);
      setSelectedStreamSubjects({
        Science: [],
        Arts: [],
        Commercial: [],
      });
    } catch (err) {
      console.error("Failed to fetch class subjects", err);
    }
  };

  // Combine all selected values
  const getAllSelectedSubjects = () => {
    return new Set([
      ...selectedCoreSubjects,
      ...selectedStreamSubjects.Science,
      ...selectedStreamSubjects.Arts,
      ...selectedStreamSubjects.Commercial,
    ]);
  };

  // Dynamic filtering
  useEffect(() => {
    if (!enums) return;

    const allSubjects = enums?.AcademicSubjects || [];
    const selectedSet = getAllSelectedSubjects();

    const filtered = allSubjects
      .filter((s: any) => !selectedSet.has(String(s.value)))
      .map((s: any) => ({
        value: String(s.value),
        label: s.displayName || s.name,
      }));

    setCoreSubjects(filtered);
    setStreamSubjects({
      Science: filtered,
      Arts: filtered,
      Commercial: filtered,
    });
  }, [selectedCoreSubjects, selectedStreamSubjects, enums]);

  // Build form fields
  useEffect(() => {
    if (isLoading) return;

    const fields: FormField[] = [
      {
        name: "classId",
        label: "Class",
        type: "select",
        required: true,
        options: classes,
        onChange: handleClassChange,
      },
      {
        name: "coreSubjects",
        label: "Core Subjects (All Students)",
        type: "multiselect",
        required: true,
        options: coreSubjects,
        onChange: (value: string[]) => setSelectedCoreSubjects(value),
      },
    ];

    if (isSeniorClass) {
      fields.push(
        {
          name: "scienceSubjects",
          label: "Science Stream Subjects",
          type: "multiselect",
          options: streamSubjects.Science,
          onChange: (value: string[]) =>
            setSelectedStreamSubjects((prev) => ({
              ...prev,
              Science: value,
            })),
        },
        {
          name: "artsSubjects",
          label: "Arts Stream Subjects",
          type: "multiselect",
          options: streamSubjects.Arts,
          onChange: (value: string[]) =>
            setSelectedStreamSubjects((prev) => ({
              ...prev,
              Arts: value,
            })),
        },
        {
          name: "commercialSubjects",
          label: "Commercial Stream Subjects",
          type: "multiselect",
          options: streamSubjects.Commercial,
          onChange: (value: string[]) =>
            setSelectedStreamSubjects((prev) => ({
              ...prev,
              Commercial: value,
            })),
        }
      );
    }

    setFormFields(fields);
  }, [isLoading, classes, coreSubjects, streamSubjects, isSeniorClass]);

  // Submit
  const handleSubmit = async (data: any) => {
    try {
      const subjectAssignments: SubjectAssignment[] = [];

      data.coreSubjects?.forEach((id: string) => {
        subjectAssignments.push({
          subjectId: Number(id),
          subjectType: SubjectAssignmentType.Core,
          applicableStream: null,
        });
      });

      if (isSeniorClass) {
        data.scienceSubjects?.forEach((id: string) => {
          subjectAssignments.push({
            subjectId: Number(id),
            subjectType: SubjectAssignmentType.Elective,
            applicableStream: StreamType.Science,
          });
        });

        data.artsSubjects?.forEach((id: string) => {
          subjectAssignments.push({
            subjectId: Number(id),
            subjectType: SubjectAssignmentType.Elective,
            applicableStream: StreamType.Arts,
          });
        });

        data.commercialSubjects?.forEach((id: string) => {
          subjectAssignments.push({
            subjectId: Number(id),
            subjectType: SubjectAssignmentType.Elective,
            applicableStream: StreamType.Commercial,
          });
        });
      }

      await createSubject(apiClient, {
        classId: data.classId,
        subjectAssignments,
      });

      setAlertMessage({
        feMessage: "Subjects assigned successfully",
        httpStatus: 200,
      });

      await handleClassChange(data.classId);
    } catch (error: any) {
      setAlertMessage({
        feMessage:
          error.response?.data?.title ||
          "Failed to assign subjects",
        httpStatus: error.response?.status || 500,
      });
    }
  };

  if (isLoading) return null;

  return (
    <>
      <MessageDisplay {...alertMessage} />
      <NavigationButton to="">Back</NavigationButton>

      <DynamicForm
        key={selectedClass?.value}
        title="Assign Subjects to Class"
        fields={formFields}
        onSubmit={handleSubmit}
        columns={2}
        initialValues={{
          classId: selectedClass?.value || "",
          coreSubjects: selectedCoreSubjects,
          scienceSubjects: selectedStreamSubjects.Science,
          artsSubjects: selectedStreamSubjects.Arts,
          commercialSubjects: selectedStreamSubjects.Commercial,
        }}
      />
    </>
  );
};

export default CreateSubject;