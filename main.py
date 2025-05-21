"""This script serves as an example on how to use Python 
   & Playwright to scrape/extract data from Google Maps"""

from playwright.sync_api import sync_playwright
from dataclasses import dataclass, asdict, field
import pandas as pd
import argparse
import os
import sys
import re

@dataclass
class Business:
    """holds business data"""

    name: str = None
    address: str = None
    website: str = None
    phone_number: str = None
    reviews_count: int = None
    reviews_average: float = None
    latitude: float = None
    longitude: float = None


@dataclass
class BusinessList:
    """holds list of Business objects,
    and save to both excel and csv
    """
    business_list: list[Business] = field(default_factory=list)
    save_at = 'output'

    def dataframe(self):
        """transform business_list to pandas dataframe

        Returns: pandas dataframe
        """
        return pd.json_normalize(
            (asdict(business) for business in self.business_list), sep="_"
        )

    def save_to_excel(self, filename):
        """saves pandas dataframe to excel (xlsx) file

        Args:
            filename (str): filename
        """

        if not os.path.exists(self.save_at):
            os.makedirs(self.save_at)
        self.dataframe().to_excel(f"output/{filename}.xlsx", index=False)

    def save_to_csv(self, filename):
        """saves pandas dataframe to csv file

        Args:
            filename (str): filename
        """

        if not os.path.exists(self.save_at):
            os.makedirs(self.save_at)
        self.dataframe().to_csv(f"output/{filename}.csv", index=False)

def extract_coordinates_from_url(url: str) -> tuple[float,float]:
    """helper function to extract coordinates from url"""
    
    coordinates = url.split('/@')[-1].split('/')[0]
    # return latitude, longitude
    return float(coordinates.split(',')[0]), float(coordinates.split(',')[1])

