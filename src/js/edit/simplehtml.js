/**
 * SimpleHtml Editor
 * A minimal, modular, secure rich text editor.
 */
class SimpleHtml {
    constructor(container, options = {}) {
        this.container = typeof container === 'string' ? document.querySelector(container) : container;
        if (!this.container) throw new Error('SimpleHtml: Container element not found.');

        this.options = Object.assign({
            content: '',
            placeholder: 'Start typing...',
            toolbar: [
                'bold', 'italic', 'underline', '|',
                'h1', 'h2', 'h3', 'p', 'blockquote', 'code', 'removeFormat','|',
                'insertUnorderedList', 'insertOrderedList', '|',
                'link', 'unlink', 'image', 'table', '|',
                'table_row_plus', 'table_row_minus', 'table_col_plus', 'table_col_minus', '|',
                'undo', 'redo', '|',
                'source'
            ],
            buttonClass: {
                blockquote: 'quote',
                insertUnorderedList:'bullet',
                insertOrderedList:'numbered',
                code:'console',
                image: 'pic',
                source:'markup',
                'table_row_plus':'add-row-down',
                'table_row_minus':'row-red',
                'table_col_plus':'add-col-right',
                'table_col_minus':'col-red',
                removeFormat: 'noformat'
            }
        }, options);

        // Undo/Redo Stacks
        this.history = [];
        this.historyIndex = -1;
        this.maxHistory = 50;

        this.allowedTags = {
            'b': [], 'strong': [], 'i': [], 'em': [], 'u': [],
            'p': [], 'div': [],
            'h1': [], 'h2': [], 'h3': [],
            'blockquote': [],
            'ul': [], 'ol': [], 'li': [],
            'a': ['href', 'target', 'title','rel'],
            'img': ['src', 'alt', 'width', 'height'],
            'table': [],
            'thead': [], 'tbody': [], 'tfoot': [],
            'tr': [], 'td': ['colspan', 'rowspan'], 'th': ['colspan', 'rowspan'],
            'code': [], 'pre': [], 'br': [], 'span':[], 'dd':[]
        };

        // Block `javascript:` protocols
        this.disallowedProtocols = ['javascript:', 'vbscript:', 'data:'];
        // Note: data: might be needed for pasted images, but user asked for secure. 
        // We will allow data:image specifically if needed, but let's default to blocking scripts.

        this.init();
    }

    init() {
        // Clear container and setup structure
        this.container.innerHTML = '';
        this.container.classList.add('rnd');

        // Create Toolbar
        this.toolbar = document.createElement('div');
        this.toolbar.className = 'vgh-toolbar';
        this.container.appendChild(this.toolbar);
        this.renderToolbar();
        this.initUrlForm();

        // Create Content Area
        this.contentArea = document.createElement('div');
        this.contentArea.className = 'vgh-content';
        this.contentArea.contentEditable = true;
        // Initial set (will trigger history save)
        this.contentArea.innerHTML = this.sanitize(this.options.content);
        this.container.appendChild(this.contentArea);

        // Create Source View Textarea
        this.sourceArea = document.createElement('textarea');
        this.sourceArea.className = 'vgh-markup';
        this.container.appendChild(this.sourceArea);

        this.initTablePicker();

        // Initialize History
        this.saveHistory();

        // Bind Events
        this.bindEvents();
    }

