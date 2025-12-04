import { type SxProps, type Theme } from "@mui/material";
import Box from "@mui/material/Box";

interface CircularImageProps {
    src: string; // Image source URL
    alt?: string; // Alternate text for the image
    size?: number; // Diameter of the circular image
    sx?: SxProps<Theme>; // Additional styles
}

const CircularImage = ({
    src,
    alt = "User Image",
    size = 50,
    sx = {},
}: CircularImageProps) => {
    return (
        <Box
            component="img"
            src={src}
            alt={alt}
            sx={{
                width: `${size}px`, // Add unit explicitly
                height: `${size}px`, // Add unit explicitly
                borderRadius: "50%", // Circular shape
                objectFit: "cover", // Maintain aspect ratio
                display: "block", // Layout consistency
                ...sx, // Merge additional styles
            }}
        />
    );
};

export default CircularImage;
