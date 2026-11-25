/**
 * THE SCATTERED SHORE - Reader Application Logic
 * Supports: Trilingual Localization (EN / HI / MR)
 * Features: Chapter Navigation, Theme Engine, Font Engine, Local Folder Importer
 */

(function () {
  'use strict';

  // --- UI Translations Dictionary ---
  const I18N = {
    en: {
      siteTitle: "The Scattered Shore",
      siteSubtitle: "तटीय चेतना",
      tocHeading: "Table of Contents",
      chapterSearchPlaceholder: "Search chapters...",
      loadFolderLabel: "Load Chapters",
      drawerLoadFolderLabel: "Load Local 'final chapters'",
      sourceDefault: "Default Preview",
      sourceLocal: "Local Chapters",
      chapterCountSuffix: "chapters",
      themeLabel: "Theme",
      fontFamilyLabel: "Font Style",
      fontSizeLabel: "Font Size",
      lineHeightLabel: "Line Spacing",
      contentWidthLabel: "Reading Width",
      settingsTitle: "Reading Preferences",
      prevSub: "Previous",
      nextSub: "Next",
      tocSub: "Directory",
      tocTitle: "All Chapters",
      noPrevChapter: "← None",
      noNextChapter: "End of Story →",
      readTimeSuffix: "min read",
      untranslatedNote: "*This chapter content is currently displayed in English. When translated files are added, it will automatically switch.*",
      loadSuccessMsg: "Loaded {count} chapters from your folder!"
    },
    hi: {
      siteTitle: "द स्कैटर्ड शोर",
      siteSubtitle: "तटीय चेतना",
      tocHeading: "अनुक्रमणिका (अध्याय सूची)",
      chapterSearchPlaceholder: "अध्याय खोजें...",
      loadFolderLabel: "अध्याय लोड करें",
      drawerLoadFolderLabel: "स्थानीय 'final chapters' जोड़ें",
      sourceDefault: "पूर्वावलोकन",
      sourceLocal: "स्थानीय अध्याय",
      chapterCountSuffix: "अध्याय",
      themeLabel: "थीम",
      fontFamilyLabel: "फ़ॉन्ट शैली",
      fontSizeLabel: "अक्षर आकार",
      lineHeightLabel: "पंक्ति रिक्ति",
      contentWidthLabel: "पठन चौड़ाई",
      settingsTitle: "पठन प्राथमिकताएं",
      prevSub: "पिछला",
      nextSub: "अगला",
      tocSub: "सूची",
      tocTitle: "सभी अध्याय",
      noPrevChapter: "← कोई नहीं",
      noNextChapter: "समाप्त →",
      readTimeSuffix: "मिनट पठन",
      untranslatedNote: "*यह अध्याय वर्तमान में मूल भाषा में प्रदर्शित है। अनुवादित अध्याय उपलब्ध होने पर यह स्वतः बदल जाएगा।*",
      loadSuccessMsg: "आपके फ़ोल्डर से {count} अध्याय सफलतापूर्वक लोड किए गए!"
    },
    mr: {
      siteTitle: "द स्कॅटर्ड शोर",
      siteSubtitle: "विखुरलेला किनारा",
      tocHeading: "अनुक्रमणिका (प्रकरणे)",
      chapterSearchPlaceholder: "प्रकरण शोधा...",
      loadFolderLabel: "प्रकरणे लोड करा",
      drawerLoadFolderLabel: "स्थानिक 'final chapters' जोडा",
      sourceDefault: "पूर्वावलोकन",
      sourceLocal: "स्थानिक प्रकरणे",
      chapterCountSuffix: "प्रकरणे",
      themeLabel: "थीम",
      fontFamilyLabel: "फॉन्ट शैली",
      fontSizeLabel: "अक्षराचा आकार",
      lineHeightLabel: "ओळींमधील अंतर",
      contentWidthLabel: "वाचन रुंदी",
      settingsTitle: "वाचन प्राधान्ये",
      prevSub: "मागील",
      nextSub: "पुढील",
      tocSub: "सूची",
      tocTitle: "सर्व प्रकरणे",
      noPrevChapter: "← काहीही नाही",
      noNextChapter: "समाप्त →",
      readTimeSuffix: "मिनिटे वाचन",
      untranslatedNote: "*हे प्रकरण सध्या मूळ भाषेत दर्शविले आहे. भाषांतर उपलब्ध झाल्यावर ते आपोआप दिसेल.*",
      loadSuccessMsg: "तुमच्या फोल्डरमधून {count} प्रकरणे यशस्वीरित्या लोड केली!"
    }
  };

  // --- State ---
  let chapters = (typeof DEFAULT_CHAPTERS !== 'undefined') ? [...DEFAULT_CHAPTERS] : [];
  let currentChapterIndex = 0;
  let currentLang = localStorage.getItem('tss_lang') || 'en';
  let currentTheme = localStorage.getItem('tss_theme') || 'frost';
  let currentFont = localStorage.getItem('tss_font') || 'serif';
  let currentFontSize = parseInt(localStorage.getItem('tss_fontsize') || '18', 10);
  let currentLineHeight = parseFloat(localStorage.getItem('tss_lineheight') || '1.85');
  let currentWidth = localStorage.getItem('tss_width') || 'normal';
  let isLocalSource = false;

  // --- DOM Elements ---
  const DOM = {
    progressBar: document.getElementById('progressBar'),
    drawer: document.getElementById('drawer'),
    drawerOverlay: document.getElementById('drawerOverlay'),
    drawerToggle: document.getElementById('drawerToggle'),
    drawerToggleBottom: document.getElementById('drawerToggleBottom'),
    drawerClose: document.getElementById('drawerClose'),
    chapterList: document.getElementById('chapterList'),
    chapterSearch: document.getElementById('chapterSearch'),
    sourceBadge: document.getElementById('sourceBadge'),
    chapterCount: document.getElementById('chapterCount'),
    
    settingsModal: document.getElementById('settingsModal'),
    settingsBtn: document.getElementById('settingsBtn'),
    settingsClose: document.getElementById('settingsClose'),
    
    readerContainer: document.getElementById('readerContainer'),
    chapterArc: document.getElementById('chapterArc'),
    chapterNumberLabel: document.getElementById('chapterNumberLabel'),
    readingTime: document.getElementById('readingTime'),
    chapterTitle: document.getElementById('chapterTitle'),
    chapterSubTitle: document.getElementById('chapterSubTitle'),
    chapterBody: document.getElementById('chapterBody'),
    
    currentChapterIndicatorTop: document.getElementById('currentChapterIndicatorTop'),
    prevChapterBtnTop: document.getElementById('prevChapterBtnTop'),
    nextChapterBtnTop: document.getElementById('nextChapterBtnTop'),
    
    prevChapterBtnBottom: document.getElementById('prevChapterBtnBottom'),
    nextChapterBtnBottom: document.getElementById('nextChapterBtnBottom'),
    prevChapterTitle: document.getElementById('prevChapterTitle'),
    nextChapterTitle: document.getElementById('nextChapterTitle'),
    
    floatingPrevBtn: document.getElementById('floatingPrevBtn'),
    floatingNextBtn: document.getElementById('floatingNextBtn'),
    floatingTocBtn: document.getElementById('floatingTocBtn'),
    floatingLangBtn: document.getElementById('floatingLangBtn'),
    floatingSettingsBtn: document.getElementById('floatingSettingsBtn'),
    
    loadLocalFolderBtn: document.getElementById('loadLocalFolderBtn'),
    drawerLoadFolderBtn: document.getElementById('drawerLoadFolderBtn'),
    directoryInput: document.getElementById('directoryInput'),
    
    fontSizeDisplay: document.getElementById('fontSizeDisplay'),
    fontSizeDecBtn: document.getElementById('fontSizeDecBtn'),
    fontSizeIncBtn: document.getElementById('fontSizeIncBtn')
  };

  // --- Initialization ---
  function init() {
    applyTheme(currentTheme);
    applyFont(currentFont);
    applyFontSize(currentFontSize);
    applyLineHeight(currentLineHeight);
    applyWidth(currentWidth);
    applyLanguage(currentLang);

    // Load saved chapter position if available
    const savedIndex = parseInt(localStorage.getItem('tss_last_chapter') || '0', 10);
    if (savedIndex >= 0 && savedIndex < chapters.length) {
      currentChapterIndex = savedIndex;
    }

    renderChapter();
    renderChapterList();
    setupEventListeners();
  }

  // --- Theme, Font, and Styling Helpers ---
  function applyTheme(theme) {
    currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('tss_theme', theme);
    document.querySelectorAll('.theme-option').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.theme === theme);
    });
  }

  function applyFont(font) {
    currentFont = font;
    localStorage.setItem('tss_font', font);
    if (font === 'sans') {
      document.body.style.setProperty('--current-font', 'var(--font-sans)');
    } else if (font === 'classic') {
      document.body.style.setProperty('--current-font', 'var(--font-display)');
    } else {
      document.body.style.setProperty('--current-font', 'var(--font-serif)');
    }
    document.querySelectorAll('.font-option').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.font === font);
    });
  }

  function applyFontSize(size) {
    currentFontSize = Math.max(14, Math.min(28, size));
    localStorage.setItem('tss_fontsize', currentFontSize);
    document.body.style.setProperty('--reader-font-size', `${currentFontSize}px`);
    if (DOM.fontSizeDisplay) {
      DOM.fontSizeDisplay.textContent = `${currentFontSize}px`;
    }
  }

  function applyLineHeight(lh) {
    currentLineHeight = lh;
    localStorage.setItem('tss_lineheight', lh);
    document.body.style.setProperty('--reader-line-height', lh);
    document.querySelectorAll('.spacing-btn').forEach(btn => {
      btn.classList.toggle('active', parseFloat(btn.dataset.lh) === lh);
    });
  }

  function applyWidth(width) {
    currentWidth = width;
    localStorage.setItem('tss_width', width);
    if (DOM.readerContainer) {
      DOM.readerContainer.classList.toggle('wide', width === 'wide');
    }
    document.querySelectorAll('.width-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.width === width);
    });
  }

  // --- Language Switching Engine ---
  function applyLanguage(lang) {
    if (!I18N[lang]) lang = 'en';
    currentLang = lang;
    localStorage.setItem('tss_lang', lang);

    // Update active state in language buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    if (DOM.floatingLangBtn) {
      DOM.floatingLangBtn.textContent = lang.toUpperCase();
    }

    // Update UI elements text
    const dict = I18N[lang];
    const setText = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };

    setText('siteTitle', dict.siteTitle);
    setText('siteSubtitle', dict.siteSubtitle);
    setText('tocHeading', dict.tocHeading);
    setText('loadFolderLabel', dict.loadFolderLabel);
    setText('drawerLoadFolderLabel', dict.drawerLoadFolderLabel);
    setText('themeLabel', dict.themeLabel);
    setText('fontFamilyLabel', dict.fontFamilyLabel);
    setText('fontSizeLabel', dict.fontSizeLabel);
    setText('lineHeightLabel', dict.lineHeightLabel);
    setText('contentWidthLabel', dict.contentWidthLabel);
    setText('settingsTitle', dict.settingsTitle);
    setText('prevChapterSub', dict.prevSub);
    setText('nextChapterSub', dict.nextSub);
    setText('tocSub', dict.tocSub);
    setText('tocTitle', dict.tocTitle);

    if (DOM.chapterSearch) {
      DOM.chapterSearch.placeholder = dict.chapterSearchPlaceholder;
    }
    if (DOM.sourceBadge) {
      DOM.sourceBadge.textContent = isLocalSource ? dict.sourceLocal : dict.sourceDefault;
    }

    renderChapter();
    renderChapterList();
  }

  // --- Markdown Parser (Lightweight, Safe) ---
  function parseMarkdown(md) {
    if (!md) return '';
    let html = md;

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Horizontal Rules
    html = html.replace(/^---$/gim, '<hr>');

    // Blockquotes
    html = html.replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>');

    // Bold and Italic
    html = html.replace(/\*\*\*(.*?)\*\*\*/gim, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');

    // Unordered lists
    html = html.replace(/^\s*\-\s+(.*$)/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/gim, '<ul>$1</ul>');
    html = html.replace(/<\/ul>\s*<ul>/gim, '');

    // Paragraphs
    const blocks = html.split(/\n{2,}/);
    const parsedBlocks = blocks.map(block => {
      block = block.trim();
      if (!block) return '';
      if (block.startsWith('<h') || block.startsWith('<ul') || block.startsWith('<blockquote') || block.startsWith('<hr')) {
        return block;
      }
      return `<p>${block.replace(/\n/g, '<br>')}</p>`;
    });

    return parsedBlocks.join('\n');
  }

  // --- Render Current Chapter ---
  function renderChapter() {
    if (!chapters || chapters.length === 0) {
      if (DOM.chapterTitle) DOM.chapterTitle.textContent = "No Chapters Available";
      if (DOM.chapterBody) DOM.chapterBody.innerHTML = "<p>Please load your 'final chapters' folder using the button above.</p>";
      return;
    }

    const chapter = chapters[currentChapterIndex];
    if (!chapter) return;

    localStorage.setItem('tss_last_chapter', currentChapterIndex);

    // Get localized title and content
    const title = getLocalizedField(chapter.title, currentLang);
    const subTitle = getLocalizedField(chapter.subTitle, currentLang);
    const rawContent = getLocalizedContent(chapter.content, currentLang);

    // Header info
    if (DOM.chapterArc) DOM.chapterArc.textContent = chapter.arc || "Arc";
    if (DOM.chapterNumberLabel) {
      const numPrefix = currentLang === 'hi' ? 'अध्याय' : (currentLang === 'mr' ? 'प्रकरण' : 'Chapter');
      DOM.chapterNumberLabel.textContent = `${numPrefix} ${chapter.number}`;
    }
    if (DOM.currentChapterIndicatorTop) {
      const numPrefix = currentLang === 'hi' ? 'अध्याय' : (currentLang === 'mr' ? 'प्रकरण' : 'Ch');
      DOM.currentChapterIndicatorTop.textContent = `${numPrefix} ${chapter.number}`;
    }
    if (DOM.readingTime) {
      const minutes = Math.max(3, Math.ceil((rawContent.split(/\s+/).length || 500) / 200));
      DOM.readingTime.textContent = `${minutes} ${I18N[currentLang].readTimeSuffix}`;
    }
    if (DOM.chapterTitle) DOM.chapterTitle.textContent = title;
    if (DOM.chapterSubTitle) {
      DOM.chapterSubTitle.textContent = subTitle || "";
      DOM.chapterSubTitle.style.display = subTitle ? 'block' : 'none';
    }

    // Render body
    if (DOM.chapterBody) {
      let rendered = parseMarkdown(rawContent);
      // If language was not available and fell back to English
      if (currentLang !== 'en' && (!chapter.content[currentLang] || chapter.content[currentLang].length < 100)) {
        rendered = `<div class="untranslated-banner" style="padding: 0.75rem 1rem; margin-bottom: 2rem; background: var(--bg-tertiary); border-left: 3px solid var(--accent-color); font-size: 0.9rem; color: var(--text-secondary); border-radius: 4px;">${I18N[currentLang].untranslatedNote}</div>` + rendered;
      }
      DOM.chapterBody.innerHTML = rendered;
    }

    // Update Next / Prev Buttons
    updateNavButtons();

    // Scroll smoothly to top
    window.scrollTo({ top: 0, behavior: 'instant' });
    updateProgressBar();
  }

  function getLocalizedField(field, lang) {
    if (!field) return '';
    if (typeof field === 'string') return field;
    return field[lang] || field['en'] || Object.values(field)[0] || '';
  }

  function getLocalizedContent(content, lang) {
    if (!content) return '';
    if (typeof content === 'string') return content;
    return content[lang] || content['en'] || Object.values(content)[0] || '';
  }

  function updateNavButtons() {
    const prevExists = currentChapterIndex > 0;
    const nextExists = currentChapterIndex < chapters.length - 1;

    // Top buttons
    if (DOM.prevChapterBtnTop) DOM.prevChapterBtnTop.disabled = !prevExists;
    if (DOM.nextChapterBtnTop) DOM.nextChapterBtnTop.disabled = !nextExists;
    if (DOM.floatingPrevBtn) DOM.floatingPrevBtn.disabled = !prevExists;
    if (DOM.floatingNextBtn) DOM.floatingNextBtn.disabled = !nextExists;

    // Bottom buttons
    if (DOM.prevChapterBtnBottom) {
      DOM.prevChapterBtnBottom.disabled = !prevExists;
      if (DOM.prevChapterTitle) {
        DOM.prevChapterTitle.textContent = prevExists
          ? `← ${getLocalizedField(chapters[currentChapterIndex - 1].title, currentLang)}`
          : I18N[currentLang].noPrevChapter;
      }
    }
    if (DOM.nextChapterBtnBottom) {
      DOM.nextChapterBtnBottom.disabled = !nextExists;
      if (DOM.nextChapterTitle) {
        DOM.nextChapterTitle.textContent = nextExists
          ? `${getLocalizedField(chapters[currentChapterIndex + 1].title, currentLang)} →`
          : I18N[currentLang].noNextChapter;
      }
    }

    // Highlight in drawer list
    document.querySelectorAll('.chapter-item').forEach((item, idx) => {
      item.classList.toggle('active', idx === currentChapterIndex);
    });
  }

  // --- Render Drawer Chapter List ---
  function renderChapterList(searchTerm = '') {
    if (!DOM.chapterList) return;
    DOM.chapterList.innerHTML = '';

    const filtered = chapters.map((ch, idx) => ({ ch, idx })).filter(({ ch }) => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      const title = getLocalizedField(ch.title, currentLang).toLowerCase();
      const numStr = String(ch.number);
      return title.includes(term) || numStr.includes(term);
    });

    if (DOM.chapterCount) {
      DOM.chapterCount.textContent = `${chapters.length} ${I18N[currentLang].chapterCountSuffix}`;
    }

    filtered.forEach(({ ch, idx }) => {
      const a = document.createElement('a');
      a.className = `chapter-item ${idx === currentChapterIndex ? 'active' : ''}`;
      a.href = '#';

      const numPrefix = currentLang === 'hi' ? 'अध्याय' : (currentLang === 'mr' ? 'प्रकरण' : 'Chapter');
      a.innerHTML = `
        <span class="chapter-item-number">${numPrefix} ${ch.number}</span>
        <span class="chapter-item-title">${getLocalizedField(ch.title, currentLang)}</span>
      `;

      a.addEventListener('click', (e) => {
        e.preventDefault();
        currentChapterIndex = idx;
        renderChapter();
        closeDrawer();
      });

      DOM.chapterList.appendChild(a);
    });
  }

  // --- Drawer and Modal Toggles ---
  function openDrawer() {
    if (DOM.drawer) DOM.drawer.classList.add('open');
    if (DOM.drawerOverlay) DOM.drawerOverlay.classList.add('active');
  }

  function closeDrawer() {
    if (DOM.drawer) DOM.drawer.classList.remove('open');
    if (DOM.drawerOverlay) DOM.drawerOverlay.classList.remove('active');
  }

  function openSettings() {
    if (DOM.settingsModal) DOM.settingsModal.classList.add('open');
  }

  function closeSettings() {
    if (DOM.settingsModal) DOM.settingsModal.classList.remove('open');
  }

  // --- Progress Bar ---
  function updateProgressBar() {
    if (!DOM.progressBar) return;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
    DOM.progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
  }

  // --- Navigation Controls ---
  function goToPrevChapter() {
    if (currentChapterIndex > 0) {
      currentChapterIndex--;
      renderChapter();
    }
  }

  function goToNextChapter() {
    if (currentChapterIndex < chapters.length - 1) {
      currentChapterIndex++;
      renderChapter();
    }
  }

  // --- Local Folder Importer for 'final chapters' ---
  async function handleLoadLocalFolder() {
    // Attempt Modern File System Access API
    if ('showDirectoryPicker' in window) {
      try {
        const dirHandle = await window.showDirectoryPicker({
          mode: 'read'
        });
        await parseDirectoryHandle(dirHandle);
        return;
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.warn('DirectoryPicker failed or denied, falling back to input:', err);
        } else {
          return; // User canceled
        }
      }
    }

    // Fallback: Trigger standard directory file input
    if (DOM.directoryInput) {
      DOM.directoryInput.click();
    }
  }

  async function parseDirectoryHandle(dirHandle) {
    const loadedFiles = [];

    async function scanEntries(handle, path = '') {
      for await (const entry of handle.values()) {
        if (entry.kind === 'file') {
          if (entry.name.endsWith('.md') || entry.name.endsWith('.txt')) {
            const file = await entry.getFile();
            const text = await file.text();
            loadedFiles.push({ name: entry.name, path: `${path}/${entry.name}`, content: text });
          }
        } else if (entry.kind === 'directory') {
          await scanEntries(entry, `${path}/${entry.name}`);
        }
      }
    }

    await scanEntries(dirHandle);
    processImportedFiles(loadedFiles);
  }

  function handleDirectoryInputChange(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const loadedFiles = [];
    let readCount = 0;

    files.forEach(file => {
      if (file.name.endsWith('.md') || file.name.endsWith('.txt')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          loadedFiles.push({
            name: file.name,
            path: file.webkitRelativePath || file.name,
            content: event.target.result
          });
          readCount++;
          if (readCount === files.filter(f => f.name.endsWith('.md') || f.name.endsWith('.txt')).length) {
            processImportedFiles(loadedFiles);
          }
        };
        reader.readAsText(file);
      }
    });
  }

  function processImportedFiles(fileList) {
    if (!fileList || fileList.length === 0) {
      alert("No markdown (.md) or text (.txt) files found in the selected folder.");
      return;
    }

    const parsedChapters = [];

    fileList.forEach(file => {
      const match = file.name.match(/chapter[_-]?(\d+)/i) || file.name.match(/(\d+)/);
      const chapterNumber = match ? parseInt(match[1], 10) : 0;

      // Extract first H1 as title
      const lines = file.content.split('\n');
      let title = `Chapter ${chapterNumber}`;
      let firstH1 = lines.find(l => l.trim().startsWith('# '));
      if (firstH1) {
        title = firstH1.replace(/^#\s*/, '').trim();
      }

      // Check if file specifies language
      let lang = 'en';
      if (file.name.includes('_hi.') || file.path.includes('/hi/')) lang = 'hi';
      else if (file.name.includes('_mr.') || file.path.includes('/mr/')) lang = 'mr';

      // Check if chapter already exists in array
      let existing = parsedChapters.find(c => c.number === chapterNumber);
      if (existing) {
        existing.content[lang] = file.content;
        existing.title[lang] = title;
      } else {
        parsedChapters.push({
          id: `chapter-${chapterNumber}`,
          number: chapterNumber,
          arc: chapterNumber > 105 ? "Arc 3: The Savage Wilderness" : (chapterNumber > 66 ? "Arc 2: The Frost-Tower Academy" : "Arc 1: The Ash and the Blind Ember"),
          title: { [lang]: title, en: title },
          subTitle: { [lang]: "", en: "" },
          readingTime: "10 min read",
          content: { [lang]: file.content, en: file.content }
        });
      }
    });

    // Sort chapters by number
    parsedChapters.sort((a, b) => a.number - b.number);

    if (parsedChapters.length > 0) {
      chapters = parsedChapters;
      currentChapterIndex = 0;
      isLocalSource = true;
      if (DOM.sourceBadge) DOM.sourceBadge.textContent = I18N[currentLang].sourceLocal;

      renderChapter();
      renderChapterList();
      closeDrawer();

      alert(I18N[currentLang].loadSuccessMsg.replace('{count}', chapters.length));
    }
  }

  // --- Event Listeners Setup ---
  function setupEventListeners() {
    // Drawer toggles
    if (DOM.drawerToggle) DOM.drawerToggle.addEventListener('click', openDrawer);
    if (DOM.drawerToggleBottom) DOM.drawerToggleBottom.addEventListener('click', openDrawer);
    if (DOM.floatingTocBtn) DOM.floatingTocBtn.addEventListener('click', openDrawer);
    if (DOM.drawerClose) DOM.drawerClose.addEventListener('click', closeDrawer);
    if (DOM.drawerOverlay) DOM.drawerOverlay.addEventListener('click', closeDrawer);

    // Settings modal toggles
    if (DOM.settingsBtn) DOM.settingsBtn.addEventListener('click', openSettings);
    if (DOM.floatingSettingsBtn) DOM.floatingSettingsBtn.addEventListener('click', openSettings);
    if (DOM.settingsClose) DOM.settingsClose.addEventListener('click', closeSettings);
    if (DOM.settingsModal) {
      DOM.settingsModal.addEventListener('click', (e) => {
        if (e.target === DOM.settingsModal) closeSettings();
      });
    }

    // Navigation buttons
    if (DOM.prevChapterBtnTop) DOM.prevChapterBtnTop.addEventListener('click', goToPrevChapter);
    if (DOM.nextChapterBtnTop) DOM.nextChapterBtnTop.addEventListener('click', goToNextChapter);
    if (DOM.prevChapterBtnBottom) DOM.prevChapterBtnBottom.addEventListener('click', goToPrevChapter);
    if (DOM.nextChapterBtnBottom) DOM.nextChapterBtnBottom.addEventListener('click', goToNextChapter);
    if (DOM.floatingPrevBtn) DOM.floatingPrevBtn.addEventListener('click', goToPrevChapter);
    if (DOM.floatingNextBtn) DOM.floatingNextBtn.addEventListener('click', goToNextChapter);

    // Language switchers
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => applyLanguage(btn.dataset.lang));
    });
    if (DOM.floatingLangBtn) {
      DOM.floatingLangBtn.addEventListener('click', () => {
        const order = ['en', 'hi', 'mr'];
        const nextLang = order[(order.indexOf(currentLang) + 1) % order.length];
        applyLanguage(nextLang);
      });
    }

    // Theme options
    document.querySelectorAll('.theme-option').forEach(btn => {
      btn.addEventListener('click', () => applyTheme(btn.dataset.theme));
    });

    // Font options
    document.querySelectorAll('.font-option').forEach(btn => {
      btn.addEventListener('click', () => applyFont(btn.dataset.font));
    });

    // Font size controls
    if (DOM.fontSizeDecBtn) {
      DOM.fontSizeDecBtn.addEventListener('click', () => applyFontSize(currentFontSize - 1));
    }
    if (DOM.fontSizeIncBtn) {
      DOM.fontSizeIncBtn.addEventListener('click', () => applyFontSize(currentFontSize + 1));
    }

    // Spacing controls
    document.querySelectorAll('.spacing-btn').forEach(btn => {
      btn.addEventListener('click', () => applyLineHeight(parseFloat(btn.dataset.lh)));
    });

    // Width controls
    document.querySelectorAll('.width-btn').forEach(btn => {
      btn.addEventListener('click', () => applyWidth(btn.dataset.width));
    });

    // Search input
    if (DOM.chapterSearch) {
      DOM.chapterSearch.addEventListener('input', (e) => {
        renderChapterList(e.target.value);
      });
    }

    // Local folder loading buttons
    if (DOM.loadLocalFolderBtn) DOM.loadLocalFolderBtn.addEventListener('click', handleLoadLocalFolder);
    if (DOM.drawerLoadFolderBtn) DOM.drawerLoadFolderBtn.addEventListener('click', handleLoadLocalFolder);
    if (DOM.directoryInput) DOM.directoryInput.addEventListener('change', handleDirectoryInputChange);

    // Scroll progress bar
    window.addEventListener('scroll', updateProgressBar, { passive: true });

    // Keyboard navigation (Left / Right arrow keys)
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT') return;
      if (e.key === 'ArrowLeft') goToPrevChapter();
      if (e.key === 'ArrowRight') goToNextChapter();
      if (e.key === 'Escape') {
        closeDrawer();
        closeSettings();
      }
    });
  }

  // Start on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