def main():
    
    ########
    # input 
    ########
    
    # read search from arguments
    parser = argparse.ArgumentParser()
    parser.add_argument("-s", "--search", type=str)
    parser.add_argument("-t", "--total", type=int)
    args = parser.parse_args()
    
    if args.search:
        search_list = [args.search]
        
    if args.total:
        total = args.total
    else:
        # if no total is passed, we set the value to random big number
        total = 1_000_000

    if not args.search:
        search_list = []
        # read search from input.txt file
        input_file_name = 'input.txt'
        # Get the absolute path of the file in the current working directory
        input_file_path = os.path.join(os.getcwd(), input_file_name)
        # Check if the file exists
        if os.path.exists(input_file_path):
        # Open the file in read mode
            with open(input_file_path, 'r') as file:
            # Read all lines into a list
                search_list = file.readlines()
                
        if len(search_list) == 0:
            print('Error occured: You must either pass the -s search argument, or add searches to input.txt')
            sys.exit()
        
    ###########
    # scraping
    ###########
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()

        page.goto("https://www.google.com/maps", timeout=60000)
        # wait is added for dev phase. can remove it in production
        page.wait_for_timeout(5000)
        
        for search_for_index, search_for in enumerate(search_list):
            print(f"-----\n{search_for_index} - {search_for}".strip())

            page.locator('//input[@id="searchboxinput"]').fill(search_for)
            page.wait_for_timeout(3000)

            page.keyboard.press("Enter")
            page.wait_for_timeout(5000)

            # scrolling
            page.hover('//a[contains(@href, "https://www.google.com/maps/place")]')

            # this variable is used to detect if the bot
            # scraped the same number of listings in the previous iteration
            previously_counted = 0
            while True:
                page.mouse.wheel(0, 10000)
                page.wait_for_timeout(3000)

                if (
                    page.locator(
                        '//a[contains(@href, "https://www.google.com/maps/place")]'
                    ).count()
                    >= total
                ):
                    listings = page.locator(
                        '//a[contains(@href, "https://www.google.com/maps/place")]'
                    ).all()[:total]
                    listings = [listing.locator("xpath=..") for listing in listings]
                    print(f"Total Scraped: {len(listings)}")
                    break
                else:
                    # logic to break from loop to not run infinitely
                    # in case arrived at all available listings
                    if (
                        page.locator(
                            '//a[contains(@href, "https://www.google.com/maps/place")]'
                        ).count()
                        == previously_counted
                    ):
                        listings = page.locator(
                            '//a[contains(@href, "https://www.google.com/maps/place")]'
                        ).all()
                        print(f"Arrived at all available\nTotal Scraped: {len(listings)}")
                        break
                    else:
                        previously_counted = page.locator(
                            '//a[contains(@href, "https://www.google.com/maps/place")]'
                        ).count()
                        print(
                            f"Currently Scraped: ",
                            page.locator(
                                '//a[contains(@href, "https://www.google.com/maps/place")]'
                            ).count(),
                        )

            business_list = BusinessList()

            # scraping
            for listing in listings:
                try:
                    listing.click()
                    page.wait_for_timeout(5000)

                    name_attibute = 'aria-label'
                    address_xpath = '//button[@data-item-id="address"]//div[contains(@class, "fontBodyMedium")]'
                    website_xpath = '//a[@data-item-id="authority"]//div[contains(@class, "fontBodyMedium")]'
                    phone_number_xpath = '//button[contains(@data-item-id, "phone:tel:")]//div[contains(@class, "fontBodyMedium")]'
                    review_count_xpath = '//button[@jsaction="pane.reviewChart.moreReviews"]//span'
                    reviews_average_xpath = '//div[@jsaction="pane.reviewChart.moreReviews"]//div[@role="img"]'
                    
                    
                    business = Business()
                    
                    # New name scraping logic
                    name_element_locator = listing.locator('//div[contains(@class, "fontHeadlineSmall")]')
                    name_element = name_element_locator.first if name_element_locator.count() > 0 else None # Ensure name_element is None if not found
                    
                    if name_element and name_element.is_visible():
                        try:
                            name_text = name_element.inner_text(timeout=100).strip()
                            if len(name_text) > 0:
                                business.name = name_text
                            else: # Fallback if inner_text is empty
                                name_value = listing.get_attribute('aria-label')
                                if name_value is not None and len(name_value) >= 1:
                                    business.name = name_value
                                else:
                                    business.name = ""
                        except Exception: # Catch timeout or other errors from inner_text
                            name_value = listing.get_attribute('aria-label')
                            if name_value is not None and len(name_value) >= 1:
                                business.name = name_value
                            else:
                                business.name = ""
                    else: # Fallback if name_element is not found or not visible
                        name_value = listing.get_attribute('aria-label')
                        if name_value is not None and len(name_value) >= 1:
                            business.name = name_value
                        else:
                            business.name = ""
                            
                    if page.locator(address_xpath).count() > 0:
                        business.address = page.locator(address_xpath).first.inner_text() # Use .first with inner_text
                    else:
                        business.address = ""
                    if page.locator(website_xpath).count() > 0:
                        business.website = page.locator(website_xpath).first.inner_text() # Use .first with inner_text
                    else:
                        business.website = ""
                    if page.locator(phone_number_xpath).count() > 0:
                        business.phone_number = page.locator(phone_number_xpath).first.inner_text() # Use .first with inner_text
                    else:
                        business.phone_number = ""

                    # New combined logic for reviews_count and reviews_average
                    review_element_aria_label = None
                    reviews_average_locator = page.locator(reviews_average_xpath) # reviews_average_xpath defined above
                    if reviews_average_locator.count() > 0:
                        review_element_aria_label = reviews_average_locator.first.get_attribute('aria-label')

                    business.reviews_average = None # Default to None
                    business.reviews_count = None   # Default to None

                    # Logic for reviews_average (from aria-label of stars element)
                    if review_element_aria_label:
                        # DEBUG print statement removed
                        rating_match = re.search(r'([\d.,]+)\s*stars', review_element_aria_label, re.IGNORECASE)
                        if rating_match:
                            try:
                                business.reviews_average = float(rating_match.group(1).replace(',', '.'))
                            except ValueError:
                                pass # Keep as None
                        
                        # Special handling for "no reviews" or "be the first to review" in aria-label
                        if "no reviews" in review_element_aria_label.lower() or \
                           "be the first to review" in review_element_aria_label.lower():
                            business.reviews_average = 0.0 # Average is 0.0
                            business.reviews_count = 0   # Count is 0
                    
                    # New logic for reviews_count using the new XPath, if not already set by "no reviews"
                    if business.reviews_count is None: # Only try if not already set to 0 by "no reviews"
                        new_review_count_xpath = '//div[@jsaction="pane.reviewChart.moreReviews"]//span[starts-with(text(), "(")]' # Removed ends-with()
                        review_count_elements = page.locator(new_review_count_xpath)
                        
                        if review_count_elements.count() > 0:
                            try:
                                raw_review_count_text = review_count_elements.first.inner_text(timeout=100) # Added timeout
                                # Extract numbers from text like "(123)" or "(1,234)"
                                count_match_text = re.search(r'\((\d[\d,]*)\)', raw_review_count_text)
                                if count_match_text:
                                    business.reviews_count = int(count_match_text.group(1).replace(',', ''))
                                # If regex doesn't match, reviews_count remains None
                            except Exception: # Catch potential errors from inner_text or regex
                                pass # Keep as None if any error occurs
                        # If element not found, reviews_count remains None
                    
                    business.latitude, business.longitude = extract_coordinates_from_url(page.url)

                    business_list.business_list.append(business)
                except Exception as e:
                    print(f'Error occured while scraping a listing: {e}') # More specific error message
            
            #########
            # output
            #########
            business_list.save_to_excel(f"google_maps_data_{search_for}".replace(' ', '_'))
            business_list.save_to_csv(f"google_maps_data_{search_for}".replace(' ', '_'))

        browser.close()


if __name__ == "__main__":
    main()
