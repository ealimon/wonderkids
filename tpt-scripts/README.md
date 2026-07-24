# 🏫 Storybook Ed - Google Apps Script Resources

Welcome to your Teachers Pay Teachers (TpT) Google Apps Script automation suite! These scripts let you generate beautifully styled, professional, and branded documents directly in your Google Drive with a single click.

This folder contains two main automation scripts:
1. **`ThankYouNote.js`**: Generates a gorgeous, branded classroom "Thank You" note with a direct launch link to your interactive **Wonderkids** app and a follow link to your TpT Store, **Storybook Ed**. Download this document as a PDF to use as the primary file buyers download when they purchase your resource!
2. **`StorePreview.js`**: Generates an impressive, multi-page **TpT Product Preview & Tour** showing off the 9 interactive learning modules, classroom standard alignments, special teacher features, and beautiful embedded educational illustration photos from Unsplash. Download this document as a PDF to upload as your TpT Product Preview!

---

## 🚀 How to Run These Scripts in Google Apps Script

Follow these simple steps to run either of the scripts and generate your branded documents:

### Step 1: Create a Google Doc
1. Go to your [Google Drive](https://drive.google.com/).
2. Click the **`+ New`** button in the top left and select **`Google Docs`**.

### Step 2: Open Apps Script
1. Inside your new Google Doc, look at the top menu and select **`Extensions`** -> **`Apps Script`**.
2. This will open a new browser tab with the Google Apps Script editor. You will see a file named `Code.gs` with a default `myFunction()` template.

### Step 3: Copy and Paste the Code
1. Erase any default code inside the `Code.gs` text editor.
2. Open either **`ThankYouNote.js`** or **`StorePreview.js`** from this repository.
3. Copy the entire file contents and paste it directly into the Apps Script editor.
4. Click the **`Save`** icon (floppy disk) on the toolbar, or press `Ctrl + S` (`Cmd + S` on Mac).

### Step 4: Run the Script
1. On the top toolbar, ensure the dropdown list has the correct function selected:
   - Select **`generateTpTThankYouNote`** if you pasted the thank-you note code.
   - Select **`generateTpTStorePreview`** if you pasted the preview tour code.
2. Click the **`Run`** button (play icon) next to the dropdown.

### Step 5: Authorize Permissions
1. Since the script creates a document on your behalf and fetches beautiful educational pictures from Unsplash, Google will show an **"Authorization Required"** popup.
2. Click **`Review Permissions`**.
3. Choose your Google Account.
4. Click **`Advanced`** (in small text near the bottom) and then click **`Go to Untitled project (unsafe)`** (don't worry, this is your own script running in your private Google Drive!).
5. Click **`Allow`** on the final screen.

### Step 6: Find Your Document!
1. Check the **`Execution log`** at the bottom of the editor.
2. Once the script finishes, you will see a success message:
   *`SUCCESS! Your beautiful thank you note has been created.`*
3. The log will print a direct link: **`View Document: https://docs.google.com/document/d/...`**.
4. Simply copy that link, paste it in a new tab, or just go back to your Google Drive homepage—your beautiful new document will be right there!

---

## 🎨 Professional Design Features Included

These scripts are built from scratch with professional graphic design and pedagogical principles in mind:

* **Storybook Ed Visual Branding**: Built around a custom, cohesive palette featuring **Forest Teal** (`#1B4332`), **Playful Coral Orange** (`#E85D04`), and **Soft Cream** backgrounds.
* **Typographic Sizing & Rhythm**: Elegant heading choices pairing Georgia (for a warm, storybook serif feel) and Trebuchet MS/Arial for highly readable body segments and clean data columns.
* **Error-Free Apps Script APIs**: Standardized table row and cell building using the correct `.appendTableRow()` and `.appendTableCell()` API methods to guarantee 100% stable execution.
* **Automatic Image Insertion**: Automatically retrieves beautiful, high-resolution child classroom and educational toy graphics from Unsplash and formats them perfectly inside the document to make it immediately look professional.
* **Clear Call-to-Actions (CTAs)**: Styled layout table cells made to look like digital "buttons" that buyers and teachers can easily click to launch **Wonderkids** (`https://ealimon.github.io/wonderkids/`) or follow **Storybook Ed** (`https://www.teacherspayteachers.com/store/storybook-ed-`).

---

## 🖨️ Downloading as PDF for Teachers Pay Teachers
Once you have generated either document and inspected/personalized it to your liking:
1. Inside the Google Doc, click **`File`** -> **`Download`** -> **`PDF Document (.pdf)`**.
2. Save the PDF to your desktop.
3. Upload your Thank You PDF as the primary product file on TpT, and upload your Store Preview PDF as the promotional Product Preview file!
