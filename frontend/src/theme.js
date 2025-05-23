// frontend/src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#A0D2DB', // Soft pastel cyan/blue
    },
    secondary: {
      main: '#E5B4B4', // Soft pastel pink/coral
    },
    background: {
      default: '#FDFDFD', // Very light off-white
      paper: '#FFFFFF',   // White for cards/paper elements
    },
    text: {
      primary: '#555555',   // Dark grey
      secondary: '#777777', // Medium grey
    },
    error: {
      main: '#F4C7C7',     // Pastel pink/red
    },
    divider: '#E0E0E0', // For subtle borders/dividers
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h6: { // For AppBar/Title
      fontWeight: 400, // Lighter for minimalist feel
      color: '#444444', // Slightly darker for title emphasis
    },
    button: {
      textTransform: 'none', // Minimalist buttons often don't use all caps
    }
  },
  shape: {
    borderRadius: 8, // Consistent, slightly soft border radius
  },
  components: {
    MuiAppBar: { // If AppBar is kept, make it minimalist
      styleOverrides: {
        root: {
          backgroundColor: 'transparent', // Or background.default for seamless look
          boxShadow: 'none', // No shadow for minimalist
          borderBottom: '1px solid #E0E0E0', // Subtle separator
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Match global shape
          // Hover effects will be handled specifically in the next step
        },
        containedPrimary: { // Example for primary button
            // Styles for primary button if needed beyond default
        },
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          border: '1px solid #E0E0E0', // Subtle border for cards
          boxShadow: 'none', // No shadow for minimalism
          borderRadius: 8, // Consistent with global shape
        }
      }
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined', // Outlined is often cleaner for minimalist
      },
      styleOverrides: {
        root: {
          // Styles for text fields if needed
        }
      }
    },
    MuiAlert: { // For subtle error messages
        styleOverrides: {
            root: { // General styling for all alerts
                borderRadius: 8,
                border: '1px solid transparent', // Base border
            },
            standardError: { // Specific for error alerts
                backgroundColor: '#FFF0F0', // Very light pastel red background
                color: '#B75757', // Darker pastel red for text for readability
                borderColor: '#F4C7C7' // Border color matching error.main
            },
            // Define standardSuccess, standardWarning, standardInfo similarly if needed
        }
    }
  }
});

export default theme;
