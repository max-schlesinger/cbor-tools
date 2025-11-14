(function () { 
    // @ts-ignore
    const vscode = acquireVsCodeApi();

    class CborEditor {
        /** @type {HTMLTextAreaElement | null} */
        textarea;
        /** @type {boolean} */
        editable;

        constructor(/** @type {Element} */ element) {
            if (element === null || !(element instanceof HTMLTextAreaElement)) {
                throw new Error('CborEditor hat kein gültiges <textarea> Element erhalten.');
            }
            this.textarea = element;
            this.editable = false;
        }

        _initListeners() {
            this.textarea.addEventListener('input', () => {
                if (!this.editable) {
                    return;
                }
                vscode.postMessage({
                    type: 'update',
                    body: { value: this.textarea.value }
                });
            });
        }

        setEditable(editable) {
            this.editable = editable;
            this.textarea.readOnly = !editable;
        }

        async reset(data) {
            if (data !== undefined) {
                this.textarea.value = data;
            }
        }
    }

    const editorElement = document.querySelector('.edn-preview');
    if (editorElement === null){
        throw new Error('Konnte .edn-preview nicht finden.');
    }

    const editor = new CborEditor(editorElement);

    // Handle messages from the extension
    window.addEventListener('message', async e => {
        const { type, body } = e.data;
        switch (type) {
            case 'init':
                {
                    editor.setEditable(body.editable);
                    
                    editor._initListeners(); 
					
                    if (body.untitled) {
                        await editor.reset('');
                    } else {
                        await editor.reset(body.value);
                    }
                    return;
                }
        }
    });

    // Signal to VS Code that the webview is initialized.
    vscode.postMessage({ type: 'ready' });
}());