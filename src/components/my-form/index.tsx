import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Divider,
  TextField,
  FormControl,
  FormLabel,
  FormHelperText,
  FormControlLabel,
  Select,
  InputLabel,
  MenuItem,
  Checkbox,
  ListItemText,
  OutlinedInput,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { RadioGroup, Radio } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PhoneNumberInput from "../phoneNumberInput";
import AddressInput from "../addressInput";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import DeleteIcon from "@mui/icons-material/Delete";
import dayjs, { Dayjs } from "dayjs";
import Autocomplete from "@mui/material/Autocomplete";
import CircularProgress from "@mui/material/CircularProgress";

export type FormField = {
  name: string;
  label: string;
  type?:
    | "text"
    | "number"
    | "email"
    | "password"
    | "date"
    | "select"
    | "multiselect"
    | "multiline"
    | "phone"
    | "address"
    | "image"
    | "typeahead"
  | "checkbox"
  | "radio";
  required?: boolean;
  errorMessage?: string;
  options?: { value: string; label: string }[];
  rows?: number;
  defaultValue?: any;
  fullWidth?: boolean;
  colSpan?: number;
  multiple?: boolean;
  accept?: string;
  infoText?: string;
  extraProps?: Record<string, any>;
  onChange?: (value: any) => void;
  hidden?: boolean;
  placeholder?: string;
  fetchOptions?: (query: string) => Promise<{ value: string; label: string }[]>;
  debounceMs?: number;
  readOnly?: boolean;
};

type FormProps = {
  title: string;
  fields: FormField[];
  onSubmit: (data: Record<string, any>) => void;
  submitButtonText?: string;
  initialValues?: Record<string, any>;
  spacing?: number;
  columns?: number;
  submitDisabled?: boolean;
};

