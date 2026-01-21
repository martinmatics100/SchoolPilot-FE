import React, { useMemo, useState } from "react";
import DynamicForm, { type FormField } from "../../../../components/my-form";
import MessageDisplay from "../../../../components/message-display";
import { NavigationButton } from "../../../../components/navigation-button";
import { useEnums } from "../../../../hooks/useEnums";
import { useAuth } from "../../../../context";
import { createClass } from "../../../../api/classServices";

const CreateClass = () => {
  const { enums, isLoading } = useEnums({ fetchPermissionData: false });
  const { apiClient } = useAuth();

  const [alertMessage, setAlertMessage] = useState<any>({});

  /**
   * SchoolClass enum → typeahead options
   */
  const schoolClassOptions = useMemo(() => {
    return (
      enums?.SchoolClassRooms?.map((c: any) => ({
        value: c.value.toString(),
        label: c.displayName || c.name,
      })) || []
    );
  }, [enums]);

  /**
   * ClassLevel enum → dropdown
   */
  const classLevelOptions = useMemo(() => {
    return (
      enums?.SchoolLevel?.map((l: any) => ({
        value: l.value.toString(),
        label: l.displayName || l.name,
      })) || []
    );
  }, [enums]);

  /**
   * Typeahead filter for classes
   */
  const fetchSchoolClasses = async (query: string) => {
    if (!query) return [];
    return schoolClassOptions.filter((c) =>
      c.label.toLowerCase().includes(query.toLowerCase())
    );
  };

  const formFields: FormField[] = [
    {
      name: "schoolClass",
      label: "Class",
      type: "typeahead",
      required: true,
      placeholder: "Type to search class (e.g. SS1, JSS2)",
      fetchOptions: fetchSchoolClasses,
    },
    {
      name: "classLevel",
      label: "Class Level",
      type: "select",
      required: true,
      options: classLevelOptions,
      placeholder: "Select class level",
    },
  ];

  /**
   * Submit handler
   */
  const handleSubmit = async (data: any) => {
    try {
      const payload = {
        classValue: Number(data.schoolClass),
        classLevel: Number(data.classLevel),
      };

      await createClass(apiClient, payload);

      setAlertMessage({
        feMessage: "Class created successfully",
        httpStatus: 200,
      });
    } catch (error: any) {
      setAlertMessage({
        feMessage: error?.response?.message || "Failed to create class",
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
        title="Create Class"
        fields={formFields}
        onSubmit={handleSubmit}
        columns={2}
      />
    </>
  );
};

export default CreateClass;
