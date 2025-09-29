# Authorized Partner Signup Test Automation

This project contains automated tests for the Authorized Partner registration system using Playwright and TypeScript. The tests simulate a complete user signup flow from account creation through final verification.

**Author:** Mritunjay Sukla

## What This Does

The main test automates the entire partner registration process on the Authorized Partner website. It handles:

- Account setup with personal details
- Email verification using Mailinator for OTP retrieval
- Agency information entry
- Professional experience documentation
- Final verification with file uploads

The test generates unique data for each run to avoid conflicts and uses real email services for verification testing.

## Getting Started

You'll need Node.js version 16 or higher and Yarn package manager installed.

### Installation

1. Navigate to the project directory:
```
cd qa-task/qa-task
```

2. Install dependencies:
```
yarn install
```

3. Install Playwright browsers:
```
npx playwright install
```

4. Create the screenshots directory:
```
mkdir screenshots
```

## Running Tests

Basic commands:

```
# Run tests in headless mode
yarn test

# Run with browser visible
yarn run test:headed

# Run in debug mode
yarn run test:debug
```

Additional options:

```
# Run with detailed output
npx playwright test --reporter=list

# Generate HTML report
npx playwright test --reporter=html
npx playwright show-report
```

## Project Structure

```
qa-task/
├── tests/
│   └── signup.spec.ts          # Main test file
├── screenshots/                # Generated during test runs
├── playwright.config.ts        # Playwright settings
├── tsconfig.json              # TypeScript configuration
├── package.json               # Dependencies
└── README.md                  # This file
```

## Test Details

The main test in `signup.spec.ts` covers a complete signup flow:

### Step 1: Account Setup
- Fills personal information (name, email, phone, password)
- Handles email verification by accessing Mailinator
- Extracts OTP from email and submits it

### Step 2: Agency Details
- Company information entry
- Region selection (attempts multiple methods)
- Contact details

### Step 3: Professional Experience
- Years of experience selection
- Student recruitment numbers
- Service offerings (checkboxes)
- Success metrics

### Step 4: Verification
- Business registration number
- Preferred countries selection
- Institution type preferences
- File uploads (downloads random images from the web)
- Final submission

## Test Data

The tests use dynamically generated data:

- **Email**: Timestamp-based unique emails using Mailinator
- **Phone**: Random 10-digit numbers starting with 98
- **Business Registration**: Generated alphanumeric codes
- **Files**: Downloads random JPG images from placeholder services

## Configuration

### Playwright Settings
- Browser: Chromium (default)
- Headless: False (shows browser by default)
- Timeout: 5 minutes per test
- Screenshots: Taken at each step and on failures
- Single worker to avoid conflicts

### TypeScript Setup
- Target: ES2020
- Strict type checking enabled
- Playwright types included

## Troubleshooting

**Tests won't start:**
```
npx playwright install --force-reinstall
```

**Module errors:**
```
rm -rf node_modules yarn.lock
yarn install
```

**Element not found errors:**
- The website structure may have changed
- Run in headed mode to see what's happening
- Check if selectors in the code match current elements

**OTP retrieval fails:**
- The test falls back to a default OTP (123456)
- Mailinator access may be temporarily unavailable
- Email delivery timing can vary

## Technical Notes

- Tests run against the live application at authorized-partner.netlify.app
- Each test run uses unique data to avoid conflicts
- File uploads use real images downloaded from the internet
- Screenshots are saved for debugging at each major step
- The test handles various fallback scenarios for robust execution

The code prioritizes reliability over strict element targeting, using multiple strategies to interact with form elements when the exact selectors might not be available.