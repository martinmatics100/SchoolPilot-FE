import React, { useState, useMemo } from 'react';
import {
    Modal,
    Box,
    Typography,
    Button,
    Checkbox,
    FormControlLabel,
    FormGroup,
    Chip,
    IconButton,
    Divider,
    Alert,
    useMediaQuery,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { type ClassModel } from '../../types/interfaces/i-class';
import { useTheme } from '@mui/material/styles';

export interface ClassSelectionModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (selectedClasses: ClassModel[]) => void;
    availableClasses: ClassModel[];
    existingClasses?: ClassModel[];
    isSubmitting?: boolean;
}

interface ClassTemplate {
    baseName: string;
    hasSections: boolean;
    sections: string[];
    selected: boolean;
    isExisting: boolean; // New field to track if class already exists
}

// Map class names to SchoolLevel enum values
const CLASS_LEVEL_MAPPING: { [key: string]: { level: number, name: string } } = {
    'primary 1': { level: 2, name: 'Primary' },
    'primary 2': { level: 2, name: 'Primary' },
    'primary 3': { level: 2, name: 'Primary' },
    'primary 4': { level: 2, name: 'Primary' },
    'primary 5': { level: 2, name: 'Primary' },
    'primary 6': { level: 2, name: 'Primary' },
    'jss 1': { level: 3, name: 'JuniorSecondary' },
    'jss 2': { level: 3, name: 'JuniorSecondary' },
    'jss 3': { level: 3, name: 'JuniorSecondary' },
    'sss 1': { level: 4, name: 'SeniorSecondary' },
    'sss 2': { level: 4, name: 'SeniorSecondary' },
    'sss 3': { level: 4, name: 'SeniorSecondary' },
};

