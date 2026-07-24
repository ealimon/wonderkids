/**
 * Generates a beautiful TpT "Thank You" Note PDF for Storybook Ed.
 * This script runs in Google Apps Script and outputs a gorgeously formatted Google Doc.
 * 
 * To use:
 * 1. Open Google Drive.
 * 2. Click "+ New" -> "Google Docs".
 * 3. Go to Extensions -> Apps Script.
 * 4. Paste this code into "Code.gs" and click "Save".
 * 5. Choose the "generateTpTThankYouNote" function in the dropdown and click "Run".
 * 6. Grant permissions and find your beautiful new document in Google Drive!
 */
function generateTpTThankYouNote() {
  // 1. Create a brand new Google Document
  var doc = DocumentApp.create("Wonderkids - Thank You Note (Storybook Ed)");
  var body = doc.getBody();
  
  // Clean page margins (0.5 inch / 36 pt for a clean layout)
  body.setMarginTop(36);
  body.setMarginBottom(36);
  body.setMarginLeft(36);
  body.setMarginRight(36);
  
  // Brand Color Palette
  var primaryTeal = "#1B4332";   // Rich forest teal
  var accentCoral = "#E85D04";   // Playful energetic orange
  var lightCream = "#FAF8F5";    // Soft beige page/card highlight
  var charcoalText = "#2B2D42";  // Highly readable primary text
  var grayBorder = "#E5E7EB";    // Soft layout dividers
  var white = "#FFFFFF";
  
  // ==========================================
  // HEADER SECTION (Storybook Ed Brand Banner)
  // ==========================================
  var headerTable = body.appendTable();
  headerTable.setBorderWidth(0);
  
  // Set single cell to act as a container with rounded/colored background
  var headerRow = headerTable.appendTableRow();
  var headerCell = headerRow.appendTableCell();
  headerCell.setBackgroundColor(primaryTeal);
  headerCell.setPaddingTop(18);
  headerCell.setPaddingBottom(18);
  headerCell.setPaddingLeft(24);
  headerCell.setPaddingRight(24);
  
  var brandSub = headerCell.appendParagraph("STORYBOOK ED");
  brandSub.setFontFamily("Trebuchet MS");
  brandSub.setFontSize(10);
  brandSub.setBold(true);
  brandSub.setForegroundColor("#A3E635"); // Lime accent
  brandSub.setSpacingAfter(2);
  brandSub.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  
  var brandTitle = headerCell.appendParagraph("Thank You For Your Purchase!");
  brandTitle.setFontFamily("Georgia");
  brandTitle.setFontSize(22);
  brandTitle.setBold(true);
  brandTitle.setForegroundColor(white);
  brandTitle.setSpacingAfter(4);
  brandTitle.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  
  var brandDesc = headerCell.appendParagraph("Interactive Digital Playgrounds for Modern Classrooms");
  brandDesc.setFontFamily("Arial");
  brandDesc.setFontSize(10);
  brandDesc.setItalic(true);
  brandDesc.setForegroundColor("#D8F3DC");
  brandDesc.setSpacingAfter(0);
  brandDesc.setAlignment(DocumentApp.HorizontalAlignment.CENTER);

  body.appendParagraph("").setSpacingAfter(12);

  // ==========================================
  // INTRODUCTORY GREETING
  // ==========================================
  var introPara = body.appendParagraph("Dear Educator,");
  introPara.setFontFamily("Georgia");
  introPara.setFontSize(13);
  introPara.setBold(true);
  introPara.setForegroundColor(charcoalText);
  introPara.setSpacingAfter(8);
  
  var bodyPara1 = body.appendParagraph(
    "Thank you so much for choosing Wonderkids for your classroom! " +
    "I design interactive playgrounds to transform screen-time into meaningful, self-guided, " +
    "and beautifully engaging educational experiences. I hope your students have a wonderful time playing, learning, and growing with this tool!"
  );
  bodyPara1.setFontFamily("Arial");
  bodyPara1.setFontSize(11);
  bodyPara1.setForegroundColor(charcoalText);
  bodyPara1.setLineSpacing(1.25);
  bodyPara1.setSpacingAfter(12);

  // ==========================================
  // ACCESS LINK / CALL TO ACTION (CTA)
  // ==========================================
  var ctaTable = body.appendTable();
  ctaTable.setBorderWidth(1);
  ctaTable.setBorderColor(grayBorder);
  
  var ctaRow = ctaTable.appendTableRow();
  var ctaCell = ctaRow.appendTableCell();
  ctaCell.setBackgroundColor(lightCream);
  ctaCell.setPaddingTop(16);
  ctaCell.setPaddingBottom(16);
  ctaCell.setPaddingLeft(20);
  ctaCell.setPaddingRight(20);
  
  var ctaLabel = ctaCell.appendParagraph("🚀 LAUNCH YOUR INTERACTIVE RESOURCE");
  ctaLabel.setFontFamily("Trebuchet MS");
  ctaLabel.setFontSize(11);
  ctaLabel.setBold(true);
  ctaLabel.setForegroundColor(accentCoral);
  ctaLabel.setSpacingAfter(6);
  ctaLabel.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  
  var ctaButton = ctaCell.appendParagraph("👉 Click Here to Open Wonderkids 👈");
  ctaButton.setFontFamily("Arial");
  ctaButton.setFontSize(16);
  ctaButton.setBold(true);
  ctaButton.setLinkUrl("https://ealimon.github.io/wonderkids/");
  ctaButton.setForegroundColor("#0284C7"); // Web Link blue
  ctaButton.setUnderline(true);
  ctaButton.setSpacingAfter(6);
  ctaButton.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  
  var ctaSub = ctaCell.appendParagraph("Or copy and paste this link in your browser:\nhttps://ealimon.github.io/wonderkids/");
  ctaSub.setFontFamily("Arial");
  ctaSub.setFontSize(9);
  ctaSub.setItalic(true);
  ctaSub.setForegroundColor("#6B7280");
  ctaSub.setSpacingAfter(0);
  ctaSub.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  
  body.appendParagraph("").setSpacingAfter(12);

  // ==========================================
  // OPTIONAL: ADD AN EMBEDDED PREVIEW IMAGE
  // ==========================================
  try {
    // Beautiful educational workspace photo representing play-based learning
    var imgUrl = "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=80";
    var imgResponse = UrlFetchApp.fetch(imgUrl);
    var imgBlob = imgResponse.getBlob();
    
    var imgPara = body.appendParagraph("");
    var inlineImg = imgPara.appendInlineImage(imgBlob);
    inlineImg.setWidth(450);
    // Keep aspect ratio
    var ratio = inlineImg.getHeight() / inlineImg.getWidth();
    inlineImg.setHeight(450 * ratio);
    imgPara.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    imgPara.setSpacingAfter(12);
  } catch (e) {
    Logger.log("Could not load Unsplash preview image, skipping. " + e.message);
  }

  // ==========================================
  // INSTRUCTIONS FOR TEACHERS
  // ==========================================
  var instTitle = body.appendParagraph("💡 Quick Classroom Start Guide");
  instTitle.setFontFamily("Georgia");
  instTitle.setFontSize(12);
  instTitle.setBold(true);
  instTitle.setForegroundColor(primaryTeal);
  instTitle.setSpacingAfter(8);
  
  var instList = [
    "🖥️ Projector/Smart Board: Play together as a whole group during warmups or circle time.",
    "💻 Math & Literacy Centers: Set tablets or laptops to the web application for self-guided student rotation.",
    "🖨️ Print Worksheets: Look for the printer icon in the top toolbar to generate matching, print-friendly activity sheets with teacher answer keys!",
    "🔊 Enable Sound: Turn on device volume so children can hear the interactive voice/phonics spelling cues."
  ];
  
  for (var i = 0; i < instList.length; i++) {
    var item = body.appendParagraph(instList[i]);
    item.setFontFamily("Arial");
    item.setFontSize(10);
    item.setForegroundColor(charcoalText);
    item.setSpacingAfter(4);
    item.setIndentStart(18);
  }
  
  body.appendParagraph("").setSpacingAfter(12);

  // ==========================================
  // TPT FEEDBACK & STORE LINK
  // ==========================================
  var supportTable = body.appendTable();
  supportTable.setBorderWidth(1);
  supportTable.setBorderColor(grayBorder);
  
  var supportRow = supportTable.appendTableRow();
  var supportCell = supportRow.appendTableCell();
  supportCell.setBackgroundColor("#F0FDFA"); // Soft green mint card
  supportCell.setPaddingTop(12);
  supportCell.setPaddingBottom(12);
  supportCell.setPaddingLeft(16);
  supportCell.setPaddingRight(16);
  
  var feedbackTitle = supportCell.appendParagraph("⭐️ Love this resource? Earn TpT Credits!");
  feedbackTitle.setFontFamily("Trebuchet MS");
  feedbackTitle.setFontSize(11);
  feedbackTitle.setBold(true);
  feedbackTitle.setForegroundColor("#0D9488");
  feedbackTitle.setSpacingAfter(4);
  
  var feedbackText = supportCell.appendParagraph(
    "Please consider leaving feedback! Every time you leave reviews on purchased resources, " +
    "Teachers Pay Teachers rewards you with credits you can spend like real cash on future items."
  );
  feedbackText.setFontFamily("Arial");
  feedbackText.setFontSize(9.5);
  feedbackText.setForegroundColor(charcoalText);
  feedbackText.setSpacingAfter(8);
  
  var storeLinkPara = supportCell.appendParagraph("👉 Follow Storybook Ed on TpT for new releases!");
  storeLinkPara.setFontFamily("Arial");
  storeLinkPara.setFontSize(10);
  storeLinkPara.setBold(true);
  storeLinkPara.setLinkUrl("https://www.teacherspayteachers.com/store/storybook-ed-");
  storeLinkPara.setForegroundColor("#0D9488");
  storeLinkPara.setUnderline(true);
  storeLinkPara.setSpacingAfter(0);

  body.appendParagraph("").setSpacingAfter(16);

  // ==========================================
  // TERMS OF USE (TOU) & SUPPORT FOOTER
  // ==========================================
  var footerTable = body.appendTable();
  footerTable.setBorderWidth(1);
  footerTable.setBorderColor(grayBorder);
  
  // FIXED: Using appendTableRow() instead of appendRow()
  var footerRow = footerTable.appendTableRow();
  // FIXED: Using appendTableCell() instead of appendCell()
  var footerCell = footerRow.appendTableCell();
  footerCell.setBackgroundColor("#F9FAFB");
  footerCell.setPaddingTop(12);
  footerCell.setPaddingBottom(12);
  footerCell.setPaddingLeft(16);
  footerCell.setPaddingRight(16);
  
  var termsTitle = footerCell.appendParagraph("📝 TERMS OF USE & SUPPORT");
  termsTitle.setFontFamily("Arial");
  termsTitle.setFontSize(10);
  termsTitle.setBold(true);
  termsTitle.setForegroundColor("#374151");
  termsTitle.setSpacingAfter(4);
  
  var termsText = footerCell.appendParagraph(
    "© Storybook Ed. All rights reserved. Purchase of this resource entitles the buyer to " +
    "reproduce/use pages for single classroom use only. Duplication or sharing for an entire school or " +
    "district, or commercial use, is strictly forbidden without purchase of an additional license. " +
    "If you encounter any technical difficulties, please reach out to me via the TpT Q&A section, or contact me through our support page."
  );
  termsText.setFontFamily("Arial");
  termsText.setFontSize(8.5);
  termsText.setForegroundColor("#6B7280");
  termsText.setLineSpacing(1.15);
  termsText.setSpacingAfter(0);
  
  // Print link to the user
  Logger.log("SUCCESS! Your beautiful thank you note has been created.");
  Logger.log("View Document: " + doc.getUrl());
}
