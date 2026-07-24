/**
 * Generates a beautiful TpT "Store Preview & Tour" Document for Storybook Ed.
 * This document helps prospective buyers understand all the value packed in Wonderkids,
 * showing the 9 interactive modules, learning standards, and printable sheet components.
 * 
 * To use:
 * 1. Open Google Drive.
 * 2. Click "+ New" -> "Google Docs".
 * 3. Go to Extensions -> Apps Script.
 * 4. Paste this code into "Code.gs" and click "Save".
 * 5. Choose the "generateTpTStorePreview" function in the dropdown and click "Run".
 * 6. Once finished, you can download the document as a PDF to upload as your TpT product preview!
 */
function generateTpTStorePreview() {
  // 1. Create a brand new Google Document
  var doc = DocumentApp.create("Wonderkids - Interactive Classroom App - TpT Product Preview");
  var body = doc.getBody();
  
  // Clean page margins (0.5 inch / 36 pt)
  body.setMarginTop(36);
  body.setMarginBottom(36);
  body.setMarginLeft(36);
  body.setMarginRight(36);
  
  // Brand Color Palette
  var primaryTeal = "#1D3557";   // Deep sophisticated Navy/Teal
  var warmCoral = "#E76F51";     // Warm playful orange-coral
  var sandYellow = "#F4A261";    // Secondary accent yellow
  var lightCream = "#FAF8F5";    // Soft cream layout background
  var charcoalText = "#2B2D42";  // Highly readable dark gray for text
  var borderGray = "#E5E7EB";    // Layout lines
  var white = "#FFFFFF";
  
  // ==========================================
  // PAGE 1: HERO COVER PAGE
  // ==========================================
  
  // 1. Title Banner
  var bannerTable = body.appendTable();
  bannerTable.setBorderWidth(0);
  
  var bannerRow = bannerTable.appendTableRow();
  var bannerCell = bannerRow.appendTableCell();
  bannerCell.setBackgroundColor(primaryTeal);
  bannerCell.setPaddingTop(24);
  bannerCell.setPaddingBottom(24);
  bannerCell.setPaddingLeft(24);
  bannerCell.setPaddingRight(24);
  
  var topBrand = bannerCell.appendParagraph("STORYBOOK ED PRESENTS:");
  topBrand.setFontFamily("Trebuchet MS");
  topBrand.setFontSize(11);
  topBrand.setBold(true);
  topBrand.setForegroundColor("#A8DADC"); // Light seafoam
  topBrand.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  topBrand.setSpacingAfter(4);
  
  var mainTitle = bannerCell.appendParagraph("WONDERKIDS");
  mainTitle.setFontFamily("Georgia");
  mainTitle.setFontSize(28);
  mainTitle.setBold(true);
  mainTitle.setForegroundColor(white);
  mainTitle.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  mainTitle.setSpacingAfter(6);
  
  var subTitle = bannerCell.appendParagraph("The Ultimate Interactive Digital Learning Playground");
  subTitle.setFontFamily("Arial");
  subTitle.setFontSize(13);
  subTitle.setItalic(true);
  subTitle.setForegroundColor("#F1FAEE");
  subTitle.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  subTitle.setSpacingAfter(0);

  body.appendParagraph("").setSpacingAfter(18);

  // 2. Cover Photo (A beautiful, high-quality childhood classroom setting)
  try {
    var coverImgUrl = "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=700&q=80";
    var response = UrlFetchApp.fetch(coverImgUrl);
    var blob = response.getBlob();
    var imgPara = body.appendParagraph("");
    var inlineImg = imgPara.appendInlineImage(blob);
    inlineImg.setWidth(450);
    var ratio = inlineImg.getHeight() / inlineImg.getWidth();
    inlineImg.setHeight(450 * ratio);
    imgPara.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    imgPara.setSpacingAfter(12);
  } catch (e) {
    Logger.log("Failed to load cover image: " + e.message);
  }

  // 3. Welcome/Overview Blurb
  var introBox = body.appendTable();
  introBox.setBorderWidth(1).setBorderColor(borderGray);
  
  var introRow = introBox.appendTableRow();
  var introCell = introRow.appendTableCell();
  introCell.setBackgroundColor(lightCream);
  introCell.setPaddingTop(12);
  introCell.setPaddingBottom(12);
  introCell.setPaddingLeft(16);
  introCell.setPaddingRight(16);
  
  var introTitle = introCell.appendParagraph("🏫 ENGAGING, MULTI-SENSORY & READY TO PLAY");
  introTitle.setFontFamily("Trebuchet MS");
  introTitle.setFontSize(12);
  introTitle.setBold(true);
  introTitle.setForegroundColor(warmCoral);
  introTitle.setSpacingAfter(6);
  
  var introText = introCell.appendParagraph(
    "Wonderkids is a complete full-suite interactive classroom application designed for tablets, laptops, " +
    "and smart boards. Perfect for classroom centers, rotation stations, morning work, speech therapy, and early finishers. " +
    "It requires ZERO installations—simply click and play directly inside any standard web browser!\n\n" +
    "This document provides a full visual walkthrough and feature list so you can see exactly what is included in this bundle."
  );
  introText.setFontFamily("Arial");
  introText.setFontSize(10);
  introText.setForegroundColor(charcoalText);
  introText.setLineSpacing(1.2);
  introText.setSpacingAfter(0);

  // Page Break to Page 2
  body.appendPageBreak();

  // ==========================================
  // PAGE 2: WHAT'S INSIDE? (9 EDUCATIONAL MODULES)
  // ==========================================
  var sectionTitle1 = body.appendParagraph("🎯 Explore the 9 Interactive Learning Modules");
  sectionTitle1.setFontFamily("Georgia");
  sectionTitle1.setFontSize(18);
  sectionTitle1.setBold(true);
  sectionTitle1.setForegroundColor(primaryTeal);
  sectionTitle1.setSpacingAfter(12);
  
  // Table for Modules
  var moduleTable = body.appendTable();
  moduleTable.setBorderWidth(1).setBorderColor(borderGray);
  
  // Header Row
  var headerRow2 = moduleTable.appendTableRow();
  var th1 = headerRow2.appendTableCell().setBackgroundColor(primaryTeal).setPaddingTop(8).setPaddingBottom(8).setPaddingLeft(10).setPaddingRight(10);
  var th2 = headerRow2.appendTableCell().setBackgroundColor(primaryTeal).setPaddingTop(8).setPaddingBottom(8).setPaddingLeft(10).setPaddingRight(10);
  var th3 = headerRow2.appendTableCell().setBackgroundColor(primaryTeal).setPaddingTop(8).setPaddingBottom(8).setPaddingLeft(10).setPaddingRight(10);
  
  th1.appendParagraph("Module Name").setFontFamily("Arial").setFontSize(10).setBold(true).setForegroundColor(white);
  th2.appendParagraph("CCSS Standard").setFontFamily("Arial").setFontSize(10).setBold(true).setForegroundColor(white);
  th3.appendParagraph("Interactive Gameplay & Goals").setFontFamily("Arial").setFontSize(10).setBold(true).setForegroundColor(white);
  
  var modulesData = [
    { name: "🎨 Color Sorter", std: "K.MD.B.3", desc: "Drag and drop colorful toys and objects into corresponding baskets. Teaches classification, sorting, and basic color identification." },
    { name: "📐 Shape Matcher", std: "K.G.B.4", desc: "Interactive geometry canvas. Children drag diverse 2D shapes (stars, triangles, diamonds) directly into outline cutouts with real-time feedback." },
    { name: "🔁 Pattern Completer", std: "K.CC.A.1", desc: "Complete sequencing patterns (ABAB, AABB, ABC). Develops predictive mathematical logic and cognitive sequence awareness." },
    { name: "🌻 Counting Garden", std: "K.CC.B.4", desc: "Interactive planting garden. Kids plant visual flower seeds, water them, watch them bloom, and drag correct numbers of flowers to harvest baskets." },
    { name: "✏️ Phonics Spelling", std: "RF.K.2", desc: "Word spelling blocks with digital speech synthesis! Drag letter blocks to spell 3-letter words (CVC). Perfect for early phonological awareness." },
    { name: "➕ Math Addition", std: "K.OA.A.1", desc: "Single digit visual addition playground. Adds visual flowers in flowerbeds with digital counters to show adding concepts physically." },
    { name: "➖ Math Subtraction", std: "K.OA.A.1", desc: "Interactive visual takeaway subtraction. Students click on colorful floating balloons to pop them and watch visual math formulas update live." },
    { name: "📚 Simple Reading", std: "RL.K.10", desc: "A collection of interactive, illustrated stories. Text-to-speech engine speaks sentences out loud, helping kids follow reading word-by-word." },
    { name: "🖨️ Customizable Prints", std: "Classroom", desc: "Teachers can generate and instantly print matching worksheet pages directly from the app dashboard, complete with answer keys!" }
  ];
  
  for (var i = 0; i < modulesData.length; i++) {
    var row = moduleTable.appendTableRow();
    var cell1 = row.appendTableCell().setPaddingTop(8).setPaddingBottom(8).setPaddingLeft(10).setPaddingRight(10);
    var cell2 = row.appendTableCell().setPaddingTop(8).setPaddingBottom(8).setPaddingLeft(10).setPaddingRight(10);
    var cell3 = row.appendTableCell().setPaddingTop(8).setPaddingBottom(8).setPaddingLeft(10).setPaddingRight(10);
    
    // Alternating background colors
    if (i % 2 === 1) {
      cell1.setBackgroundColor("#F9FAFB");
      cell2.setBackgroundColor("#F9FAFB");
      cell3.setBackgroundColor("#F9FAFB");
    }
    
    cell1.appendParagraph(modulesData[i].name).setFontFamily("Arial").setFontSize(9.5).setBold(true).setForegroundColor(charcoalText);
    cell2.appendParagraph(modulesData[i].std).setFontFamily("Courier New").setFontSize(9).setBold(true).setForegroundColor("#4B5563");
    cell3.appendParagraph(modulesData[i].desc).setFontFamily("Arial").setFontSize(9).setForegroundColor(charcoalText);
  }

  body.appendParagraph("").setSpacingAfter(12);

  // 4. Secondary Image (Vibrant Educational Toys/Geometric shapes)
  try {
    var toyImgUrl = "https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=700&q=80";
    var toyResponse = UrlFetchApp.fetch(toyImgUrl);
    var toyBlob = toyResponse.getBlob();
    var toyPara = body.appendParagraph("");
    var toyImg = toyPara.appendInlineImage(toyBlob);
    toyImg.setWidth(450);
    var ratio2 = toyImg.getHeight() / toyImg.getWidth();
    toyImg.setHeight(450 * ratio2);
    toyPara.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    toyPara.setSpacingAfter(0);
  } catch (e) {
    Logger.log("Failed to load toy image: " + e.message);
  }

  // Page Break to Page 3
  body.appendPageBreak();

  // ==========================================
  // PAGE 3: SPECIAL TEACHER ADVANTAGES & DETAILS
  // ==========================================
  var sectionTitle2 = body.appendParagraph("💡 Special Features for Educators");
  sectionTitle2.setFontFamily("Georgia");
  sectionTitle2.setFontSize(18);
  sectionTitle2.setBold(true);
  sectionTitle2.setForegroundColor(primaryTeal);
  sectionTitle2.setSpacingAfter(12);
  
  var featuresList = [
    { title: "🖨️ Hybrid Screen-to-Paper Integration", desc: "Bridging digital and tactile play! Every activity can generate customized matching print worksheets in seconds so you can seamlessly print homework, assessments, or physical center pages." },
    { title: "🔊 Native Voice / Sound Cues", desc: "No reading required! Wonderkids features rich, automated audio narration, letter sound phonics speech, and delightful positive sound-effects to guide young learners independently." },
    { title: "🔑 Integrated Answer Keys", desc: "Grading is a breeze. When generating custom print worksheets, teacher answer keys are generated side-by-side to save you precious administrative time." },
    { title: "📱 100% Device Compatibility", desc: "No downloads, apps, or accounts to manage. It runs effortlessly in full-screen on iPads, Chromebooks, Android tablets, Macbooks, and Windows desktops." }
  ];
  
  for (var f = 0; f < featuresList.length; f++) {
    var pTitle = body.appendParagraph("🌟 " + featuresList[f].title);
    pTitle.setFontFamily("Trebuchet MS");
    pTitle.setFontSize(12);
    pTitle.setBold(true);
    pTitle.setForegroundColor(warmCoral);
    pTitle.setSpacingAfter(2);
    
    var pDesc = body.appendParagraph(featuresList[f].desc);
    pDesc.setFontFamily("Arial");
    pDesc.setFontSize(10);
    pDesc.setForegroundColor(charcoalText);
    pDesc.setLineSpacing(1.2);
    pDesc.setSpacingAfter(10);
  }

  body.appendParagraph("").setSpacingAfter(16);

  // ==========================================
  // PROMOTIONAL CALLS TO ACTION (CTAs)
  // ==========================================
  var promoTable = body.appendTable();
  promoTable.setBorderWidth(1).setBorderColor(borderGray);
  
  var promoRow = promoTable.appendTableRow();
  
  // Left CTA: Live App Demo
  var ctaLeft = promoRow.appendTableCell();
  ctaLeft.setBackgroundColor("#F0FDF4"); // Soft mint green background
  ctaLeft.setPaddingTop(16).setPaddingBottom(16).setPaddingLeft(16).setPaddingRight(16);
  
  var leftTitle = ctaLeft.appendParagraph("🎮 TRY THE LIVE APP NOW");
  leftTitle.setFontFamily("Trebuchet MS").setFontSize(11).setBold(true).setForegroundColor("#16A34A").setAlignment(DocumentApp.HorizontalAlignment.CENTER).setSpacingAfter(8);
  
  var leftButton = ctaLeft.appendParagraph("👉 Launch Live App 👈");
  leftButton.setFontFamily("Arial").setFontSize(14).setBold(true).setLinkUrl("https://ealimon.github.io/wonderkids/").setForegroundColor("#0D9488").setUnderline(true).setAlignment(DocumentApp.HorizontalAlignment.CENTER).setSpacingAfter(6);
  
  ctaLeft.appendParagraph("Test all 9 modules yourself directly on your smart board or device!")
    .setFontFamily("Arial").setFontSize(9).setForegroundColor("#374151").setAlignment(DocumentApp.HorizontalAlignment.CENTER).setSpacingAfter(0);

  // Right CTA: Visit Store
  var ctaRight = promoRow.appendTableCell();
  ctaRight.setBackgroundColor("#FEF3C7"); // Soft warm golden background
  ctaRight.setPaddingTop(16).setPaddingBottom(16).setPaddingLeft(16).setPaddingRight(16);
  
  var rightTitle = ctaRight.appendParagraph("🛍️ BROWSE STORYBOOK ED");
  rightTitle.setFontFamily("Trebuchet MS").setFontSize(11).setBold(true).setForegroundColor("#D97706").setAlignment(DocumentApp.HorizontalAlignment.CENTER).setSpacingAfter(8);
  
  var rightButton = ctaRight.appendParagraph("👉 Visit TpT Store 👈");
  rightButton.setFontFamily("Arial").setFontSize(14).setBold(true).setLinkUrl("https://www.teacherspayteachers.com/store/storybook-ed-").setForegroundColor("#B45309").setUnderline(true).setAlignment(DocumentApp.HorizontalAlignment.CENTER).setSpacingAfter(6);
  
  ctaRight.appendParagraph("Follow Storybook Ed on TpT for new classroom interactive releases!")
    .setFontFamily("Arial").setFontSize(9).setForegroundColor("#374151").setAlignment(DocumentApp.HorizontalAlignment.CENTER).setSpacingAfter(0);

  body.appendParagraph("").setSpacingAfter(18);

  // Footer / Credits
  var footPara = body.appendParagraph("Designed with ❤️ for modern interactive classrooms by Storybook Ed.");
  footPara.setFontFamily("Georgia").setFontSize(9.5).setItalic(true).setForegroundColor("#6B7280").setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  
  Logger.log("SUCCESS! Your comprehensive TpT Store Preview Document has been generated.");
  Logger.log("View Document: " + doc.getUrl());
}
