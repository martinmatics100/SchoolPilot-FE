import React, { useState, useRef } from 'react';
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
    alpha,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PhoneNumberInput from '../PhoneNumberInput';
import AddressInput from '../AddressInput';
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import DeleteIcon from '@mui/icons-material/Delete';
import dayjs, { Dayjs } from 'dayjs';
import { getPhoneTypeConfig } from '../../../utils/phoneTypeConfig';

export type FormField = {
    name: string;
    label: string;
    type?: 'text' | 'number' | 'email' | 'password' | 'date' | 'select' | 'multiselect' | 'multiline' | 'phone' | 'address' | 'image';
    required?: boolean;
    errorMessage?: string;
    options?: { value: string; label: string }[];
    rows?: number;
    defaultValue?: any;
    fullWidth?: boolean;
    colSpan?: number;
    multiple?: boolean; // For image upload, whether to allow multiple files
    accept?: string; // For image upload, accepted file types (e.g., 'image/*')
    infoText?: string; // New prop for tooltip info
    extraProps?: Record<string, any>; // Add this line
    onChange?: (value: any) => void; // Add this line
    hidden?: boolean; // Optional field to control visibility
};

type FormProps = {
    title: string;
    fields: FormField[];
    onSubmit: (data: Record<string, any>) => void;
    submitButtonText?: string;
    initialValues?: Record<string, any>;
    spacing?: number;
    columns?: number;
};