    renderToolbar() {
        this.toolbar.innerHTML = '';
        this.options.toolbar.forEach(tool => {
            if (tool === '|') {
                const separator = document.createElement('span');
                Object.assign(separator.style, { width: '1px', background: '#ddd', margin: '0 5px' });
                this.toolbar.appendChild(separator);
                return;
            }

            const btn = document.createElement('button');
            btn.type = 'button';
            btn.dataset.command = tool;
            //btn.textContent = this.getButtonLabel(tool);
            btn.title = tool; // Tooltip helper
            btn.className = 'sbn vgi-' + (this.options.buttonClass[tool] || tool);

            // Initial state for table buttons - might be disabled
            if (tool.startsWith('table_')) {
                // We'll manage visibility in updateToolbarState
                btn.style.display = 'none';
            }

            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.execCommand(tool, btn);
            });

            this.toolbar.appendChild(btn);
        });
    }

    getButtonLabel(tool) {
        const labels = {
            'bold': 'B', 'italic': 'I', 'underline': 'U',
            'h1': 'H1', 'h2': 'H2', 'h3': 'H3',
            'p': 'P', 'blockquote': '""', 'code': '{}',
            'removeFormat':'Clear',
            'insertUnorderedList': '•', 'insertOrderedList': '1.',
            'link': '🔗', 'unlink': '⛓️',
            'image': '🖼️', 'table': '▦',
            'table_row_plus': '+Row', 'table_row_minus': '-Row',
            'table_col_plus': '+Col', 'table_col_minus': '-Col',
            'undo': '↩', 'redo': '↪',
            'source': '</>'
        };
        return labels[tool] || tool;
    }

    bindEvents() {
        // Debounce history save
        let timer;
        const updateToolbar = () => this.updateToolbarState();
        const handleInput = () => {
            clearTimeout(timer);
            timer = setTimeout(() => this.saveHistory(), 500);
            updateToolbar();
        };

        this.contentArea.addEventListener('input', handleInput);
        ['keyup', 'mouseup', 'click'].forEach((event) => {
            this.contentArea.addEventListener(event, updateToolbar);
        });

        // Handle Paste
        this.contentArea.addEventListener('paste', (e) => this.handlePaste(e));

        document.addEventListener('mousedown', (e) => {
            if (!this.tablePicker || this.tablePicker.style.display !== 'block') return;
            if (this.tablePicker.contains(e.target)) return;
            const tableBtn = this.toolbar.querySelector('button[data-command="table"]');
            if (tableBtn && (tableBtn === e.target || tableBtn.contains(e.target))) return;
            this.hideTablePicker();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideTablePicker();
                this.hideUrlForm({ restoreSelection: true });
            }
        });
    }

    initUrlForm() {
        if (this.urlForm) return;
        this.urlForm = document.createElement('form');
        Object.assign(this.urlForm, { className: 'simplehtml-url-form', noValidate: true });
        this.urlForm.style.display = 'none';
        this.urlForm.setAttribute('aria-hidden', 'true');

        this.urlInput = document.createElement('input');
        Object.assign(this.urlInput, { type: 'url', className: 'txt simplehtml-url-input', placeholder: 'Enter URL' });
        this.urlInput.setAttribute('aria-label', 'URL');

        this.urlUploadButton = document.createElement('span');
        var b = document.createElement('button');
        Object.assign(b, { type: 'button', className: 'btn vgi-folder', textContent: 'Import File' });
        //b.style.display = 'none';
        this.urlUploadButton.append(document.createTextNode(' or '), b);

        this.urlFileInput = document.createElement('input');
        Object.assign(this.urlFileInput, { type: 'file', accept: 'image/*', className: 'simplehtml-url-file' });
        this.urlFileInput.setAttribute('aria-hidden', 'true');

        this.urlOkButton = document.createElement('button');
        Object.assign(this.urlOkButton, { type: 'submit', className: 'btn sfe simplehtml-url-ok', textContent: 'OK' });

        this.urlCancelButton = document.createElement('button');
        Object.assign(this.urlCancelButton, { type: 'button', className: 'btn simplehtml-url-cancel', textContent: 'Cancel' });

        this.urlForm.append(this.urlInput, this.urlUploadButton, this.urlOkButton, this.urlCancelButton, this.urlFileInput);
        this.container.appendChild(this.urlForm);

        const resetFileInput = () => { this.urlFileInput.value = ''; };
        const closeUrlForm = () => {
            this.hideUrlForm({ restoreSelection: true });
            this.contentArea.focus();
        };

        this.urlForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.applyUrl();
        });

        this.urlUploadButton.addEventListener('click', (e) => {
            e.preventDefault();
            resetFileInput();
            this.urlFileInput.click();
        });

        this.urlFileInput.addEventListener('change', () => {
            const file = this.urlFileInput.files && this.urlFileInput.files[0];
            if (!file || this.urlFormMode !== 'image') return resetFileInput();
            if (file.type && !file.type.startsWith('image/')) return resetFileInput();
            const reader = new FileReader();
            reader.onload = () => {
                const dataUrl = typeof reader.result === 'string' ? reader.result : '';
                if (!dataUrl) return resetFileInput();
                this.urlInput.value = dataUrl;
                this.applyUrl();
                resetFileInput();
                closeUrlForm();
            };
            reader.onerror = resetFileInput;
            reader.readAsDataURL(file);
        });

        this.urlCancelButton.addEventListener('click', closeUrlForm);

        this.urlForm.addEventListener('keydown', (e) => {
            if (e.key !== 'Escape') return;
            e.preventDefault();
            closeUrlForm();
        });

        this.urlFormPinned = false;
        this.urlFormTarget = this.urlFormRange = this.urlFormMode = null;
    }

    setUrlFormMode(mode) {
        this.urlFormMode = mode;
        if (!this.urlInput) return;
        const isImage = mode === 'image';
        const label = isImage ? 'Image URL' : mode === 'link' ? 'Link URL' : 'URL';
        this.urlInput.setAttribute('aria-label', label);
        if (this.urlUploadButton) this.urlUploadButton.style.display = isImage ? 'inline-block' : 'none';
    }

    showUrlForm({ value = '', pin = false, focus = false } = {}) {
        if (!this.urlForm) this.initUrlForm();
        this.urlFormPinned = pin;
        this.urlForm.style.display = 'flex';
        this.urlForm.setAttribute('aria-hidden', 'false');
        this.urlInput.value = value;
        if (focus) {
            this.urlInput.focus();
            this.urlInput.select();
        }
    }

    hideUrlForm({ restoreSelection = false } = {}) {
        if (!this.urlForm) return;
        this.urlForm.style.display = 'none';
        this.urlForm.setAttribute('aria-hidden', 'true');
        if (restoreSelection) this.restoreSelection(this.urlFormRange);
        this.urlFormPinned = false;
        this.urlFormTarget = this.urlFormRange = null;
        this.setUrlFormMode(null);
    }

    openUrlForm({ auto = false, target = null, mode, defaultValue = '' } = {}) {
        const resolved = target || (mode === 'image' ? this.getImageAtSelection() : this.getLinkAtSelection());
        if (auto && !resolved) {
            this.hideUrlForm();
            return;
        }
        this.urlFormRange = this.saveSelection();
        this.urlFormTarget = resolved;
        this.setUrlFormMode(mode);
        const attr = mode === 'image' ? 'src' : 'href';
        const value = resolved ? resolved.getAttribute(attr) || '' : defaultValue;
        this.showUrlForm({ value, pin: !auto, focus: !auto });
    }

    openImageForm({ auto = false, image = null } = {}) {
        this.openUrlForm({ auto, target: image, mode: 'image' });
    }

    openLinkForm({ auto = false, link = null } = {}) {
        this.openUrlForm({ auto, target: link, mode: 'link', defaultValue: 'https://' });
    }

    applyUrl() {
        const url = this.urlInput.value.trim();
        if (!url) {
            this.hideUrlForm({ restoreSelection: true });
            this.contentArea.focus();
            return;
        }

        const target = this.urlFormTarget;
        const isImage = this.urlFormMode === 'image';
        const isLink = this.urlFormMode === 'link';
        if (!isImage && !isLink) {
            this.hideUrlForm({ restoreSelection: true });
            this.contentArea.focus();
            return;
        }

        const tagName = isImage ? 'IMG' : 'A';
        const attr = isImage ? 'src' : 'href';
        const command = isImage ? 'insertImage' : 'createLink';
        if (target && target.tagName === tagName && this.contentArea.contains(target)) {
            target.setAttribute(attr, url);
        } else {
            this.contentArea.focus();
            this.restoreSelection(this.urlFormRange);
            document.execCommand(command, false, url);
        }

        this.saveHistory();
        this.hideUrlForm();
        this.updateToolbarState();
        this.contentArea.focus();
    }

    syncUrlFormWithSelection() {
        if (!this.urlForm || this.urlFormPinned) return;
        if (this.sourceArea && this.sourceArea.style.display === 'block') {
            this.hideUrlForm();
            return;
        }
        const link = this.getLinkAtSelection();
        if (link) {
            const currentValue = link.getAttribute('href') || '';
            if (this.urlFormTarget !== link || this.urlFormMode !== 'link' || this.urlForm.style.display === 'none') {
                this.openLinkForm({ auto: true, link });
            } else if (this.urlInput.value !== currentValue) {
                this.urlInput.value = currentValue;
            }
            return;
        }
        const image = this.getImageAtSelection();
        if (image) {
            const currentValue = image.getAttribute('src') || '';
            if (this.urlFormTarget !== image || this.urlFormMode !== 'image' || this.urlForm.style.display === 'none') {
                this.openImageForm({ auto: true, image });
            } else if (this.urlInput.value !== currentValue) {
                this.urlInput.value = currentValue;
            }
        } else {
            this.hideUrlForm();
        }
    }

    getImageAtSelection() {
        const selection = window.getSelection();
        if (!selection || !selection.rangeCount) return null;
        const range = selection.getRangeAt(0);
        if (!this.contentArea.contains(range.commonAncestorContainer)) return null;

        let node = range.commonAncestorContainer;
        node = node.nodeType === 1 ? node : node.parentNode;
        if (!node) return null;

        if (node.tagName === 'IMG') return node;
        const img = node.closest && node.closest('img');
        if (img && this.contentArea.contains(img)) return img;

        if (range.startContainer.nodeType === 1) {
            const child = range.startContainer.childNodes[range.startOffset];
            if (child && child.nodeType === 1 && child.tagName === 'IMG') return child;
        }

        if (range.endContainer.nodeType === 1) {
            const index = Math.max(0, range.endOffset - 1);
            const child = range.endContainer.childNodes[index];
            if (child && child.nodeType === 1 && child.tagName === 'IMG') return child;
        }

        return null;
    }

    getLinkAtSelection() {
        const selection = window.getSelection();
        if (!selection || !selection.rangeCount) return null;
        const range = selection.getRangeAt(0);
        if (!this.contentArea.contains(range.commonAncestorContainer)) return null;

        let node = range.commonAncestorContainer;
        node = node.nodeType === 1 ? node : node.parentNode;
        if (!node) return null;

        if (node.tagName === 'A') return node;
        const anchor = node.closest && node.closest('a');
        return anchor && this.contentArea.contains(anchor) ? anchor : null;
    }

    updateToolbarState() {
        const selection = window.getSelection();
        let node = null;
        if (selection.rangeCount > 0) {
            node = selection.getRangeAt(0).commonAncestorContainer;
            node = node.nodeType === 3 ? node.parentNode : node;
        }

        // 1. Native Commands
        this.options.toolbar.forEach((tool) => {
            if (tool === '|') return;
            const btn = this.toolbar.querySelector(`button[data-command="${tool}"]`);
            if (!btn) return;

            // Handle Table Context Buttons
            if (tool.startsWith('table_')) {
                btn.style.display = node && node.closest('div.vgh-content table') ? 'inline-block' : 'none';
                return;
            }
            if (document.queryCommandState && !['source', 'undo', 'redo'].includes(tool)) {
                try {
                    const active = document.queryCommandState(tool) ||
                        (node && ['blockquote', 'code'].includes(tool) && node.closest(`div.vgh-content ${tool}`));
                    btn.classList.toggle('active', active);
                } catch (e) { }
            }
        });

        // 2. Undo/Redo State
        const btnUndo = this.toolbar.querySelector('button[data-command="undo"]');
        if (btnUndo) btnUndo.disabled = this.historyIndex <= 0;

        const btnRedo = this.toolbar.querySelector('button[data-command="redo"]');
        if (btnRedo) btnRedo.disabled = this.historyIndex >= this.history.length - 1;

        this.syncUrlFormWithSelection();
    }

    handlePaste(e) {
        e.preventDefault();
        const data = e.clipboardData || window.clipboardData;
        const html = data.getData('text/html');
        const text = data.getData('text');

        // Favor HTML, but strictly sanitize it
        const content = html ? this.sanitize(html) : text.replace(/\n/g, '<br>');

        document.execCommand('insertHTML', false, content);
    }

    execCommand(command, btn) {
        this.contentArea.focus();

        // Snapshot for undo - normally handled by input, but some commands might use modal/etc
        // For simple execCommands, the input event fires.

        switch (command) {
            case 'h1': case 'h2': case 'h3': case 'p': case 'blockquote':
                document.execCommand('formatBlock', false, command);
                break;
            case 'code':
                const selection = window.getSelection();
                if (!selection.isCollapsed) {
                    const range = selection.getRangeAt(0);
                    const code = document.createElement('code');
                    code.textContent = selection.toString();
                    document.execCommand('insertHTML', false, code.outerHTML);
                }
                break;
            case 'source':
                this.toggleSourceView(btn);
                break;
            case 'link':
                this.openLinkForm();
                break;
            case 'image':
                this.openImageForm();
                break;
            case 'table':
                this.insertTable(btn);
                break;
            case 'table_row_plus': this.modifyTable('row', 'add'); break;
            case 'table_row_minus': this.modifyTable('row', 'delete'); break;
            case 'table_col_plus': this.modifyTable('col', 'add'); break;
            case 'table_col_minus': this.modifyTable('col', 'delete'); break;
            case 'unlink':
                this.unlinkAtCaret();
                break;
            case 'removeFormat':
                this.removeAllFormatting();
                break;
            case 'undo':
                this.performUndo();
                break;
            case 'redo':
                this.performRedo();
                break;
            default:
                document.execCommand(command, false, null);
                break;
        }
        this.updateToolbarState();
    }

    removeAllFormatting() {
        const lines = (this.contentArea.innerText || '').replace(/\r\n/g, '\n').split('\n');
        const fragment = document.createDocumentFragment();
        lines.forEach((line, index) => {
            if (index > 0) fragment.appendChild(document.createElement('br'));
            fragment.appendChild(document.createTextNode(line));
        });
        this.contentArea.innerHTML = '';
        this.contentArea.appendChild(fragment);
        this.saveHistory();
    }

    saveHistory() {
        const currentHtml = this.contentArea.innerHTML;
        // If identical to last save, skip
        if (this.history[this.historyIndex] === currentHtml) return;

        // Truncate future if we were in middle
        this.history = this.history.slice(0, this.historyIndex + 1);
        this.history.push(currentHtml);
        if (this.history.length > this.maxHistory) this.history.shift();
        else this.historyIndex++;

        this.updateToolbarState();
    }

    performUndo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.contentArea.innerHTML = this.history[this.historyIndex];
            this.updateToolbarState();
        }
    }

    performRedo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.contentArea.innerHTML = this.history[this.historyIndex];
            this.updateToolbarState();
        }
    }

    saveSelection() {
        const selection = window.getSelection();
        return selection.rangeCount ? selection.getRangeAt(0).cloneRange() : null;
    }

    restoreSelection(range) {
        if (!range) return;
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    }

    unlinkAtCaret() {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        if (!selection.isCollapsed) {
            document.execCommand('unlink', false, null);
            return;
        }

        const range = selection.getRangeAt(0);
        let node = range.commonAncestorContainer;
        if (node.nodeType === 3) node = node.parentNode;
        const anchor = node && node.closest ? node.closest('a') : null;
        if (!anchor) {
            document.execCommand('unlink', false, null);
            return;
        }

        const marker = document.createElement('span');
        marker.setAttribute('data-sh-caret', '1');
        range.insertNode(marker);

        const parent = anchor.parentNode;
        while (anchor.firstChild) {
            parent.insertBefore(anchor.firstChild, anchor);
        }
        parent.removeChild(anchor);

        const newRange = document.createRange();
        newRange.setStartAfter(marker);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
        marker.parentNode.removeChild(marker);

        this.saveHistory();
    }

    initTablePicker() {
        if (this.tablePicker) return;
        const containerStyle = window.getComputedStyle(this.container);
        if (containerStyle.position === 'static') {
            this.container.style.position = 'relative';
        }

        this.tablePicker = document.createElement('div');
        this.tablePicker.className = 'simplehtml-table-picker';
        this.tablePicker.style.display = 'none';
        this.tablePicker.setAttribute('aria-hidden', 'true');

        this.tablePickerLabel = document.createElement('div');
        this.tablePickerLabel.className = 'simplehtml-table-picker-label';
        this.tablePickerLabel.textContent = '0 x 0';

        this.tablePickerGrid = document.createElement('div');
        this.tablePickerGrid.className = 'simplehtml-table-picker-grid';

        this.tablePickerCells = [];
        const max = 12;
        for (let r = 1; r <= max; r++) {
            for (let c = 1; c <= max; c++) {
                const cell = document.createElement('div');
                cell.className = 'simplehtml-table-picker-cell';
                cell.dataset.row = r;
                cell.dataset.col = c;
                this.tablePickerGrid.appendChild(cell);
                this.tablePickerCells.push(cell);
            }
        }

        this.tablePicker.appendChild(this.tablePickerLabel);
        this.tablePicker.appendChild(this.tablePickerGrid);
        this.container.appendChild(this.tablePicker);

        this.tablePickerGrid.addEventListener('mouseover', (e) => {
            const cell = e.target.closest('.simplehtml-table-picker-cell');
            if (!cell) return;
            const rows = parseInt(cell.dataset.row, 10);
            const cols = parseInt(cell.dataset.col, 10);
            this.updateTablePickerSelection(rows, cols);
        });

        this.tablePickerGrid.addEventListener('click', (e) => {
            const cell = e.target.closest('.simplehtml-table-picker-cell');
            if (!cell) return;
            const rows = parseInt(cell.dataset.row, 10);
            const cols = parseInt(cell.dataset.col, 10);
            this.insertTableWithSize(rows, cols);
            this.hideTablePicker();
        });
    }

    showTablePicker(btn) {
        this.updateTablePickerSelection(0, 0);
        this.tablePicker.style.display = 'block';
        this.tablePicker.setAttribute('aria-hidden', 'false');

        const containerRect = this.container.getBoundingClientRect();
        const pickerRect = this.tablePicker.getBoundingClientRect();
        let left = 8;
        let top = this.toolbar ? this.toolbar.offsetHeight + 8 : 8;

        if (btn) {
            const btnRect = btn.getBoundingClientRect();
            left = btnRect.left - containerRect.left;
            top = btnRect.bottom - containerRect.top + 6;
        }

        if (left + pickerRect.width > containerRect.width) {
            left = containerRect.width - pickerRect.width - 6;
        }
        if (left < 0) left = 0;
        if (top < 0) top = 0;

        this.tablePicker.style.left = `${left}px`;
        this.tablePicker.style.top = `${top}px`;
    }

    hideTablePicker() {
        if (!this.tablePicker) return;
        this.tablePicker.style.display = 'none';
        this.tablePicker.setAttribute('aria-hidden', 'true');
        this.tablePickerSelectionRange = null;
    }

    updateTablePickerSelection(rows, cols) {
        const label = rows && cols ? `${rows} x ${cols}` : '0 x 0';
        this.tablePickerLabel.textContent = label;
        this.tablePickerCells.forEach((cell) => {
            const cellRow = parseInt(cell.dataset.row, 10);
            const cellCol = parseInt(cell.dataset.col, 10);
            if (cellRow <= rows && cellCol <= cols) {
                cell.classList.add('active');
            } else {
                cell.classList.remove('active');
            }
        });
    }

    insertTable(btn) {
        if (!this.tablePicker) this.initTablePicker();
        if (this.tablePicker.style.display === 'block') {
            this.hideTablePicker();
            return;
        }
        this.tablePickerSelectionRange = this.saveSelection();
        this.showTablePicker(btn);
    }

    insertTableWithSize(rows, cols) {
        if (!rows || !cols) return;
        this.contentArea.focus();
        this.restoreSelection(this.tablePickerSelectionRange);

        let html = '<table><tbody>';
        const cells = '<td></td>'.repeat(cols);
        for (let r = 0; r < rows; r++) html += `<tr>${cells}</tr>`;
        html += '</tbody></table><p><br></p>';
        document.execCommand('insertHTML', false, html);
    }

    modifyTable(type, action) {
        const selection = window.getSelection();
        if (selection.rangeCount === 0) return;
        let node = selection.getRangeAt(0).commonAncestorContainer;
        node = node.nodeType === 3 ? node.parentNode : node;
        const td = node.closest('div.vgh-content td') || node.closest('div.vgh-content th');
        if (!td) return;
        const tr = td.parentNode;
        const table = tr.closest('div.vgh-content table');
        const rowIndex = tr.rowIndex;
        const colIndex = Array.from(tr.children).indexOf(td);

        if (type === 'row') {
            if (action === 'add') {
                const newRow = table.insertRow(rowIndex + 1);
                for (let i = 0; i < tr.children.length; i++) {
                    newRow.insertCell(i).innerHTML = '<br>';
                }
            } else if (action === 'delete') {
                table.deleteRow(rowIndex);
            }
        } else if (type === 'col') {
            // Iterate all rows
            for (let i = 0; i < table.rows.length; i++) {
                if (action === 'add') {
                    table.rows[i].insertCell(colIndex + 1).innerHTML = '<br>';
                } else if (action === 'delete') {
                    if (table.rows[i].cells.length > 1) {
                        table.rows[i].deleteCell(colIndex);
                    }
                }
            }
        }
        this.saveHistory();
    }

    toggleSourceView(btn) {
        this.hideUrlForm();
        const isSource = this.sourceArea.style.display === 'block';
        if (isSource) {
            this.setValue(this.sourceArea.value);
            this.sourceArea.style.display = 'none';
            this.contentArea.style.display = 'block';
        } else {
            this.sourceArea.value = this.getValue();
            this.contentArea.style.display = 'none';
            this.sourceArea.style.display = 'block';
        }
        if (btn) btn.classList.toggle('active', !isSource);
    }

    getValue() {
        return this.sanitize(this.sourceArea.style.display === 'block' ? this.sourceArea.value : this.contentArea.innerHTML);
    }

    setValue(html) {
        const clean = this.sanitize(html);
        this.contentArea.innerHTML = this.sourceArea.value = clean;
        this.saveHistory(); // Record state change
    }

    sanitize(html) {
        if (!html) return '';
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const cleanNode = (node) => {
            if (node.nodeType === 3) return node.cloneNode(true);
            if (node.nodeType !== 1) return null;
            const tag = node.tagName.toLowerCase();
            if (!this.allowedTags.hasOwnProperty(tag)) {
                if (['script', 'style', 'iframe', 'object', 'embed'].includes(tag)) return null;
                const fragment = document.createDocumentFragment();
                for (let i = 0; i < node.childNodes.length; i++) {
                    const child = cleanNode(node.childNodes[i]);
                    if (child) fragment.appendChild(child);
                }
                return fragment;
            }

            const el = document.createElement(tag);
            const allowedAttrs = this.allowedTags[tag];
            for (let i = 0; i < node.attributes.length; i++) {
                const attr = node.attributes[i];
                if (!allowedAttrs.includes(attr.name)) continue;
                if (attr.name === 'href' || attr.name === 'src') {
                    const val = attr.value.toLowerCase().trim();
                    if (this.disallowedProtocols.some(p => val.startsWith(p)) &&
                        !(attr.name === 'src' && val.startsWith('data:image/'))) {
                        continue;
                    }
                }
                el.setAttribute(attr.name, attr.value);
            }

            for (let i = 0; i < node.childNodes.length; i++) {
                const child = cleanNode(node.childNodes[i]);
                if (child) el.appendChild(child);
            }
            return el;
        };

        const result = document.createElement('div');
        for (let i = 0; i < doc.body.childNodes.length; i++) {
            const cleaned = cleanNode(doc.body.childNodes[i]);
            if (cleaned) result.appendChild(cleaned);
        }
        return result.innerHTML;
    }
}

// Export if module system is present, otherwise global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SimpleHtml;
} else {
    window.SimpleHtml = SimpleHtml;
}
