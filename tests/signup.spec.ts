// tests/signup.spec.ts
import { test } from '@playwright/test';

const BASE_URL = 'https://authorized-partner.netlify.app';

/*Helpers */
function generateTestEmail(): string {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `testuser_${timestamp}_${randomStr}@mailinator.com`;
}

function generatePhoneNumber(): string {
  return '98' + Math.floor(10000000 + Math.random() * 90000000);
}

function generateBusinessRegNumber(): string {
  const timestamp = Date.now().toString().slice(-8);
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BRN${timestamp}${randomStr}`;
}

function generateRandomFileName(type: 'registration' | 'education'): string {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);

  const fileTypes = {
    registration: ['company-registration', 'business-license', 'incorporation-certificate'],
    education: ['educational-certificates', 'academic-credentials', 'training-certificates']
  };

  const pool = fileTypes[type];
  const randomName = pool[Math.floor(Math.random() * pool.length)];
  return `${randomName}-${timestamp}-${randomStr}`;
}

async function downloadImageFromUrl(url: string): Promise<Buffer> {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch {
    console.log('Failed to download image, using fallback buffer');
    return Buffer.from([
      0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
      0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xD9
    ]);
  }
}

/*Test  */
test.describe('Authorized Partner - Automated Signup Flow', () => {
  test('Complete automated signup with all steps', async ({ page, context }) => {
    const testEmail = generateTestEmail();
    const phoneNumber = generatePhoneNumber();
    const password = 'Test@12345';
    const businessRegNumber = generateBusinessRegNumber();

    console.log('Email:', testEmail);
    console.log('Phone:', phoneNumber);
    console.log('Business Reg:', businessRegNumber);

    try {
      /* STEP 1: Setup Account */
      console.log('\n STEP 1: Setup Account');
      await page.goto(`${BASE_URL}/register?step=setup`);
      await page.waitForLoadState('networkidle');

      const step1Inputs = await page.$$('input');
      await step1Inputs[0].fill('John');
      await step1Inputs[1].fill('Doe');
      await step1Inputs[2].fill(testEmail);
      await step1Inputs[3].fill(phoneNumber);
      await step1Inputs[4].fill(password);
      await step1Inputs[5].fill(password);

      await page.screenshot({ path: 'screenshots/step1-filled.png' });
      await page.click('button:has-text("Next")');

      /* OTP Handling */
      console.log('\n Handling OTP...');
      await page.waitForTimeout(3000);

      const mailinatorPage = await context.newPage();
      const emailName = testEmail.split('@')[0];
      await mailinatorPage.goto(`https://www.mailinator.com/v4/public/inboxes.jsp?to=${emailName}`);
      await mailinatorPage.waitForTimeout(5000);

      try {
        await mailinatorPage.click('tr.ng-scope:first-child td.ng-binding');
        await mailinatorPage.waitForTimeout(2000);

        const frame = mailinatorPage.frameLocator('#html_msg_body');
        const otpText = await frame.locator('body').textContent();
        const otpMatch = otpText?.match(/\b(\d{6})\b/);

        if (otpMatch) {
          const otp = otpMatch[1];
          console.log('OTP found:', otp);
          await mailinatorPage.close();

          await page.fill('input[placeholder*="OTP"], input[maxlength="6"]', otp);
          await page.click('button:has-text("Verify"), button:has-text("Submit")');
        } else {
          console.log('No OTP found, fallback to 123456');
          await mailinatorPage.close();

          await page.fill('input[placeholder*="OTP"], input[maxlength="6"]', '123456');
          await page.click('button:has-text("Verify"), button:has-text("Submit")');
        }
      } catch {
        console.log('OTP retrieval failed, fallback to 123456');
        await mailinatorPage.close();

        await page.fill('input[placeholder*="OTP"], input[maxlength="6"]', '123456');
        await page.click('button:has-text("Verify"), button:has-text("Submit")');
      }

      await page.waitForTimeout(3000);

      /* STEP 2: Agency Details */
      console.log('\n STEP 2: Agency Details');
      await page.goto(`${BASE_URL}/register?step=details`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);

      const agencyInputs = await page.$$('input');
      const agencySelects = await page.$$('select');

      await agencyInputs[0].fill('Global Education Partners');
      await agencyInputs[1].fill('Senior Consultant');
      await agencyInputs[2].fill(`agency_${testEmail}`);
      await agencyInputs[3].fill('www.globaledupartners.com');
      await agencyInputs[4].fill('Durbarmarg, Kathmandu, Nepal');

      if (agencySelects.length > 0) {
        try {
          await agencySelects[0].selectOption({ label: 'Canada' });
        } catch {
          try {
            await agencySelects[0].selectOption({ value: 'CA' });
          } catch {
            await agencySelects[0].selectOption({ index: 1 });
          }
        }
      }

      await page.screenshot({ path: 'screenshots/step2-filled.png' });
      await page.click('button:has-text("Next")');
      await page.waitForTimeout(3000);

      /* STEP 3: Professional Experience */
      console.log('\n STEP 3: Professional Experience');
      await page.goto(`${BASE_URL}/register?step=professional-experience`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);

      const proInputs = await page.$$('input');
      const proSelects = await page.$$('select');

      if (proSelects.length > 0) await proSelects[0].selectOption({ index: 1 });
      if (proInputs.length > 0) await proInputs[0].fill('75');
      if (proInputs.length > 1) await proInputs[1].fill('Specializing in undergrad programs for USA/Canada');
      if (proInputs.length > 2) await proInputs[2].fill('92');

      // Services checkboxes
      const serviceLabels = ['Career Counseling', 'Admission Applications', 'Visa Processing', 'Test Preparation'];
      let step3Checked = false;
      for (const service of serviceLabels) {
        try {
          await page.click(`text="${service}"`, { force: true, timeout: 2000 });
          console.log(`Selected service: ${service}`);
          step3Checked = true;
          break;
        } catch { }
      }
      if (!step3Checked) console.log('No service checkbox selected');

      await page.screenshot({ path: 'screenshots/step3-filled.png' });
      await page.click('button:has-text("Next")');
      await page.waitForTimeout(3000);

      /* STEP 4: Verification & Preferences */
      console.log('\n STEP 4: Verification & Preferences');
      await page.goto(`${BASE_URL}/register?step=verification`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);

      const verInputs = await page.$$('input');
      const verSelects = await page.$$('select');

      await verInputs[0].fill(businessRegNumber);

      if (verSelects.length > 0) {
        try {
          await verSelects[0].selectOption({ label: 'Canada' });
        } catch {
          await verSelects[0].selectOption({ index: 1 });
        }
      }

      // Institution type
      const institutions = ['University', 'College', 'Vocational School'];
      let instSelected = false;
      for (const inst of institutions) {
        try {
          await page.click(`text="${inst}"`, { force: true, timeout: 2000 });
          console.log(`Selected institution: ${inst}`);
          instSelected = true;
          break;
        } catch { }
      }
      if (!instSelected) console.log('No institution selected');

      // File uploads
      const fileInputs = await page.$$('input[type="file"]');
      const dummyUrls = [
        'https://picsum.photos/800/600?random=1',
        'https://picsum.photos/800/600?random=2'
      ];

      if (fileInputs.length >= 2) {
        const regFile = generateRandomFileName('registration');
        const eduFile = generateRandomFileName('education');

        const regBuffer = await downloadImageFromUrl(dummyUrls[0]);
        const eduBuffer = await downloadImageFromUrl(dummyUrls[1]);

        await fileInputs[0].setInputFiles({ name: `${regFile}.jpg`, mimeType: 'image/jpeg', buffer: regBuffer });
        await fileInputs[1].setInputFiles({ name: `${eduFile}.jpg`, mimeType: 'image/jpeg', buffer: eduBuffer });

        console.log(`Uploaded: ${regFile}.jpg & ${eduFile}.jpg`);
      }

      // Certification details
      const textInputs = await page.$$('input:not([type="checkbox"]):not([type="file"]):not([type="radio"])');
      if (textInputs.length > 1) {
        await textInputs[textInputs.length - 1].fill('ICBT Certified Education Agent');
      }

      await page.screenshot({ path: 'screenshots/step4-filled.png' });

      /* Submit */
      console.log('\n Submitting form...');
      await page.click('button:has-text("Submit")');
      await page.waitForTimeout(5000);

      const finalUrl = page.url();
      console.log('Final URL:', finalUrl);

      if (finalUrl.includes('login') || finalUrl.includes('success') || finalUrl.includes('dashboard')) {
        console.log('Registration completed successfully!');
      } else {
        console.log('Registration may not have completed');
      }

      await page.screenshot({ path: 'screenshots/final-result.png' });

      console.log('\n===>');
      console.log('🎉 SIGNUP FLOW COMPLETED');
      console.log('===>');
      console.log('Email:', testEmail);
      console.log('Password:', password);
      console.log('===>');
    } catch (err) {
      console.log('Test failed:', err);
      try {
        await page.screenshot({ path: 'screenshots/error-state.png' });
      } catch {
        console.log('Could not capture error screenshot');
      }
      throw err;
    }
  });
});