const DynamicForm: React.FC<FormProps> = ({
  title,
  fields,
  onSubmit,
  submitButtonText = "Submit",
  initialValues = {},
  spacing = 2,
  columns = 2,
  submitDisabled = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [typeaheadOptions, setTypeaheadOptions] = useState<Record<string, any[]>>({});
  const [typeaheadLoading, setTypeaheadLoading] = useState<Record<string, boolean>>({});

  const prevInitialValuesJsonRef = useRef(JSON.stringify(initialValues));

  const getResponsiveColumns = () => {
    if (isMobile) return 1;
    if (isTablet) return Math.min(2, columns);
    return columns;
  };

  const renderLabel = (field: FormField) => {
    const labelContent = (
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <span>
          {field.label}
          {field.required && !field.readOnly && (
            <span style={{ color: theme.palette.error.main }}> *</span>
          )}
          {field.readOnly && (
            <span
              style={{
                fontStyle: "italic",
                marginLeft: 4,
                fontSize: "0.75rem",
                color: theme.palette.text.secondary,
              }}
            >
              (Read Only)
            </span>
          )}
        </span>
        {field.infoText && (
          <InfoOutlinedIcon
            fontSize="small"
            sx={{
              color: theme.palette.text.secondary,
              cursor: "pointer",
              "&:hover": {
                color: theme.palette.primary.main,
              },
            }}
          />
        )}
      </Box>
    );

    return field.infoText ? (
      <Tooltip
        title={field.infoText}
        arrow
        placement="top"
        slotProps={{
          tooltip: {
            sx: {
              bgcolor: theme.palette.background.default,
              color: theme.palette.text.secondary,
              border: `2px solid ${theme.palette.divider}`,
              maxWidth: 300,
            },
          },
          arrow: {
            sx: {
              color: theme.palette.background.paper,
              "&:before": {
                border: `1px solid ${theme.palette.divider}`,
              },
            },
          },
        }}
      >
        {labelContent}
      </Tooltip>
    ) : (
      labelContent
    );
  };

  const [formData, setFormData] = useState<Record<string, any>>(() => {
    const newFormData: Record<string, any> = {};
    fields.forEach((field) => {
      if (initialValues.hasOwnProperty(field.name) && initialValues[field.name] !== undefined) {
        newFormData[field.name] = initialValues[field.name];
      } else {
        newFormData[field.name] = field.defaultValue ?? (field.type === "checkbox" ? false : field.type === "multiselect" ? [] : field.type === "image" ? (field.multiple ? [] : null) : field.type === "date" ? null : field.type === "phone" ? { phoneType: "", country: "", number: "", extension: "" } : field.type === "address" ? { addressLine1: "", postalCode: "", country: "", state: "" } : "");
      }
    });
    return newFormData;
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const currentInitialValuesJson = JSON.stringify(initialValues);

    if (currentInitialValuesJson !== prevInitialValuesJsonRef.current) {
      const newFormData: Record<string, any> = { ...formData };
      let hasChanges = false;

      fields.forEach((field) => {
        if (initialValues.hasOwnProperty(field.name) && initialValues[field.name] !== undefined) {
          if (JSON.stringify(newFormData[field.name]) !== JSON.stringify(initialValues[field.name])) {
            newFormData[field.name] = initialValues[field.name];
            hasChanges = true;
          }
        }
      });

      if (hasChanges) {
        setFormData(newFormData);
        setErrors({});
      }

      prevInitialValuesJsonRef.current = currentInitialValuesJson;
    }
  }, [initialValues, fields]);

  const handleChange = (name: string, value: any) => {
    const field = fields.find((f) => f.name === name);

    if (field?.readOnly) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (field?.onChange) {
      field.onChange(value);
    }

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handlePhoneChange = (name: string) => (phoneData: any) => {
    handleChange(name, phoneData);
  };

  const handleAddressChange = (name: string) => (addressData: any) => {
    handleChange(name, addressData);
  };

  const handleDateChange = (name: string) => (date: Dayjs | null) => {
    handleChange(name, date ? date.format("YYYY-MM-DD") : null);
  };

  const handleImageUpload =
    (fieldName: string, isMultiple: boolean) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const field = fields.find((f) => f.name === fieldName);

        if (field?.readOnly) {
          return;
        }

        const files = e.target.files;
        if (!files || files.length === 0) return;

        if (isMultiple) {
          const newFiles = Array.from(files).map((file) => ({
            file,
            preview: URL.createObjectURL(file),
          }));
          handleChange(fieldName, [...(formData[fieldName] || []), ...newFiles]);
        } else {
          const file = files[0];
          handleChange(fieldName, {
            file,
            preview: URL.createObjectURL(file),
          });
        }
        e.target.value = "";
      };

  const removeImage = (fieldName: string, index?: number) => {
    const field = fields.find((f) => f.name === fieldName);

    if (field?.readOnly) {
      return;
    }

    if (index !== undefined) {
      const updatedImages = [...formData[fieldName]];
      URL.revokeObjectURL(updatedImages[index].preview);
      updatedImages.splice(index, 1);
      handleChange(fieldName, updatedImages);
    } else {
      if (formData[fieldName]?.preview) {
        URL.revokeObjectURL(formData[fieldName].preview);
      }
      handleChange(fieldName, null);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    fields.forEach((field) => {
      if (field.readOnly || field.hidden) {
        return;
      }

      if (field.required) {
        const value = formData[field.name];

        if (value === "" || value === null || value === undefined || (Array.isArray(value) && value.length === 0)) {
          newErrors[field.name] = field.errorMessage || `${field.label} is required`;
        }

        if (field.type === "phone" && typeof value === "object") {
          if (!value?.number) {
            newErrors[`${field.name}.number`] = field.errorMessage || "Phone number is required";
          }
          if (!value?.phoneType) {
            newErrors[`${field.name}.phoneType`] = "Phone type is required";
          }
          if (!value?.country) {
            newErrors[`${field.name}.country`] = "Country is required";
          }
        }

        if (field.type === "address" && typeof value === "object") {
          if (!value?.addressLine1) {
            newErrors[`${field.name}.addressLine1`] = "Address line is required";
          }
          if (!value?.postalCode) {
            newErrors[`${field.name}.postalCode`] = "Postal code is required";
          }
          if (!value?.country) {
            newErrors[`${field.name}.country`] = "Country is required";
          }
          if (!value?.state) {
            newErrors[`${field.name}.state`] = "State is required";
          }
        }

        if (field.type === "checkbox" && field.required && !value) {
          newErrors[field.name] = field.errorMessage || `${field.label} is required`;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      const submissionData = { ...formData };

      fields.forEach((field) => {
        if (field.type === "image" && !field.readOnly) {
          if (field.multiple) {
            submissionData[field.name] = submissionData[field.name]?.map((img: any) => img.file) || [];
          } else {
            submissionData[field.name] = submissionData[field.name]?.file || null;
          }
        }
      });

      onSubmit(submissionData);
    }
  };

  const renderImageUpload = (field: FormField) => {
    const fieldError = errors[field.name];
    const value = formData[field.name];
    const isMultiple = field.multiple || false;
    const accept = field.accept || "image/*";
    const isReadOnly = field.readOnly || false;

    return (
      <FormControl
        fullWidth
        error={!!fieldError}
        key={field.name}
        sx={{ gridColumn: { xs: "span 1", sm: `span ${field.colSpan || 1}` } }}
      >
        <FormLabel component="legend" sx={{ mb: 1, display: "block" }}>
          {renderLabel(field)}
        </FormLabel>

        {!isReadOnly && (
          <input
            type="file"
            accept={accept}
            multiple={isMultiple}
            onChange={handleImageUpload(field.name, isMultiple)}
            style={{ display: "none" }}
            ref={fileInputRef}
            id={`file-upload-${field.name}`}
          />
        )}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {isMultiple ? (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
              {Array.isArray(value) &&
                value.map((img: any, index: number) => (
                  <Box key={`${field.name}-${index}`} sx={{ position: "relative" }}>
                    <Avatar src={img.preview} variant="rounded" sx={{ width: 100, height: 100 }} />
                    {!isReadOnly && (
                      <IconButton
                        size="small"
                        sx={{
                          position: "absolute",
                          top: 0,
                          right: 0,
                          backgroundColor: theme.palette.error.main,
                          color: "white",
                          "&:hover": { backgroundColor: theme.palette.error.dark },
                        }}
                        onClick={() => removeImage(field.name, index)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                ))}
            </Box>
          ) : value && typeof value === "object" && value !== null ? (
            <Box sx={{ position: "relative", width: "fit-content" }}>
                <Avatar src={value.preview} variant="rounded" sx={{ width: 100, height: 100 }} />
                {!isReadOnly && (
                  <IconButton
                    size="small"
                    sx={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      backgroundColor: theme.palette.error.main,
                      color: "white",
                      "&:hover": { backgroundColor: theme.palette.error.dark },
                    }}
                    onClick={() => removeImage(field.name)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
            </Box>
          ) : null}

          {!isReadOnly && (
            <Button
              variant="outlined"
              component="label"
              startIcon={<AddAPhotoIcon />}
              sx={{ alignSelf: "flex-start" }}
              onClick={() => fileInputRef.current?.click()}
            >
              {isMultiple ? "Add Images" : "Upload Image"}
            </Button>
          )}
        </Box>

        {fieldError && <FormHelperText error>{fieldError}</FormHelperText>}
      </FormControl>
    );
  };

  const renderField = (field: FormField) => {
    if (field.hidden) {
      return null;
    }

    const fieldError = errors[field.name];
    const value = formData[field.name];
    const isReadOnly = field.readOnly || false;

    switch (field.type) {
      case "select":
        return (
          <FormControl
            key={field.name}
            fullWidth
            error={!!fieldError}
            size="small"
            sx={{
              gridColumn: { xs: "span 1", sm: `span ${field.colSpan || 1}` },
              "& .MuiInputLabel-root": {
                color: "inherit",
              },
              "& .MuiOutlinedInput-root": {
                "& input": {
                  color: isReadOnly ? theme.palette.text.secondary : "inherit",
                },
                "& fieldset": {
                  borderColor: "inherit",
                },
              },
            }}
          >
            <InputLabel shrink={true}>{renderLabel(field)}</InputLabel>
            <Select
              value={value ?? ""}
              label={renderLabel(field)}
              onChange={(e) => handleChange(field.name, e.target.value)}
              readOnly={isReadOnly}
              disabled={isReadOnly}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 200,
                    backgroundColor: theme.palette.background.default,
                    color: theme.palette.text.secondary,
                  },
                },
              }}
              displayEmpty
              renderValue={(selected) => {
                if (selected === "" || selected === undefined || selected === null) {
                  return (
                    <span
                      style={{
                        color: isReadOnly ? theme.palette.text.secondary : theme.palette.text.secondary,
                        fontStyle: "italic",
                      }}
                    >
                      {field.placeholder || "Select an option"}
                    </span>
                  );
                }
                const selectedOption = field.options?.find((opt) => opt.value === selected);
                return (
                  <span style={{ color: isReadOnly ? theme.palette.text.secondary : theme.palette.text.secondary }}>
                    {selectedOption?.label || selected}
                  </span>
                );
              }}
              sx={{
                "& .MuiSelect-select": {
                  color: isReadOnly ? theme.palette.text.secondary : theme.palette.text.secondary,
                },
              }}
            >
              <MenuItem value="" disabled>
                <em>{field.placeholder || "Select an option"}</em>
              </MenuItem>
              {field.options?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {fieldError && <FormHelperText>{fieldError}</FormHelperText>}
          </FormControl>
        );

      case "multiselect":
        return (
          <FormControl
            key={field.name}
            fullWidth
            error={!!fieldError}
            size="small"
            sx={{
              gridColumn: { xs: "span 1", sm: `span ${field.colSpan || 1}` },
            }}
          >
            <InputLabel shrink={true}>{renderLabel(field)}</InputLabel>
            <Select
              multiple
              value={Array.isArray(value) ? value : []}
              onChange={(e) => handleChange(field.name, e.target.value)}
              input={<OutlinedInput label={renderLabel(field)} />}
              readOnly={isReadOnly}
              disabled={isReadOnly}
              renderValue={(selected) => {
                if (selected.length === 0) {
                  return (
                    <span
                      style={{
                        color: isReadOnly ? theme.palette.text.secondary : theme.palette.text.secondary,
                        fontStyle: "italic",
                      }}
                    >
                      {field.placeholder || "Select options"}
                    </span>
                  );
                }
                return (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((value: string) => {
                      const option = field.options?.find((opt) => opt.value === value);
                      return (
                        <Chip
                          key={value}
                          label={option?.label || value}
                          size="small"
                          sx={{
                            backgroundColor: isReadOnly ? theme.palette.grey[400] : theme.palette.primary.main,
                            color: theme.palette.primary.contrastText,
                          }}
                        />
                      );
                    })}
                  </Box>
                );
              }}
              MenuProps={{
                PaperProps: { style: { maxHeight: 200 } },
              }}
              sx={{
                "& .MuiSelect-select": {
                  color: isReadOnly ? theme.palette.text.secondary : "inherit",
                },
              }}
            >
              {field.options?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  <Checkbox checked={Array.isArray(value) && value.includes(option.value)} />
                  <ListItemText primary={option.label} />
                </MenuItem>
              ))}
            </Select>
            {fieldError && <FormHelperText>{fieldError}</FormHelperText>}
          </FormControl>
        );

      case "multiline":
        return (
          <TextField
            key={field.name}
            label={renderLabel(field)}
            value={value ?? ""}
            onChange={(e) => handleChange(field.name, e.target.value)}
            error={!!fieldError}
            helperText={fieldError}
            multiline
            rows={field.rows || 3}
            fullWidth
            size="small"
            placeholder={field.placeholder}
            InputLabelProps={{ shrink: true }}
            InputProps={{
              readOnly: isReadOnly,
              sx: {
                color: isReadOnly ? theme.palette.text.secondary : "inherit",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "inherit",
                },
              },
            }}
            sx={{
              gridColumn: { xs: "span 1", sm: `span ${field.colSpan || 1}` },
            }}
          />
        );

      case "phone":
        return (
          <Box
            key={field.name}
            sx={{
              width: "100%",
              gridColumn: { xs: "span 1", sm: `span ${field.colSpan || 1}` },
            }}
          >
            <FormLabel component="legend" sx={{ mb: 1, display: "block" }}>
              {renderLabel(field)}
            </FormLabel>
            <PhoneNumberInput
              {...(value || { phoneType: "", country: "", number: "", extension: "" })}
              onChange={handlePhoneChange(field.name)}
              errors={{
                phoneType: errors[`${field.name}.phoneType`],
                country: errors[`${field.name}.country`],
                number: errors[`${field.name}.number`] || errors[field.name],
                extension: errors[`${field.name}.extension`],
              }}
              enums={field.extraProps?.enums || { PhoneType: [], Country: [] }}
              placeholder={field.placeholder}
              readOnly={isReadOnly}
              readOnlyColor={theme.palette.text.secondary}
            />
          </Box>
        );

      case "address":
        return (
          <Box
            key={field.name}
            sx={{
              width: "100%",
              gridColumn: { xs: "span 1", sm: `span ${field.colSpan || 1}` },
            }}
          >
            <FormLabel component="legend" sx={{ mb: 1, display: "block" }}>
              {renderLabel(field)}
            </FormLabel>
            <AddressInput
              {...(value || { addressLine1: "", postalCode: "", country: "", state: "" })}
              onChange={handleAddressChange(field.name)}
              errors={{
                addressLine1: errors[`${field.name}.addressLine1`],
                postalCode: errors[`${field.name}.postalCode`],
                country: errors[`${field.name}.country`],
                state: errors[`${field.name}.state`],
              }}
              placeholder={field.placeholder}
              readOnly={isReadOnly}
              readOnlyColor={theme.palette.text.secondary}
            />
          </Box>
        );

      case "image":
        return renderImageUpload(field);

      case "date":
        return (
          <LocalizationProvider dateAdapter={AdapterDayjs} key={field.name}>
            <DatePicker
              label={renderLabel(field)}
              value={value ? dayjs(value) : null}
              onChange={(newValue) => {
                if (newValue === null) {
                  handleDateChange(field.name)(null);
                } else if (dayjs.isDayjs(newValue)) {
                  handleDateChange(field.name)(newValue);
                } else {
                  handleDateChange(field.name)(dayjs(newValue as string | Date));
                }
              }}
              readOnly={isReadOnly}
              disabled={isReadOnly}
              slotProps={{
                textField: {
                  size: "small",
                  fullWidth: true,
                  error: !!fieldError,
                  helperText: fieldError,
                  placeholder: field.placeholder,
                  InputLabelProps: { shrink: true },
                  InputProps: {
                    readOnly: isReadOnly,
                    sx: {
                      color: isReadOnly ? theme.palette.text.secondary : "inherit",
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "inherit",
                      },
                    },
                  },
                },
              }}
              sx={{ gridColumn: { xs: "span 1", sm: `span ${field.colSpan || 1}` } }}
            />
          </LocalizationProvider>
        );

      case "typeahead": {
        const options = typeaheadOptions[field.name] || [];
        const loading = typeaheadLoading[field.name] || false;

        return (
          <Autocomplete
            key={field.name}
            sx={{
              gridColumn: { xs: "span 1", sm: `span ${field.colSpan || 1}` },
            }}
            options={options}
            getOptionLabel={(option) => option.label}
            value={options.find((o) => o.value === value) || null}
            loading={loading}
            onInputChange={async (_, inputValue) => {
              if (isReadOnly || !field.fetchOptions || inputValue.length < 2) return;
              setTypeaheadLoading((prev) => ({ ...prev, [field.name]: true }));
              try {
                const result = await field.fetchOptions(inputValue);
                setTypeaheadOptions((prev) => ({ ...prev, [field.name]: result }));
              } finally {
                setTypeaheadLoading((prev) => ({ ...prev, [field.name]: false }));
              }
            }}
            onChange={(_, selected) => {
              if (!isReadOnly) {
                handleChange(field.name, selected?.value || "");
              }
            }}
            readOnly={isReadOnly}
            disabled={isReadOnly}
            renderInput={(params) => (
              <TextField
                {...params}
                label={renderLabel(field)}
                size="small"
                error={!!fieldError}
                helperText={fieldError}
                placeholder={field.placeholder}
                InputProps={{
                  ...params.InputProps,
                  readOnly: isReadOnly,
                  sx: {
                    color: isReadOnly ? theme.palette.text.secondary : "inherit",
                  },
                  endAdornment: (
                    <>
                      {loading && <CircularProgress size={20} />}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        );
      }

      case "checkbox":
        return (
          <FormControl
            key={field.name}
            error={!!fieldError}
            sx={{
              gridColumn: { xs: "span 1", sm: `span ${field.colSpan || 1}` },
              display: "inline-flex",
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={Boolean(value)}
                  onChange={(e) => handleChange(field.name, e.target.checked)}
                  disabled={isReadOnly}
                  sx={{
                    color: isReadOnly ? theme.palette.text.secondary : "inherit",
                    "&.Mui-checked": {
                      color: isReadOnly ? theme.palette.text.secondary : "inherit",
                    },
                  }}
                />
              }
              label={renderLabel(field)}
            />
            {fieldError && <FormHelperText error>{fieldError}</FormHelperText>}
          </FormControl>
        );

      case "radio":
        return (
          <FormControl
            key={field.name}
            error={!!fieldError}
            sx={{
              gridColumn: { xs: "span 1", sm: `span ${field.colSpan || 1}` },
            }}
          >
            <FormLabel>{renderLabel(field)}</FormLabel>
            <RadioGroup row value={value ?? ""} onChange={(e) => !isReadOnly && handleChange(field.name, e.target.value)}>
              {field.options?.map((option) => (
                <FormControlLabel
                  key={option.value}
                  value={option.value}
                  control={
                    <Radio
                      sx={{
                        color: isReadOnly ? theme.palette.text.secondary : "inherit",
                        "&.Mui-checked": {
                          color: isReadOnly ? theme.palette.text.secondary : "inherit",
                        },
                      }}
                    />
                  }
                  label={option.label}
                  disabled={isReadOnly}
                />
              ))}
            </RadioGroup>
            {fieldError && <FormHelperText error>{fieldError}</FormHelperText>}
          </FormControl>
        );

      default:
        return (
          <TextField
            key={field.name}
            label={renderLabel(field)}
            type={field.type || "text"}
            value={value ?? ""}
            onChange={(e) => handleChange(field.name, e.target.value)}
            error={!!fieldError}
            helperText={fieldError}
            fullWidth
            size="small"
            placeholder={field.placeholder}
            InputLabelProps={{ shrink: true }}
            InputProps={{
              readOnly: isReadOnly,
              sx: {
                color: isReadOnly ? theme.palette.text.secondary : "inherit",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "inherit",
                },
              },
            }}
            sx={{
              gridColumn: { xs: "span 1", sm: `span ${field.colSpan || 1}` },
            }}
          />
        );
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Paper
        elevation={3}
        sx={{
          p: { xs: 2, sm: 3 },
          color: theme.palette.text.secondary,
          bgcolor: theme.palette.background.default,
        }}
      >
        <Typography
          variant="h5"
          component="h2"
          gutterBottom
          sx={{
            textTransform: "uppercase",
            fontWeight: "700",
            fontSize: { xs: "1.25rem", sm: "1.5rem" },
          }}
        >
          {title}
        </Typography>

        <Divider sx={{ mb: 3 }} />

        <form onSubmit={handleSubmit}>
          <Box
            sx={{
              display: "grid",
              gap: spacing,
              gridTemplateColumns: `repeat(${getResponsiveColumns()}, 1fr)`,
              "& > *": { minWidth: 0 },
            }}
          >
            {fields.map((field) => renderField(field))}

            <Box
              sx={{
                gridColumn: "1 / -1",
                display: "flex",
                justifyContent: "flex-end",
                mt: 2,
              }}
            >
              <Button
                type="submit"
                variant="contained"
                size={isMobile ? "medium" : "large"}
                fullWidth={isMobile}
                disabled={submitDisabled || fields.every((f) => f.readOnly)}
              >
                {submitButtonText}
              </Button>
            </Box>
          </Box>
        </form>
      </Paper>
    </LocalizationProvider>
  );
};

export default DynamicForm;