import time
import json
import random
import os
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
from webdriver_manager.chrome import ChromeDriverManager

# Constants
KEYWORDS = ["샌드위치", "케이터링 박스"]
MAX_PRODUCTS_PER_KEYWORD = 3  # Number of products to visit per keyword
MAX_REVIEWS_PER_PRODUCT = 20  # Number of reviews to scrape per product
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "../kakao_data/crawled_reviews")
os.makedirs(OUTPUT_DIR, exist_ok=True)

def setup_driver():
    chrome_options = Options()
    # chrome_options.add_argument("--headless") # Comment out to see the browser action
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
    
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    return driver

def scroll_down(driver):
    driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
    time.sleep(1)

def crawl_naver_shopping_reviews():
    driver = setup_driver()
    all_reviews = []

    try:
        for keyword in KEYWORDS:
            print(f"Starting crawl for keyword: {keyword}")
            search_url = f"https://search.shopping.naver.com/search/all?query={keyword}"
            driver.get(search_url)
            time.sleep(2)
            
            # Scroll a bit to load items
            scroll_down(driver)
            
            # Find product links (Filtering for SmartStore links mainly as they have consistent layout)
            # Selector for product items in list
            product_links = []
            items = driver.find_elements(By.CSS_SELECTOR, "a.product_link__TrAac") # Class names change frequently in Naver
            
            # Adjusted selector based on common Naver structure, but classes like 'basicList_title__3P9Q7' or 'linkAnchor' are common.
            # Using broader catch if specific class fails
            if not items:
                items = driver.find_elements(By.CSS_SELECTOR, "div.basicList_title__3P9Q7 > a")
            
            if not items:
                 # Try another common selector
                items = driver.find_elements(By.CSS_SELECTOR, "a[target='_blank']")

            count = 0
            for item in items:
                if count >= MAX_PRODUCTS_PER_KEYWORD:
                    break
                url = item.get_attribute('href')
                if url and "smartstore.naver.com" in url:
                    product_links.append(url)
                    count += 1
            
            print(f"Found {len(product_links)} SmartStore products for {keyword}")

            for product_url in product_links:
                print(f"Visiting product: {product_url}")
                driver.get(product_url)
                time.sleep(2)
                
                try:
                    # Click 'Review' tab
                    # SmartStore usually has a tab bar. "리뷰" is often the 2nd tab.
                    # Selector: a[role='tab'] with text containing "리뷰"
                    review_tab = WebDriverWait(driver, 5).until(
                        EC.element_to_be_clickable((By.XPATH, "//a[contains(text(), '리뷰')]"))
                    )
                    review_tab.click()
                    time.sleep(1)
                    
                    # Wait for reviews to load
                    WebDriverWait(driver, 5).until(
                        EC.presence_of_element_located((By.CSS_SELECTOR, "ul.review_list_review__...")) or 
                        EC.presence_of_element_located((By.CSS_SELECTOR, "div.review_list")) # Generality
                    )
                except Exception as e:
                    print(f"Could not click review tab script: {e}")
                    # Might be already on review tab or different layout
                    pass
                
                # Scrape Reviews
                soup = BeautifulSoup(driver.page_source, 'html.parser')
                
                # SmartStore Review Text Selectors (classes change, so we look for structural clues)
                # Usually inside a specific container.
                # Inspect text content directly or list items.
                
                review_elements = soup.select("div.review_text") # Generic guess
                if not review_elements:
                     review_elements = soup.select("p.review_text__2lW2j") # Common class
                if not review_elements:
                    review_elements = soup.select(".reviewItems_text__XIsTc") # Another common one
                
                review_count = 0
                for review_el in review_elements:
                    if review_count >= MAX_REVIEWS_PER_PRODUCT: 
                        break
                    text = review_el.get_text(strip=True)
                    if len(text) > 10: # Filter short "Good" reviews
                        all_reviews.append({
                            "keyword": keyword,
                            "source_url": product_url,
                            "text": text
                        })
                        review_count += 1
                
                print(f"  Scraped {review_count} reviews from product.")
                time.sleep(random.uniform(1, 3))

    except Exception as e:
        print(f"Fatal error during crawling: {e}")
    finally:
        driver.quit()
        
    # Save Results
    output_file = os.path.join(OUTPUT_DIR, "reviews_raw.json")
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_reviews, f, ensure_ascii=False, indent=2)
    
    print(f"Saved {len(all_reviews)} reviews to {output_file}")

if __name__ == "__main__":
    crawl_naver_shopping_reviews()
