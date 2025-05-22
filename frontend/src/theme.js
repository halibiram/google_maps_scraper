import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6750A4', // M3 Primary
    },
    secondary: {
      main: '#7D5260', // M3 Secondary
    },
    background: {
      default: '#FFFBFE', // M3 Surface
      paper: '#FEF7FF',    // M3 Surface Variant (for Cards, etc.)
    },
    text: {
      primary: '#1D1B20', // M3 On Surface
      secondary: '#49454F', // M3 On Surface Variant
    },
    error: {
      main: '#B3261E', // M3 Error
    },
    outline: '#79747E', // M3 Outline
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h6: { // Used in AppBar
      fontWeight: 500,
    },
    // Add other typography adjustments if needed
  },
  shape: {
    borderRadius: 12, // Slightly more rounded for M3 feel on cards/buttons
  },
  components: { // Global overrides for components
    MuiButton: {
      styleOverrides: {
        root: {
          // textTransform: 'none', // M3 buttons often don't use all caps
          // M3 buttons can have a slightly taller default height, but default MUI is usually fine.
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          // Using surface variant color for card background
          backgroundColor: '#FEF7FF', // M3 Surface Variant explicitly for Card
          // M3 Elevation 1
          boxShadow: '0px 1px 3px 1px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.3)',
          // If cards should explicitly use outline variant:
          // borderColor: '#79747E', // This would apply if variant="outlined" is set on Card
        }
      }
    },
    MuiTextField: {
      defaultProps: {
        variant: 'filled', // M3 often features filled text fields
      },
      styleOverrides: {
        root: {
          // Minor adjustments if needed for filled variant to match M3 closer
        }
      }
    },
    MuiAppBar: {
        styleOverrides: {
            root: {
                backgroundColor: '#FFFBFE', // M3 Surface for a "surface" app bar
                color: '#1D1B20', // M3 On Surface text color
                boxShadow: '0px 1px 3px 1px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.3)', // M3 Elevation 1, if desired for app bar
            }
        }
    }
  }
});

export default theme;
