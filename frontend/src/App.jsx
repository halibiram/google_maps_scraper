import React, { useState } from 'react';
import {
  AppBar, Toolbar, Typography, Container, Box, TextField, Button,
  CircularProgress, Alert, Card, CardContent
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [totalResults, setTotalResults] = useState(10); // Default 10

  // New state variables
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    setIsLoading(true);
    setError(null);
    setResults([]); // Clear previous results

    try {
      const response = await fetch('http://localhost:8000/scrape', { // Ensure backend URL is correct
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          search_query: searchQuery,
          total_results: totalResults, // Ensure this is an integer
        }),
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          // Try to get more specific error message from backend if available
          const errorData = await response.json();
          errorMessage = errorData.detail || errorMessage;
        } catch (e) {
          // Backend did not return JSON or other error, stick with status code
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setResults(data);
    } catch (e) {
      setError(e.message);
      console.error("Scraping error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Google Maps Scraper
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Box component="form" sx={(theme) => ({ // Access theme for border and borderRadius
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          p: 2,
          border: `1px solid ${theme.palette.outline}`,
          borderRadius: theme.shape.borderRadius,
        })}
          onSubmit={(e) => { e.preventDefault(); handleSearch(); }} // Handle form submission via Enter key
        >
          <TextField
            label="What to search for?"
            variant="filled" // Changed to filled as per theme default
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={isLoading}
          />
          <TextField
            label="How many results?"
            variant="filled" // Changed to filled as per theme default
            type="number"
            value={totalResults}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              setTotalResults(val >= 1 ? val : 1); // Ensure at least 1 or a sensible minimum
            }}
            inputProps={{ min: 1 }}
            disabled={isLoading}
          />
          <Button
            type="submit" // Make button submit the form
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={handleSearch} // Still useful for direct click
            disabled={isLoading || !searchQuery.trim()} // Disable if loading or search query is empty
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : "Search"}
          </Button>
        </Box>

        <Box id="results-container" sx={{ mt: 3 }}>
          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
              <CircularProgress />
            </Box>
          )}
          {error && (
            <Alert severity="error" sx={{ my: 2 }}>
              {error}
            </Alert>
          )}
          {!isLoading && !error && results.length === 0 && !searchQuery && ( // Initial state hint
             <Typography sx={{ my: 2, textAlign: 'center', color: 'text.secondary' }}>
                Enter a search query and number of results to begin.
             </Typography>
          )}
          {!isLoading && !error && results.length === 0 && searchQuery && ( // After search, no results
             <Typography sx={{ my: 2, textAlign: 'center', color: 'text.secondary' }}>
                No results found for your query. Try different keywords or a broader search.
             </Typography>
          )}
          {results.length > 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              {results.map((item, index) => (
                <Card key={item.name ? `${item.name}-${index}` : index}> {/* Removed variant="outlined" to use theme's global Card style */}
                  <CardContent>
                    <Typography variant="h6">{item.name || 'N/A'}</Typography>
                    <Typography color="textSecondary" gutterBottom>Address: {item.address || 'N/A'}</Typography>
                    <Typography color="textSecondary">Phone: {item.phone_number || 'N/A'}</Typography>
                    <Typography color="textSecondary">
                      Website: {item.website ? <a href={item.website.startsWith('http') ? item.website : `http://${item.website}`} target="_blank" rel="noopener noreferrer">{item.website}</a> : 'N/A'}
                    </Typography>
                    <Typography color="textSecondary">Reviews: {item.reviews_average !== null && item.reviews_average !== undefined ? item.reviews_average : 'N/A'} ({item.reviews_count !== null && item.reviews_count !== undefined ? item.reviews_count : 0} reviews)</Typography>
                    <Typography color="textSecondary">Coordinates: Lat: {item.latitude || 'N/A'}, Lon: {item.longitude || 'N/A'}</Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Box>
      </Container>
    </>
  );
}

export default App;
