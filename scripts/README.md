# MeaningFill Data & Utility Scripts

This directory contains utility scripts for data processing, synthetic data generation, and SEO tasks.

## Data Processing
- **`extract_zip.py`**: Robust ZIP extractor (handles nested AI Hub data and encoding issues).
  - Usage: `python scripts/extract_zip.py <zip_path> <dest_path>`
- **`extract_shopping.js`**: Legacy extractor (deprecated in favor of Python version).
- **`analyze_kakao_tone.js`**: Analyzes KakaoTalk export files for tone density and vocabulary.

## Synthetic Data Generation (AI)
- **`generate_pilot_v5.js`**: **[Current Standard]** Generates synthetic Q&A using Tri-Hybrid logic (Songys + AI Hub Purpose + AI Hub Restaurant).
  - Enforces strict business rules (No cleanup, Min orders, Refunds).
- **`generate_synthetic_full.js`**: Scalable script for mass generation (1,000+ items).
- **`generate_synthetic_pilot.js`**: Previous version (V4).

## SEO & Operations
- **`generate-sitemap.js`**: Generates `sitemap.xml` based on routes.
- **`test-payment-link.js`**: Tests the CiderPay link generation logic.
- **`debug_*.js`**: Utilities for debugging Gemini API models and keys.

## Crawling
- **`crawl_naver_reviews.py`**: Selenium-based crawler for Naver Map reviews.
