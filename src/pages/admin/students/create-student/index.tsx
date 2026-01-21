import React, { useEffect, useState } from "react";
import DynamicForm, { type FormField } from "../../../../components/my-form";
import { useEnums } from "../../../../hooks/useEnums";
import { useAuth } from "../../../../context";
import MessageDisplay from "../../../../components/message-display";
import { NavigationButton } from "../../../../components/navigation-button";
import { fetchBranches } from "../../../../api/userService";
import { createStudent } from "../../../../api/studentService";
import { type StudentPayload } from "../../../../types/interfaces/i-student";
import { type Branch } from "../../../../types/interfaces/i-user";
import { fetchClasses } from "../../../../api/classServices";

const CreateStudent = () => {
  const { enums, isLoading } = useEnums({ fetchPermissionData: false });
  const { apiClient, selectedAccount } = useAuth();

  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [classes, setClasses] = useState<
    Array<{ id: string; name: string; classLevel?: number }>
  >([]);
  const [alertMessage, setAlertMessage] = useState<{
    feMessage?: string;
    beMessage?: string;
    httpStatus?: number;
  }>({});
  const [isLoadingBranches, setIsLoadingBranches] = useState(true);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);

  // Track selected class object
  const [selectedClass, setSelectedClass] = useState<{
    id: string;
    name: string;
    classLevel?: number;
  } | null>(null);

  useEffect(() => {
    const loadClasses = async () => {
      if (selectedAccount) {
        setIsLoadingClasses(true);
        try {
          const fetchedClasses = await fetchClasses(selectedAccount);
          setClasses(
            fetchedClasses.map((c: any) => ({
              id: c.id,
              name: c.className,
              classLevel: c.classLevel,
            }))
          );
        } catch (err) {
          setAlertMessage({
            feMessage: "Failed to load classes.",
            httpStatus: 500,
          });
        } finally {
          setIsLoadingClasses(false);
        }
      }
    };
    loadClasses();
  }, [selectedAccount]);

  useEffect(() => {
    const loadBranches = async () => {
      if (selectedAccount) {
        setIsLoadingBranches(true);
        try {
          const fetchedBranches = await fetchBranches(
            selectedAccount,
            apiClient
          );
          setBranches(fetchedBranches);
        } catch (err) {
          setAlertMessage({
            feMessage: "Failed to load branches.",
            httpStatus: 500,
          });
        } finally {
          setIsLoadingBranches(false);
        }
      }
    };
    loadBranches();
  }, [apiClient, selectedAccount]);

  const handleSubmit = async (data: any) => {
    try {
      setAlertMessage({ feMessage: "Submitting student data..." });

      data.gender = parseInt(data.gender);
      data.nationality = parseInt(data.nationality);

      const payload: StudentPayload = {
        Student: {
          FirstName: data.firstName,
          LastName: data.lastName,
          DateOfBirth: data.dateOfBirth,
          Gender: data.gender,
          Nationality: data.nationality,
          Address: data.address,
          Phone: data.phone,
          StudentLocation: data.locationId,
          ClassRoomId: data.classId,
          StreamType: data.streamType ? Number(data.streamType) : null,
        },
      };

      const response = await createStudent(apiClient, payload);

      if (response.StudentId || response.studentId) {
        setAlertMessage({
          feMessage: `Student ${data.lastName}, ${data.firstName} created successfully!`,
          httpStatus: 200,
        });
      } else {
        throw new Error("Unexpected response from server");
      }
    } catch (error: any) {
      setAlertMessage({
        feMessage: "Failed to create student.",
        beMessage: error.message,
        httpStatus: error.status || 500,
      });
    }
  };

  useEffect(() => {
    if (!isLoading && !isLoadingBranches && !isLoadingClasses && enums) {
      const fields: FormField[] = [
        {
          name: "firstName",
          label: "First Name",
          type: "text",
          required: true,
          colSpan: 1,
        },
        {
          name: "lastName",
          label: "Last Name",
          type: "text",
          required: true,
          colSpan: 1,
        },
        {
          name: "dateOfBirth",
          label: "Date of Birth",
          type: "date",
          required: true,
          colSpan: 1,
        },
        {
          name: "gender",
          label: "Gender",
          type: "select",
          required: true,
          options:
            enums.Gender?.map((g) => ({
              value: g.value.toString(),
              label: g.displayName || g.name,
            })) || [],
        },
        {
          name: "nationality",
          label: "Nationality",
          type: "select",
          required: true,
          options:
            enums.Nationality?.map((n) => ({
              value: n.value.toString(),
              label: n.displayName || n.name,
            })) || [],
        },
        {
          name: "locationId",
          label: "Branch",
          type: "select",
          required: true,
          options: branches.map((b) => ({ value: b.id, label: b.name })),
        },
        {
          name: "classId",
          label: "Class",
          type: "select",
          required: true,
          colSpan: 1,
          options: classes.map((cls) => ({ value: cls.id, label: cls.name })),
          onChange: (value: string) => {
            const selected = classes.find((c) => c.id === value);
            setSelectedClass(selected || null);
          },
        },
      ];

      // ✅ Insert Stream field right after Class
      if (selectedClass && selectedClass.classLevel === 4) {
        fields.push({
          name: "streamType",
          label: "Stream",
          type: "select",
          required: true,
          colSpan: 1,
          placeholder: "Select Stream",
          options:
            enums.StreamType?.map((s) => ({
              value: s.value.toString(),
              label: s.displayName || s.name,
            })) || [],
        });
      }

      // Continue with the rest of the fields
      fields.push(
        { name: "address", label: "Home Address", type: "address", colSpan: 3 },
        {
          name: "profilePicture",
          label: "Profile Picture",
          type: "image",
          multiple: false,
          colSpan: 2,
        }
      );

      setFormFields(fields);
    }
  }, [
    enums,
    isLoading,
    isLoadingBranches,
    isLoadingClasses,
    branches,
    classes,
    selectedClass,
  ]);
  if (
    isLoading ||
    isLoadingBranches ||
    isLoadingClasses ||
    formFields.length === 0
  ) {
    return <div>Loading form...</div>;
  }

  return (
    <div>
      <MessageDisplay
        feMessage={alertMessage.feMessage}
        beMessage={alertMessage.beMessage}
        httpStatus={alertMessage.httpStatus}
      />
      <NavigationButton to="" sx={{ alignContent: "flex-end" }}>
        Go to Student List
      </NavigationButton>
      <DynamicForm
        title="Student Form"
        fields={formFields}
        onSubmit={handleSubmit}
        submitButtonText="Submit"
        columns={3}
      />
    </div>
  );
};

export default CreateStudent;