const ClassSelectionModal: React.FC<ClassSelectionModalProps> = ({
    open,
    onClose,
    onSave,
    availableClasses,
    existingClasses = [],
    isSubmitting = false,
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));
    const [error, setError] = useState<string>('');

    // Generate class templates from available classes and existing classes
    const classTemplates = useMemo(() => {
        const templates: ClassTemplate[] = [];

        availableClasses.forEach(availableClass => {
            // Find all existing classes that match this base class
            const matchingExistingClasses = existingClasses.filter(existing =>
                existing.className.toLowerCase().startsWith(availableClass.className.toLowerCase())
            );

            if (matchingExistingClasses.length > 0) {
                // Class already exists - extract sections and determine if it has sections
                const baseName = availableClass.className;
                const sections: string[] = [];
                let hasSections = false;

                matchingExistingClasses.forEach(existingClass => {
                    // Extract section from class name (e.g., "JSS 1 A" -> "A")
                    const sectionMatch = existingClass.className.substring(baseName.length).trim();
                    if (sectionMatch) {
                        sections.push(sectionMatch);
                        hasSections = true;
                    }
                });

                templates.push({
                    baseName,
                    hasSections,
                    sections,
                    selected: true,
                    isExisting: true,
                });
            } else {
                // Class doesn't exist yet
                templates.push({
                    baseName: availableClass.className,
                    hasSections: false,
                    sections: [],
                    selected: false,
                    isExisting: false,
                });
            }
        });

        return templates;
    }, [availableClasses, existingClasses]);

    // Initialize selectedTemplates with the generated templates
    const [selectedTemplates, setSelectedTemplates] = useState<ClassTemplate[]>(classTemplates);

    // Update selectedTemplates when classTemplates changes
    React.useEffect(() => {
        setSelectedTemplates(classTemplates);
    }, [classTemplates]);

    // Check if a class is a primary class
    const isPrimaryClass = (className: string): boolean => {
        const normalizedName = className.toLowerCase();
        return normalizedName.includes('primary');
    };

    // Get appropriate sections based on class name
    const getSectionsForClass = (className: string): string[] => {
        const normalizedName = className.toLowerCase();

        // Primary classes don't have sections
        if (isPrimaryClass(className)) {
            return [];
        }

        // Secondary classes with streams
        if (normalizedName.includes('ss 2') || normalizedName.includes('ss2') ||
            normalizedName.includes('ss 3') || normalizedName.includes('ss3')) {
            return ['Arts', 'Science', 'Commercial'];
        }

        // Other secondary classes (JSS) have sections
        return ['A', 'B', 'C'];
    };

    // Get section label for display
    const getSectionLabel = (className: string): string => {
        if (isPrimaryClass(className)) {
            return 'sections';
        }

        const normalizedName = className.toLowerCase();
        if (normalizedName.includes('ss 2') || normalizedName.includes('ss2') ||
            normalizedName.includes('ss 3') || normalizedName.includes('ss3')) {
            return 'streams';
        }
        return 'sections';
    };

    // Get class level from class name
    const getClassLevel = (className: string): { level: number, name: string } => {
        const normalizedName = className.toLowerCase();
        return CLASS_LEVEL_MAPPING[normalizedName] || { level: 2, name: 'Primary' };
    };

    // Check if a section already exists for a template
    const isSectionExisting = (template: ClassTemplate, section: string): boolean => {
        return template.isExisting && template.sections.includes(section);
    };

    // Check if all sections are selected for a template
    const areAllSectionsSelected = (template: ClassTemplate): boolean => {
        const availableSections = getSectionsForClass(template.baseName);
        return availableSections.every(section =>
            template.sections.includes(section) || isSectionExisting(template, section)
        );
    };

    const modalStyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: isMobile ? '95vw' : isTablet ? '90vw' : 600,
        maxWidth: '600px',
        maxHeight: '90vh',
        bgcolor: 'background.default',
        boxShadow: 24,
        p: isMobile ? 2 : 4,
        borderRadius: 2,
        overflow: 'auto',
        m: 1,
    };

    const checkboxStyles = {
        mainCheckbox: {
            '& .MuiSvgIcon-root': {
                fontSize: isMobile ? '1.5rem' : '1.75rem',
            },
            '&.Mui-checked': {
                color: theme.palette.grey[900],
                transform: 'scale(1.1)',
            },
            padding: isMobile ? '8px' : '12px',
            marginRight: isMobile ? '8px' : '12px',
        },
        sectionCheckbox: {
            '& .MuiSvgIcon-root': {
                fontSize: isMobile ? '1.25rem' : '1.5rem',
            },
            '&.Mui-checked': {
                color: theme.palette.grey[900],
            },
            padding: isMobile ? '6px' : '8px',
            marginRight: isMobile ? '6px' : '8px',
        }
    };

    const handleTemplateToggle = (index: number) => {
        // Don't allow unchecking existing classes
        if (selectedTemplates[index]?.isExisting) {
            return;
        }

        setSelectedTemplates(prev => {
            const newTemplates = [...prev];
            if (newTemplates[index]) {
                newTemplates[index] = {
                    ...newTemplates[index],
                    selected: !newTemplates[index].selected
                };
            }
            return newTemplates;
        });
    };

    const handleSectionToggle = (templateIndex: number, section: string) => {
        // Don't allow modifying existing sections
        if (isSectionExisting(selectedTemplates[templateIndex], section)) {
            return;
        }

        setSelectedTemplates(prev => {
            const newTemplates = [...prev];
            const template = newTemplates[templateIndex];

            if (template) {
                const sectionIndex = template.sections.indexOf(section);
                const newSections = [...template.sections];

                if (sectionIndex > -1) {
                    newSections.splice(sectionIndex, 1);
                } else {
                    newSections.push(section);
                }

                newTemplates[templateIndex] = {
                    ...template,
                    sections: newSections
                };
            }

            return newTemplates;
        });
    };

    const handleHasSectionsToggle = (index: number) => {
        // Don't allow modifying existing class configurations
        if (selectedTemplates[index]?.isExisting) {
            return;
        }

        setSelectedTemplates(prev => {
            const newTemplates = [...prev];
            if (newTemplates[index]) {
                newTemplates[index] = {
                    ...newTemplates[index],
                    hasSections: !newTemplates[index].hasSections,
                    sections: []
                };
            }
            return newTemplates;
        });
    };

    const handleSave = async () => {
        try {
            const selectedClasses: ClassModel[] = [];

            selectedTemplates.forEach(template => {
                if (template && template.selected) {
                    const classLevelInfo = getClassLevel(template.baseName);

                    // For primary classes, never create sections
                    if (isPrimaryClass(template.baseName)) {
                        // Only add if it doesn't already exist
                        if (!template.isExisting) {
                            selectedClasses.push({
                                id: template.baseName.toLowerCase(),
                                className: template.baseName,
                                classLevel: classLevelInfo.name,
                                formTeacher: '',
                                rawClassLevel: classLevelInfo.level,
                            });
                        }
                    }
                    // For secondary classes with sections enabled
                    else if (template.hasSections && template.sections.length > 0) {
                        // Create classes with sections (only new sections)
                        template.sections.forEach(section => {
                            if (!isSectionExisting(template, section)) {
                                selectedClasses.push({
                                    id: `${template.baseName}-${section}`.toLowerCase(),
                                    className: `${template.baseName} ${section}`,
                                    classLevel: classLevelInfo.name,
                                    formTeacher: '',
                                    rawClassLevel: classLevelInfo.level,
                                });
                            }
                        });
                    } else {
                        // Create class without sections (only if it doesn't exist)
                        if (!template.isExisting) {
                            selectedClasses.push({
                                id: template.baseName.toLowerCase(),
                                className: template.baseName,
                                classLevel: classLevelInfo.name,
                                formTeacher: '',
                                rawClassLevel: classLevelInfo.level,
                            });
                        }
                    }
                }
            });

            if (selectedClasses.length === 0) {
                setError('No new classes to add. All selected classes already exist.');
                return;
            }

            await onSave(selectedClasses);
            setError('');
        } catch (err) {
            setError('Error creating classes. Please try again.');
        }
    };

    const handleClose = () => {
        setSelectedTemplates(classTemplates);
        setError('');
        onClose();
    };

    return (
        <Modal open={open} onClose={handleClose}>
            <Box sx={modalStyle}>
                {/* Header */}
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Typography
                        variant={isMobile ? "h6" : "h5"}
                        component="h2"
                        fontWeight="bold"
                        sx={{ pr: 1 }}
                    >
                        Select Classes for Your School
                    </Typography>
                    <IconButton
                        onClick={handleClose}
                        size="small"
                        sx={{ mt: isMobile ? -0.5 : 0 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>

                <Divider sx={{ mb: 3 }} />

                {/* Instructions */}
                <Typography
                    variant="body2"
                    color="text.secondary"
                    mb={3}
                    sx={{ fontSize: isMobile ? '0.875rem' : '0.9rem' }}
                >
                    Select the classes you want to add to your school. Existing classes are pre-selected and cannot be modified.
                    For secondary classes, you can add additional sections/streams.
                </Typography>

                {/* Error Alert */}
                {error && (
                    <Alert
                        severity="error"
                        sx={{
                            mb: 2,
                            '& .MuiAlert-message': {
                                fontSize: isMobile ? '0.8rem' : '0.875rem'
                            }
                        }}
                    >
                        {error}
                    </Alert>
                )}

                {/* Class Templates */}
                <Box sx={{
                    maxHeight: isMobile ? '50vh' : '400px',
                    overflow: 'auto',
                    pr: isMobile ? 0.5 : 1
                }}>
                    {selectedTemplates.map((template, index) => (
                        <Box
                            key={template.baseName}
                            sx={{
                                mb: 2,
                                p: isMobile ? 1.5 : 2,
                                border: 1,
                                borderColor: template.selected ? 'primary.main' : 'divider',
                                borderRadius: 1,
                                backgroundColor: template.isExisting ? 'action.hover' : 'background.default',
                                transition: 'all 0.2s ease-in-out',
                                boxShadow: template.selected ? 1 : 0,
                                opacity: template.isExisting ? 0.8 : 1,
                            }}
                        >
                            {/* Main Class Selection */}
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={template.selected}
                                        onChange={() => handleTemplateToggle(index)}
                                        sx={checkboxStyles.mainCheckbox}
                                        disabled={template.isExisting}
                                    />
                                }
                                label={
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <Typography
                                            variant={isMobile ? "subtitle1" : "h6"}
                                            fontWeight="bold"
                                            sx={{
                                                fontSize: isMobile ? '0.9rem' : '1rem',
                                                color: template.selected ? 'primary.main' : 'text.primary'
                                            }}
                                        >
                                            {template.baseName}
                                        </Typography>
                                        {template.isExisting && (
                                            <Chip
                                                label="Existing"
                                                size="small"
                                                color="success"
                                                variant="outlined"
                                                sx={{ fontSize: '0.7rem', height: '20px' }}
                                            />
                                        )}
                                    </Box>
                                }
                                sx={{
                                    width: '100%',
                                    m: 0,
                                    alignItems: 'flex-start',
                                }}
                            />

                            {template.selected && (
                                <Box sx={{
                                    ml: isMobile ? 3 : 4,
                                    mt: 1
                                }}>
                                    {/* Sections Toggle - Only show for non-primary classes */}
                                    {!isPrimaryClass(template.baseName) && (
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={template.hasSections}
                                                    onChange={() => handleHasSectionsToggle(index)}
                                                    sx={checkboxStyles.sectionCheckbox}
                                                    disabled={template.isExisting}
                                                />
                                            }
                                            label={
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        fontSize: isMobile ? '0.8rem' : '0.875rem',
                                                        fontWeight: template.hasSections ? 'bold' : 'normal'
                                                    }}
                                                >
                                                    Create with {getSectionLabel(template.baseName)} ({getSectionsForClass(template.baseName).join(', ')})
                                                    {template.isExisting && ' (Existing)'}
                                                </Typography>
                                            }
                                            sx={{ alignItems: 'flex-start' }}
                                        />
                                    )}

                                    {/* Sections Selection - Only show for non-primary classes with sections enabled */}
                                    {!isPrimaryClass(template.baseName) && template.hasSections && (
                                        <Box sx={{ mt: 1 }}>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                mb={1}
                                                sx={{ fontSize: isMobile ? '0.8rem' : '0.875rem' }}
                                            >
                                                Select {getSectionLabel(template.baseName)} to create:
                                            </Typography>
                                            <Box
                                                display="flex"
                                                gap={0.5}
                                                flexWrap="wrap"
                                            >
                                                {getSectionsForClass(template.baseName).map((section) => {
                                                    const isExistingSection = isSectionExisting(template, section);
                                                    return (
                                                        <Chip
                                                            key={section}
                                                            label={section}
                                                            size={isMobile ? "small" : "medium"}
                                                            variant={template.sections.includes(section) || isExistingSection ? "filled" : "outlined"}
                                                            color={isExistingSection ? "success" : template.sections.includes(section) ? "primary" : "default"}
                                                            onClick={() => handleSectionToggle(index, section)}
                                                            clickable={!isExistingSection}
                                                            disabled={isExistingSection}
                                                            sx={{
                                                                mb: 0.5,
                                                                fontSize: isMobile ? '0.75rem' : '0.875rem',
                                                                fontWeight: 'bold',
                                                                transform: (template.sections.includes(section) || isExistingSection) ? 'scale(1.05)' : 'scale(1)',
                                                                transition: 'transform 0.2s ease-in-out',
                                                                opacity: isExistingSection ? 0.7 : 1,
                                                            }}
                                                        />
                                                    );
                                                })}
                                            </Box>
                                            <Typography
                                                variant="caption"
                                                color="text.primary"
                                                mt={1}
                                                sx={{
                                                    display: 'block',
                                                    fontSize: isMobile ? '0.7rem' : '0.75rem'
                                                }}
                                            >
                                                Selected: {[...template.sections, ...getSectionsForClass(template.baseName).filter(s => isSectionExisting(template, s))].join(', ') || 'None'}
                                                {template.sections.length > 0 && ' (Green = existing, Blue = new)'}
                                            </Typography>
                                        </Box>
                                    )}

                                    {/* Preview */}
                                    <Box sx={{
                                        mt: 2,
                                        p: 1.5,
                                        bgcolor: 'background.default',
                                        borderRadius: 1,
                                        border: `1px solid ${theme.palette.success.main}`
                                    }}>
                                        <Typography
                                            variant="caption"
                                            fontWeight="bold"
                                            sx={{
                                                display: 'block',
                                                fontSize: isMobile ? '0.7rem' : '0.75rem',
                                                color: 'success.dark'
                                            }}
                                        >
                                            {template.isExisting ? 'Existing classes:' : 'Will create:'}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                display: 'block',
                                                fontSize: isMobile ? '0.7rem' : '0.75rem',
                                                wordBreak: 'break-word',
                                                color: 'success.dark',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            {isPrimaryClass(template.baseName)
                                                ? template.baseName
                                                : template.hasSections
                                                    ? [
                                                        ...getSectionsForClass(template.baseName).filter(s => isSectionExisting(template, s)).map(s => `${template.baseName} ${s} (existing)`),
                                                        ...template.sections.map(s => `${template.baseName} ${s} (new)`)
                                                    ].filter(Boolean).join(', ') || template.baseName
                                                    : template.baseName
                                            }
                                        </Typography>
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    ))}
                </Box>

                {/* Action Buttons */}
                <Box
                    display="flex"
                    justifyContent="flex-end"
                    gap={1}
                    mt={3}
                    flexDirection={isMobile ? 'column' : 'row'}
                >
                    <Button
                        onClick={handleClose}
                        variant="outlined"
                        fullWidth={isMobile}
                        size={isMobile ? "medium" : "large"}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        color="primary"
                        fullWidth={isMobile}
                        size={isMobile ? "medium" : "large"}
                        disabled={isSubmitting}
                        sx={{
                            fontWeight: 'bold',
                            fontSize: isMobile ? '0.9rem' : '1rem'
                        }}
                    >
                        {isSubmitting ? 'Creating Classes...' : 'Add Selected Classes'}
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default ClassSelectionModal;