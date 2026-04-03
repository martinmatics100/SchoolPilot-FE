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

// Define the subject assignment interface matching your backend enums
interface SubjectAssignment {
  subjectId: number;
  subjectType: number; // 1 for Core, 2 for Elective
  applicableStream?: number | null; // 1 for Science, 2 for Arts, 3 for Commercial
}

// Map your backend enum values exactly
const SubjectAssignmentType = {
  Core: 1,      // Matches your backend: Core = 1
  Elective: 2   // Matches your backend: Elective = 2
} as const;

// StreamType enum values matching your backend exactly
const StreamType = {
  Science: 1,     // Matches your backend: Science = 1
  Arts: 2,        // Matches your backend: Arts = 2
  Commercial: 3   // Matches your backend: Commercial = 3
} as const;

const CreateSubject = () => {
  const { enums, isLoading } = useEnums({ fetchPermissionData: false });
  const { apiClient, selectedAccount } = useAuth();

  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [alertMessage, setAlertMessage] = useState<any>({});
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [isSeniorClass, setIsSeniorClass] = useState(false);

  // State for core subjects
  const [coreSubjects, setCoreSubjects] = useState<{ value: string; label: string }[]>([]);
  const [selectedCoreSubjects, setSelectedCoreSubjects] = useState<string[]>([]);

  // State for stream-specific subjects
  const [streamSubjects, setStreamSubjects] = useState<{
    Science: { value: string; label: string }[];
    Arts: { value: string; label: string }[];
    Commercial: { value: string; label: string }[];
  }>({
    Science: [],
    Arts: [],
    Commercial: []
  });

  const [selectedStreamSubjects, setSelectedStreamSubjects] = useState<{
    Science: string[];
    Arts: string[];
    Commercial: string[];
  }>({
    Science: [],
    Arts: [],
    Commercial: []
  });

  // Check if class is senior class (SS1, SS2, SS3)
  const checkIfSeniorClass = (className: string) => {
    return className.includes("SSS") || className.includes("S.S.S");
  };

  useEffect(() => {
    if (!selectedAccount) return;

    fetchClasses(selectedAccount).then((res) => {
      setClasses(
        res.map((c: any) => ({
          value: c.id,
          label: c.className,
          className: c.className
        })),
      );
    });
  }, [selectedAccount]);

  const handleClassChange = async (classId: string) => {
    const selectedClassData = classes.find(c => c.value === classId);
    setSelectedClass(selectedClassData);
    const isSenior = checkIfSeniorClass(selectedClassData?.label || "");
    setIsSeniorClass(isSenior);

    // Reset all selections
    setSelectedCoreSubjects([]);
    setSelectedStreamSubjects({
      Science: [],
      Arts: [],
      Commercial: []
    });

    try {
      const response = await fetchClassSubjects(apiClient, classId);

      // Separate existing subjects by type and stream
      // Your backend returns numeric values:
      // - subjectType: 1 (Core) or 2 (Elective)
      // - applicableStream: 1 (Science), 2 (Arts), or 3 (Commercial)
      const existingCoreSubjects = response
        .filter((s: any) => s.subjectType === SubjectAssignmentType.Core) // 1
        .map((s: any) => String(s.subject));

      const existingStreamSubjects = {
        Science: response
          .filter((s: any) => s.applicableStream === StreamType.Science) // 1
          .map((s: any) => String(s.subject)),
        Arts: response
          .filter((s: any) => s.applicableStream === StreamType.Arts) // 2
          .map((s: any) => String(s.subject)),
        Commercial: response
          .filter((s: any) => s.applicableStream === StreamType.Commercial) // 3
          .map((s: any) => String(s.subject))
      };

      setSelectedCoreSubjects(existingCoreSubjects);
      setSelectedStreamSubjects(existingStreamSubjects);

      // Get all available subjects from enums
      const allSubjects = enums?.AcademicSubjects || [];

      // Filter out already assigned subjects
      const assignedSubjects = new Set([
        ...existingCoreSubjects,
        ...existingStreamSubjects.Science,
        ...existingStreamSubjects.Arts,
        ...existingStreamSubjects.Commercial
      ]);

      const availableSubjects = allSubjects
        .filter((s: any) => !assignedSubjects.has(String(s.value)))
        .map((s: any) => ({
          value: String(s.value),
          label: s.displayName || s.name,
        }));

      setCoreSubjects(availableSubjects);
      setStreamSubjects({
        Science: availableSubjects,
        Arts: availableSubjects,
        Commercial: availableSubjects
      });

    } catch (err) {
      console.error("Failed to fetch class subjects", err);
      // Show all subjects if fetch fails
      const allSubjects = enums?.AcademicSubjects || [];
      const mappedSubjects = allSubjects.map((s: any) => ({
        value: String(s.value),
        label: s.displayName || s.name,
      }));

      setCoreSubjects(mappedSubjects);
      setStreamSubjects({
        Science: mappedSubjects,
        Arts: mappedSubjects,
        Commercial: mappedSubjects
      });
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
        name: "coreSubjects",
        label: "Core Subjects (All Students)",
        type: "multiselect",
        required: true,
        options: coreSubjects,
        placeholder: "Select core subjects for all students",
      },
    ];

    // Add stream-specific fields for senior classes
    if (isSeniorClass) {
      fields.push(
        {
          name: "scienceSubjects",
          label: "Science Stream Subjects",
          type: "multiselect",
          required: false,
          options: streamSubjects.Science,
          placeholder: "Select subjects for Science stream",
        },
        {
          name: "artsSubjects",
          label: "Arts Stream Subjects",
          type: "multiselect",
          required: false,
          options: streamSubjects.Arts,
          placeholder: "Select subjects for Arts stream",
        },
        {
          name: "commercialSubjects",
          label: "Commercial Stream Subjects",
          type: "multiselect",
          required: false,
          options: streamSubjects.Commercial,
          placeholder: "Select subjects for Commercial stream",
        }
      );
    }

    setFormFields(fields);
  }, [isLoading, classes, coreSubjects, streamSubjects, isSeniorClass]);

  const handleSubmit = async (data: any) => {
    try {
      // Prepare subject assignments with numeric enum values matching your backend
      const subjectAssignments: SubjectAssignment[] = [];

      // Add core subjects - using numeric value 1 (Core)
      if (data.coreSubjects && data.coreSubjects.length > 0) {
        data.coreSubjects.forEach((subjectId: string) => {
          subjectAssignments.push({
            subjectId: Number(subjectId),
            subjectType: SubjectAssignmentType.Core, // 1
            applicableStream: null
          });
        });
      }

      // Add stream-specific subjects for senior classes
      if (isSeniorClass) {
        // Science stream subjects
        if (data.scienceSubjects && data.scienceSubjects.length > 0) {
          data.scienceSubjects.forEach((subjectId: string) => {
            subjectAssignments.push({
              subjectId: Number(subjectId),
              subjectType: SubjectAssignmentType.Elective, // 2
              applicableStream: StreamType.Science // 1
            });
          });
        }

        // Arts stream subjects
        if (data.artsSubjects && data.artsSubjects.length > 0) {
          data.artsSubjects.forEach((subjectId: string) => {
            subjectAssignments.push({
              subjectId: Number(subjectId),
              subjectType: SubjectAssignmentType.Elective, // 2
              applicableStream: StreamType.Arts // 2
            });
          });
        }

        // Commercial stream subjects
        if (data.commercialSubjects && data.commercialSubjects.length > 0) {
          data.commercialSubjects.forEach((subjectId: string) => {
            subjectAssignments.push({
              subjectId: Number(subjectId),
              subjectType: SubjectAssignmentType.Elective, // 2
              applicableStream: StreamType.Commercial // 3
            });
          });
        }
      }

      const payload = {
        classId: data.classId,
        subjectAssignments: subjectAssignments
      };

      console.log("Sending payload to backend:", JSON.stringify(payload, null, 2));
      // Expected payload format:
      // {
      //   "classId": "some-guid",
      //   "subjectAssignments": [
      //     { "subjectId": 1, "subjectType": 1, "applicableStream": null },
      //     { "subjectId": 2, "subjectType": 2, "applicableStream": 1 },
      //     { "subjectId": 3, "subjectType": 2, "applicableStream": 2 },
      //     { "subjectId": 4, "subjectType": 2, "applicableStream": 3 }
      //   ]
      // }

      await createSubject(apiClient, payload);

      setAlertMessage({
        feMessage: "Subjects assigned to class successfully",
        httpStatus: 200,
      });

      // Refresh the form to show updated assignments
      await handleClassChange(data.classId);

    } catch (error: any) {
      console.error("Error details:", error.response?.data);
      setAlertMessage({
        feMessage: error.response?.data?.title || "Failed to assign subjects to class",
        httpStatus: error.response?.status || 500,
      });
    }
  };

  if (isLoading) return null;

  const initialValues = {
    classId: selectedClass?.value || "",
    coreSubjects: selectedCoreSubjects,
    scienceSubjects: selectedStreamSubjects.Science,
    artsSubjects: selectedStreamSubjects.Arts,
    commercialSubjects: selectedStreamSubjects.Commercial
  };

  return (
    <>
      <MessageDisplay {...alertMessage} />
      <NavigationButton to="">Back</NavigationButton>

      <DynamicForm
        key={selectedClass?.value}
        title="Assign Subjects to Class"
        fields={formFields}
        onSubmit={handleSubmit}
        columns={isSeniorClass ? 2 : 2}
        initialValues={initialValues}
      />
    </>
  );
};

export default CreateSubject;