const DynamicForm: React.FC<FormProps> = ({
    title,
    fields,
    onSubmit,
    submitButtonText = 'Submit',
    initialValues = {},
    spacing = 2,
    columns = 2,
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Calculate responsive columns
    const getResponsiveColumns = () => {
        if (isMobile) return 1;
        if (isTablet) return Math.min(2, columns);
        return columns;
    };

    const renderLabel = (field: FormField) => {
        const labelContent = (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <span>
                    {field.label}
                    {field.required && <span style={{ color: theme.palette.error.main }}> *</span>}
                </span>
                {field.infoText && (
                    <InfoOutlinedIcon
                        fontSize="small"
                        sx={{
                            color: theme.palette.text.secondary,
                            cursor: 'pointer',
                            '&:hover': {
                                color: theme.palette.primary.main
                            }
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
                        }
                    },
                    arrow: {
                        sx: {
                            color: theme.palette.background.paper,
                            '&:before': {
                                border: `1px solid ${theme.palette.divider}`
                            }
                        }
                    }
                }}
            >
                {labelContent}
            </Tooltip>
        ) : labelContent;
    };

    const [formData, setFormData] = useState<Record<string, any>>(() => {
        const initialData: Record<string, any> = {};
        fields.forEach(field => {
            initialData[field.name] = initialValues[field.name] || field.defaultValue ||
                (field.type === 'multiselect' ? [] :
                    field.type === 'image' ? (field.multiple ? [] : null) :
                        field.type === 'date' ? null : '');
        });
        return initialData;
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (name: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Find the field and call its onChange if it exists
        const field = fields.find(f => f.name === name);
        if (field?.onChange) {
            field.onChange(value);
        }

        if (errors[name]) {
            setErrors(prev => {
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
        handleChange(name, date ? date.format('YYYY-MM-DD') : null);
    };

    const handleImageUpload = (fieldName: string, isMultiple: boolean) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        if (isMultiple) {
            const newFiles = Array.from(files).map(file => ({
                file,
                preview: URL.createObjectURL(file)
            }));
            handleChange(fieldName, [...(formData[fieldName] || []), ...newFiles]);
        } else {
            const file = files[0];
            handleChange(fieldName, {
                file,
                preview: URL.createObjectURL(file)
            });
        }
        e.target.value = ''; // Reset file input
    };

    const removeImage = (fieldName: string, index?: number) => {
        if (index !== undefined) {
            // Remove specific image from multiple
            const updatedImages = [...formData[fieldName]];
            URL.revokeObjectURL(updatedImages[index].preview);
            updatedImages.splice(index, 1);
            handleChange(fieldName, updatedImages);
        } else {
            // Remove single image
            if (formData[fieldName]?.preview) {
                URL.revokeObjectURL(formData[fieldName].preview);
            }
            handleChange(fieldName, null);
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        fields.forEach(field => {
            if (field.required) {
                if (
                    formData[field.name] === '' ||
                    formData[field.name] === null ||
                    formData[field.name] === undefined ||
                    (Array.isArray(formData[field.name]) && formData[field.name].length === 0)
                ) {
                    newErrors[field.name] = field.errorMessage || `${field.label} is required`;
                }

                if (field.type === 'phone' && typeof formData[field.name] === 'object') {
                    const phone = formData[field.name];
                    if (!phone.number) {
                        newErrors[`${field.name}.number`] = field.errorMessage || 'Phone number is required';
                    }
                    if (!phone.phoneType) {
                        newErrors[`${field.name}.phoneType`] = 'Phone type is required';
                    }
                    if (!phone.country) {
                        newErrors[`${field.name}.countryCode`] = 'Country is required';
                    }
                    const phoneTypeId = parseInt(phone.phoneType);
                }

                if (field.type === 'address' && typeof formData[field.name] === 'object') {
                    const address = formData[field.name];
                    if (!address.addressLine1) {
                        newErrors[`${field.name}.addressLine1`] = 'Address line is required';
                    }
                    // if (!address.city) {
                    //     newErrors[`${field.name}.city`] = 'City is required';
                    // }
                    if (!address.postalCode) {
                        newErrors[`${field.name}.postalCode`] = 'Postal code is required';
                    }
                    if (!address.country) {
                        newErrors[`${field.name}.country`] = 'Country is required';
                    }
                    if (!address.state) {
                        newErrors[`${field.name}.state`] = 'State is required';
                    }
                }
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (validateForm()) {
            // Prepare form data for submission
            const submissionData = { ...formData };

            // Convert image objects to File objects for submission
            fields.forEach(field => {
                if (field.type === 'image') {
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
        const accept = field.accept || 'image/*';

        return (
            <FormControl
                fullWidth
                error={!!fieldError}
                sx={{ gridColumn: { xs: 'span 1', sm: `span ${field.colSpan || 1}` } }}
            >
                <FormLabel component="legend" sx={{ mb: 1, display: 'block' }}>
                    {renderLabel(field)}
                </FormLabel>

                <input
                    type="file"
                    accept={accept}
                    multiple={isMultiple}
                    onChange={handleImageUpload(field.name, isMultiple)}
                    style={{ display: 'none' }}
                    ref={fileInputRef}
                    id={`file-upload-${field.name}`}
                />

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {isMultiple ? (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                            {value?.map((img: any, index: number) => (
                                <Box key={index} sx={{ position: 'relative' }}>
                                    <Avatar
                                        src={img.preview}
                                        variant="rounded"
                                        sx={{ width: 100, height: 100 }}
                                    />
                                    <IconButton
                                        size="small"
                                        sx={{
                                            position: 'absolute',
                                            top: 0,
                                            right: 0,
                                            backgroundColor: theme.palette.error.main,
                                            color: 'white',
                                            '&:hover': {
                                                backgroundColor: theme.palette.error.dark,
                                            },
                                        }}
                                        onClick={() => removeImage(field.name, index)}
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            ))}
                        </Box>
                    ) : value ? (
                        <Box sx={{ position: 'relative', width: 'fit-content' }}>
                            <Avatar
                                src={value.preview}
                                variant="rounded"
                                sx={{ width: 100, height: 100 }}
                            />
                            <IconButton
                                size="small"
                                sx={{
                                    position: 'absolute',
                                    top: 0,
                                    right: 0,
                                    backgroundColor: theme.palette.error.main,
                                    color: 'white',
                                    '&:hover': {
                                        backgroundColor: theme.palette.error.dark,
                                    },
                                }}
                                onClick={() => removeImage(field.name)}
                            >
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    ) : null}

                    <Button
                        variant="outlined"
                        component="label"
                        startIcon={<AddAPhotoIcon />}
                        sx={{ alignSelf: 'flex-start' }}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {isMultiple ? 'Add Images' : 'Upload Image'}
                    </Button>
                </Box>

                {fieldError && <FormHelperText error>{fieldError}</FormHelperText>}
            </FormControl>
        );
    };

    const renderField = (field: FormField) => {

        // Skip rendering if field is hidden
        if (field.hidden) {
            return null;
        }

        const fieldError = errors[field.name];
        const value = formData[field.name];

        switch (field.type) {
            case 'select':
                return (
                    <FormControl
                        fullWidth
                        error={!!fieldError}
                        size="small"
                        sx={{
                            gridColumn: { xs: 'span 1', sm: `span ${field.colSpan || 1}` },
                        }}
                    >
                        <InputLabel>{renderLabel(field)}</InputLabel>
                        <Select
                            value={value}
                            label={field.label}
                            onChange={(e) => handleChange(field.name, e.target.value)}
                            MenuProps={{
                                PaperProps: {
                                    style: {
                                        maxHeight: 200,
                                        backgroundColor: theme.palette.background.default,
                                        color: theme.palette.text.secondary,
                                    },
                                },
                            }}
                        >
                            {field.options?.map(option => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </Select>
                        {fieldError && <FormHelperText>{fieldError}</FormHelperText>}
                    </FormControl>
                );

            case 'multiselect':
                return (
                    <FormControl
                        fullWidth
                        error={!!fieldError}
                        size="small"
                        sx={{ gridColumn: { xs: 'span 1', sm: `span ${field.colSpan || 1}` } }}
                    >
                        <InputLabel>{renderLabel(field)}</InputLabel>
                        <Select
                            multiple
                            value={value || []}
                            onChange={(e) => handleChange(field.name, e.target.value)}
                            input={<OutlinedInput label={field.label} />}
                            renderValue={(selected) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {selected.map((value: string) => {
                                        const option = field.options?.find(opt => opt.value === value);
                                        return (
                                            <Chip
                                                key={value}
                                                label={option?.label || value}
                                                size="small"
                                                sx={{
                                                    backgroundColor: theme.palette.text.primary,
                                                    color: theme.palette.text.secondary
                                                }}
                                            />
                                        );
                                    })}
                                </Box>
                            )}
                            MenuProps={{
                                PaperProps: {
                                    style: {
                                        maxHeight: 200,
                                    },
                                },
                            }}
                        >
                            {field.options?.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    <Checkbox
                                        checked={value?.includes(option.value) || false}
                                        sx={{
                                            color: theme.palette.primary.main, // Blue when unchecked
                                            '&.Mui-checked': {
                                                color: theme.palette.error.main, // Red when checked
                                            },
                                        }}
                                    />
                                    <ListItemText primary={option.label} />
                                </MenuItem>
                            ))}
                        </Select>
                        {fieldError && <FormHelperText>{fieldError}</FormHelperText>}
                    </FormControl>
                );

            case 'multiline':
                return (
                    <TextField
                        label={renderLabel(field)}
                        value={value}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        error={!!fieldError}
                        helperText={fieldError}
                        multiline
                        rows={field.rows || 3}
                        fullWidth
                        size="small"
                        sx={{ gridColumn: { xs: 'span 1', sm: `span ${field.colSpan || 1}` } }}
                    />
                );

            case 'phone':
                return (
                    <Box sx={{
                        width: '100%',
                        gridColumn: { xs: 'span 1', sm: `span ${field.colSpan || 1}` }
                    }}>
                        <FormLabel component="legend" sx={{ mb: 1, display: 'block' }}>
                            {renderLabel(field)}
                        </FormLabel>
                        <PhoneNumberInput
                            {...(value || {
                                phoneType: '',
                                countryCode: '',
                                number: '',
                                extension: ''
                            })}
                            onChange={handlePhoneChange(field.name)}
                            errors={{
                                phoneType: errors[`${field.name}.phoneType`],
                                countryCode: errors[`${field.name}.countryCode`],
                                number: errors[`${field.name}.number`] || errors[field.name], // Fallback to general error
                                extension: errors[`${field.name}.extension`]
                            }}
                            enums={field.extraProps?.enums || { PhoneType: [], Country: [] }}
                        />
                    </Box>
                );

            case 'address':
                return (
                    <Box sx={{
                        width: '100%',
                        gridColumn: { xs: 'span 1', sm: `span ${field.colSpan || 1}` }
                    }}>
                        <FormLabel component="legend" sx={{ mb: 1, display: 'block' }}>
                            {renderLabel(field)}
                        </FormLabel>
                        <AddressInput
                            {...(value || {
                                addressLine1: '',
                                // city: '',
                                postalCode: '',
                                country: '',
                                state: ''
                            })}
                            onChange={handleAddressChange(field.name)}
                            errors={{
                                addressLine1: errors[`${field.name}.addressLine1`],
                                // city: errors[`${field.name}.city`],
                                postalCode: errors[`${field.name}.postalCode`],
                                country: errors[`${field.name}.country`],
                                state: errors[`${field.name}.state`]
                            }}
                        />
                    </Box>
                );

            case 'image':
                return renderImageUpload(field);

            case 'date':
                return (
                    <LocalizationProvider dateAdapter={AdapterDayjs} key={field.name}>
                        <DatePicker
                            label={renderLabel(field)}
                            value={value ? dayjs(value) : null}
                            onChange={handleDateChange(field.name)}
                            slotProps={{
                                textField: {
                                    size: 'small',
                                    fullWidth: true,
                                    error: !!fieldError,
                                    helperText: fieldError,
                                },
                            }}
                            sx={{ gridColumn: { xs: 'span 1', sm: `span ${field.colSpan || 1}` } }}
                        />
                    </LocalizationProvider>
                );

            default:
                return (
                    <TextField
                        label={renderLabel(field)}
                        type={field.type || 'text'}
                        value={value}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        error={!!fieldError}
                        helperText={fieldError}
                        fullWidth
                        size="small"
                        sx={{ gridColumn: { xs: 'span 1', sm: `span ${field.colSpan || 1}` } }}
                    />
                );
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Paper elevation={3} sx={{
                p: { xs: 2, sm: 3 },
                color: theme.palette.text.secondary,
                bgcolor: theme.palette.background.default
            }}>
                <Typography variant="h5" component="h2" gutterBottom sx={{
                    textTransform: 'uppercase',
                    fontWeight: "700",
                    fontSize: { xs: '1.25rem', sm: '1.5rem' }
                }}>
                    {title}
                </Typography>

                <Divider sx={{ mb: 3 }} />

                <form onSubmit={handleSubmit}>
                    <Box sx={{
                        display: 'grid',
                        gap: spacing,
                        gridTemplateColumns: `repeat(${getResponsiveColumns()}, 1fr)`,
                        '& > *': {
                            minWidth: 0,
                        }
                    }}>
                        {fields.map((field) => (
                            <React.Fragment key={field.name}>
                                {renderField(field)}
                            </React.Fragment>
                        ))}

                        <Box sx={{
                            gridColumn: '1 / -1',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            mt: 2
                        }}>
                            <Button
                                type="submit"
                                variant="contained"
                                size={isMobile ? 'medium' : 'large'}
                                fullWidth={isMobile}
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