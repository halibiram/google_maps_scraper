# Google Maps Scraper

This is simple scraper that uses Playwright to extract data from Google Maps. 

This example is made for educational purposese.

This scrapit is easy to customize.

check both Excel & CSV files (google_maps_data) to see how final data will look like. 

## To Install:
- (Optional: create & activate a virtual environment) `virtualenv venv`, then `source venv/bin/activate` (or `venv\Scripts\activate` on Windows)

- `pip install -r requirements.txt` (this will install Playwright, FastAPI, Uvicorn, Pandas, etc.)
- `playwright install chromium` (to install the necessary browser for Playwright)

## API Usage

The application provides an API endpoint to trigger scraping.

### Running the API Server:

To start the API server, run:
```bash
python main.py
```
The server will start on `http://localhost:8000`.

### Endpoint: `/scrape`

- **Method**: `POST`
- **URL**: `/scrape`
- **Request Body**: JSON object containing:
    - `search_query` (string, required): The search term and location for Google Maps (e.g., "restaurants in London").
    - `total_results` (integer, required): The desired number of results to scrape. Note that the actual number of results may be less if fewer are available.

- **Example Request using `curl`**:
  ```bash
  curl -X POST "http://localhost:8000/scrape" \
       -H "Content-Type: application/json" \
       -d '{"search_query": "dentists in New York", "total_results": 10}'
  ```

- **Example JSON Response**:
  The API will return a JSON array of business objects. Each object will have the following structure:
  ```json
  [
    {
      "name": "Example Dental Clinic",
      "address": "123 Main St, New York, NY 10001, USA",
      "website": "exampledental.com",
      "phone_number": "+1 212-555-1234",
      "reviews_count": 125,
      "reviews_average": 4.7,
      "latitude": 40.7128,
      "longitude": -74.0060
    },
    {
      "name": "Advanced Dentistry NYC",
      "address": "456 Park Ave, New York, NY 10022, USA",
      "website": "advanceddentistry.nyc",
      "phone_number": "+1 212-555-5678",
      "reviews_count": 230,
      "reviews_average": 4.9,
      "latitude": 40.7580,
      "longitude": -73.9752
    }
    // ... more results up to total_results
  ]
  ```
  If no results are found, or an error occurs during scraping for a specific item, it might be skipped or values might be empty strings/null depending on the scraping outcome for that particular field.

## Command-Line Interface (CLI) Usage (Legacy)

The script can also be run directly from the command line for simple, single-shot scraping tasks. This was the original method of operation.

### A single search:
- `python main.py -s="what & where to search for" -t=<how many>`
  (Note: The script name is `main.py`, not `main.py3`. Arguments with spaces should be quoted.)

### Multiple searches at once (via `input.txt`):
1. Add searches in `input.txt`, each search should be in a new line as shown in the example (check `input.txt`).
2. Then run: `python main.py`
3. If you pass `-t=<how many>` using the `-t` flag, it will be applied to all the searches from `input.txt`.

**Note**: The CLI mode is maintained for backward compatibility or simple use cases. For more robust interaction, especially when integrating with other services, the API is recommended. The CLI mode saves output to Excel/CSV files directly, whereas the API returns JSON data.

## Tips:
If you want to search for more than ~120 results (a typical limit for a single Google Maps search page load), the script attempts to scroll to load more. However, for very broad searches, consider making your `search_query` more granular. For example:

- Instead of using:

`United states dentist`

- Use:

`Unites States Boston dentist`

`Unites States New York dentist`

`Unites States Texas dentist`

And so on... 



