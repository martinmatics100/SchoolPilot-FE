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
import { useAssetUpload } from "../../../../hooks/useAsset";
import { Button, Box, CircularProgress } from "@mui/material";

const CreateStudent: React.FC = () => {
  const { enums, isLoading } = useEnums({ fetchPermissionData: false });
  const { apiClient, selectedAccount } = useAuth();

  // Use the asset upload hook
  const { upload, isUploading: isPhotoUploading, uploadProgress, error: uploadError, clearError: clearUploadError } = useAssetUpload(selectedAccount);

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
  const [selectedClass, setSelectedClass] = useState<{
    id: string;
    name: string;
    classLevel?: number;
  } | null>(null);

  // State to track uploaded photo asset ID
  const [uploadedPhotoAssetId, setUploadedPhotoAssetId] = useState<string | null>(null);
  const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load classes and branches
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

  // Handle photo file selection
  const handlePhotoSelect = async (file: File) => {
    setSelectedPhotoFile(file);
    setUploadedPhotoAssetId(null);
    clearUploadError();

    // Auto-upload when file is selected
    if (file) {
      setAlertMessage({ feMessage: "Uploading profile picture..." });
      const result = await upload(file);

      if (result) {
        setUploadedPhotoAssetId(result.fileId);
        setAlertMessage({ feMessage: "Profile picture uploaded successfully!" });
        // Clear the success message after 3 seconds
        setTimeout(() => {
          setAlertMessage({});
        }, 3000);
      } else {
        setAlertMessage({ feMessage: "Failed to upload profile picture", httpStatus: 500 });
      }
    }
  };

  // Handle form submission with photo upload
  const handleSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      setAlertMessage({ feMessage: "Creating student..." });

      // Parse numeric fields
      const genderValue = parseInt(data.gender);
      const nationalityValue = parseInt(data.nationality);
      const religiousSubjectValue = parseInt(data.religiousSubject);
      const languageSubjectValue = parseInt(data.languageSubject);

      // Check if photo was selected but not uploaded
      if (selectedPhotoFile && !uploadedPhotoAssetId) {
        setAlertMessage({ feMessage: "Please wait for photo upload to complete..." });
        setIsSubmitting(false);
        return;
      }

      // Prepare payload with photoAssetId if uploaded
      const payload = {
        Student: {
          FirstName: data.firstName,
          LastName: data.lastName,
          DateOfBirth: data.dateOfBirth,
          Gender: genderValue,
          Nationality: nationalityValue,
          Address: data.address,
          Phone: data.phone,
          StudentLocation: data.locationId,
          ClassRoomId: data.classId,
          StreamType: data.streamType ? Number(data.streamType) : null,
          ReligiousSubject: religiousSubjectValue,
          LanguageSubject: languageSubjectValue,
        },
        PhotoAssetId: uploadedPhotoAssetId,
      };

      const response = await createStudent(apiClient, payload);

      if (response.StudentId || response.studentId) {
        setAlertMessage({
          feMessage: `Student ${data.lastName}, ${data.firstName} created successfully!`,
          httpStatus: 200,
        });

        // Reset form after successful submission
        setTimeout(() => {
          // Reset photo state
          setSelectedPhotoFile(null);
          setUploadedPhotoAssetId(null);
          // You might want to redirect or clear the form
          // window.location.href = "/students"; // Uncomment to redirect
        }, 2000);
      } else {
        throw new Error("Unexpected response from server");
      }
    } catch (error: any) {
      setAlertMessage({
        feMessage: "Failed to create student.",
        beMessage: error.message,
        httpStatus: error.status || 500,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Build form fields
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
            enums.Gender?.map((g: any) => ({
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
            enums.Nationality?.map((n: any) => ({
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
        {
          name: "religiousSubject",
          label: "Religious Subject (Select one)",
          type: "radio",
          required: true,
          colSpan: 2,
          options: enums.ReligiousSubjects?.map((r: any) => ({
            value: r.value.toString(),
            label: r.displayName || r.name,
          })) || [],
        },
        {
          name: "languageSubject",
          label: "Language Subject",
          type: "radio",
          required: true,
          colSpan: 2,
          options: enums.LanguageSubjects?.map((l: any) => ({
            value: l.value.toString(),
            label: l.displayName || l.name,
          })) || [],
        },
      ];

      // Insert Stream field right after Class
      if (selectedClass && selectedClass.classLevel === 4) {
        fields.push({
          name: "streamType",
          label: "Stream",
          type: "select",
          required: true,
          colSpan: 1,
          placeholder: "Select Stream",
          options:
            enums.StreamType?.map((s: any) => ({
              value: s.value.toString(),
              label: s.displayName || s.name,
            })) || [],
        });
      }

      // Add address and profile picture fields
      fields.push(
        { name: "address", label: "Home Address", type: "address", colSpan: 3 },
        {
          name: "profilePicture",
          label: "Profile Picture",
          type: "image",
          multiple: false,
          colSpan: 2,
          // Custom onChange handler for the image field
          onChange: (fileData: any) => {
            if (fileData && fileData.file) {
              handlePhotoSelect(fileData.file);
            } else {
              // If file is removed
              setSelectedPhotoFile(null);
              setUploadedPhotoAssetId(null);
            }
          },
          infoText: isPhotoUploading
            ? `Uploading... ${uploadProgress}%`
            : uploadedPhotoAssetId
              ? "✓ Photo uploaded successfully"
              : "Upload a profile picture (max 5MB, JPG/PNG)",
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
    isPhotoUploading,
    uploadProgress,
    uploadedPhotoAssetId,
  ]);

  // Show loading state
  if (isLoading || isLoadingBranches || isLoadingClasses || formFields.length === 0) {
    return <div>Loading form...</div>;
  }

  // Check if submit should be disabled
  const isSubmitDisabled = isPhotoUploading || isSubmitting || (selectedPhotoFile !== null && !uploadedPhotoAssetId);

  return (
    <div>
      <MessageDisplay
        feMessage={alertMessage.feMessage}
        beMessage={alertMessage.beMessage}
        httpStatus={alertMessage.httpStatus}
      />
      {uploadError && (
        <MessageDisplay
          feMessage="Upload Error"
          beMessage={uploadError}
          httpStatus={500}
        />
      )}
      <NavigationButton to="/app/students" sx={{ alignContent: "flex-end" }} variant="outlined">
        Go to Student List
      </NavigationButton>

      {/* Show upload progress indicator if uploading */}
      {isPhotoUploading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
          <CircularProgress size={24} />
          <span>Uploading profile picture... {uploadProgress}%</span>
        </Box>
      )}

      {/* Show success indicator if photo uploaded */}
      {uploadedPhotoAssetId && !isPhotoUploading && (
        <Box sx={{ mb: 2, p: 2, bgcolor: 'success.light', color: 'success.contrastText', borderRadius: 1 }}>
          ✓ Profile picture uploaded successfully!
        </Box>
      )}

      <DynamicForm
        title="Student Form"
        fields={formFields}
        onSubmit={handleSubmit}
        submitButtonText={isPhotoUploading ? "Uploading Photo..." : isSubmitting ? "Creating Student..." : "Submit"}
        columns={3}
        submitDisabled={isSubmitDisabled}
      />
    </div>
  );
};

export default CreateStudent;