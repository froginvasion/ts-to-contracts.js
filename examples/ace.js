define(["require", "exports", "contracts-js", "ace"], function(require, exports) {
    var C = require("contracts-js");
    var Fun, Arr, RegExp, ace, AceAjax, Delta, EditorCommand, CommandManager, Annotation, TokenInfo, Position, KeyBinding, _KeyBinding, TextMode, Ace, Anchor, _Anchor, BackgroundTokenizer, _BackgroundTokenizer, Document, _Document, IEditSession, EditSession, Editor, _Editor, PlaceHolder, _PlaceHolder, IRangeList, RangeList, Range, _Range, RenderLoop, _RenderLoop, ScrollBar, _ScrollBar, Search, _Search, Selection, _Selection, Split, _Split, TokenIterator, _TokenIterator, Tokenizer, _Tokenizer, UndoManager, _UndoManager, VirtualRenderer, _VirtualRenderer, _ace;
    ace = require("ace"); // Type definitions for Ace Ajax.org Cloud9 Editor
    // Project: http://ace.ajax.org/
    // Definitions by: Diullei Gomes <https://github.com/Diullei>
    // Definitions: https://github.com/borisyankov/DefinitelyTyped

    Delta = C.object({
        action: C.Str,
        range: _Range,
        text: C.Str,
        lines: C.Arr(C.Str)
    }, {}, "Delta");
    EditorCommand = C.object({
        name: C.Str,
        bindKey: C.Any,
        exec: C.Fun
    }, {}, "EditorCommand");
    CommandManager = C.object({
        platform: C.Str,
        addCommands: C.fun([C.Arr(EditorCommand)], C.Any, {}),
        addCommand: C.fun([EditorCommand], C.Any, {}),
        exec: C.fun([C.Str, _Editor, C.Any], C.Any, {})
    }, {}, "CommandManager");
    Annotation = C.object({
        row: C.Num,
        column: C.Num,
        text: C.Str,
        type: C.Str
    }, {}, "Annotation");
    TokenInfo = C.object({
        value: C.Str
    }, {}, "TokenInfo");
    Position = C.object({
        row: C.Num,
        column: C.Num
    }, {}, "Position");
    _KeyBinding = C.object({
        setDefaultHandler: C.fun([], C.Any, {}),
        setKeyboardHandler: C.fun([], C.Any, {}),
        addKeyboardHandler: C.fun([], C.Any, {}),
        removeKeyboardHandler: C.fun([], C.Bool, {}),
        getKeyboardHandler: C.fun([], C.Any, {}),
        onCommandKey: C.fun([], C.Any, {}),
        onTextInput: C.fun([], C.Any, {})
    }, {}, "KeyBinding");
    TextMode = C.object({
        getTokenizer: C.fun([], C.Any, {}),
        toggleCommentLines: C.fun([], C.Any, {}),
        getNextLineIndent: C.fun([], C.Str, {}),
        checkOutdent: C.fun([], C.Bool, {}),
        autoOutdent: C.fun([], C.Any, {}),
        createWorker: C.fun([], C.Any, {}),
        createModeDelegates: C.fun([], C.Any, {}),
        transformAction: C.fun([], C.Any, {})
    }, {}, "TextMode");
    Ace = C.object({
        require: C.fun([C.Str], C.Any, {}),
        edit: C.overload_fun(C.fun([C.Any], _Editor, {}), C.fun([C.Str], _Editor, {})),
        createEditSession: C.overload_fun(C.fun([C.Str, TextMode], IEditSession, {}), C.fun([_Document, TextMode], IEditSession, {}))
    }, {}, "Ace");
    _Anchor = C.object({
        on: C.fun([C.Str, C.fun([], C.Any, {})], C.Any, {}),
        getPosition: C.fun([], Position, {}),
        getDocument: C.fun([], _Document, {}),
        onChange: C.fun([C.Any], C.Any, {}),
        setPosition: C.fun([C.Num, C.Num, C.Bool], C.Any, {}),
        detach: C.fun([], C.Any, {})
    }, {}, "Anchor");
    _BackgroundTokenizer = C.object({
        states: C.Arr(C.Any),
        setTokenizer: C.fun([_Tokenizer], C.Any, {}),
        setDocument: C.fun([_Document], C.Any, {}),
        fireUpdateEvent: C.fun([C.Num, C.Num], C.Any, {}),
        start: C.fun([C.Num], C.Any, {}),
        stop: C.fun([], C.Any, {}),
        getTokens: C.fun([C.Num], C.Arr(TokenInfo), {}),
        getState: C.fun([C.Num], C.Str, {})
    }, {}, "BackgroundTokenizer");
    _Document = C.object({
        on: C.fun([C.Str, C.fun([], C.Any, {})], C.Any, {}),
        setValue: C.fun([C.Str], C.Any, {}),
        getValue: C.fun([], C.Str, {}),
        createAnchor: C.fun([C.Num, C.Num], C.Any, {}),
        getNewLineCharacter: C.fun([], C.Str, {}),
        setNewLineMode: C.fun([C.Str], C.Any, {}),
        getNewLineMode: C.fun([], C.Str, {}),
        isNewLine: C.fun([C.Str], C.Bool, {}),
        getLine: C.fun([C.Num], C.Str, {}),
        getLines: C.fun([C.Num, C.Num], C.Arr(C.Str), {}),
        getAllLines: C.fun([], C.Arr(C.Str), {}),
        getLength: C.fun([], C.Num, {}),
        getTextRange: C.fun([_Range], C.Str, {}),
        insert: C.fun([Position, C.Str], C.Any, {}),
        insertLines: C.fun([C.Num, C.Arr(C.Str)], C.Any, {}),
        insertNewLine: C.fun([Position], C.Any, {}),
        insertInLine: C.fun([C.Any, C.Str], C.Any, {}),
        remove: C.fun([_Range], C.Any, {}),
        removeInLine: C.fun([C.Num, C.Num, C.Num], C.Any, {}),
        removeLines: C.fun([C.Num, C.Num], C.Arr(C.Str), {}),
        removeNewLine: C.fun([C.Num], C.Any, {}),
        replace: C.fun([_Range, C.Str], C.Any, {}),
        applyDeltas: C.fun([C.Arr(Delta)], C.Any, {}),
        revertDeltas: C.fun([C.Arr(Delta)], C.Any, {}),
        indexToPosition: C.fun([C.Num, C.Num], Position, {}),
        positionToIndex: C.fun([Position, C.Num], C.Num, {})
    }, {}, "Document");
    IEditSession = C.object({
        selection: _Selection,
        bgTokenizer: _BackgroundTokenizer,
        doc: _Document,
        on: C.fun([C.Str, C.fun([], C.Any, {})], C.Any, {}),
        findMatchingBracket: C.fun([Position], C.Any, {}),
        addFold: C.fun([C.Str, _Range], C.Any, {}),
        getFoldAt: C.fun([C.Num, C.Num], C.Any, {}),
        removeFold: C.fun([C.Any], C.Any, {}),
        expandFold: C.fun([C.Any], C.Any, {}),
        unfold: C.fun([C.Any, C.Bool], C.Any, {}),
        screenToDocumentColumn: C.fun([C.Num, C.Num], C.Any, {}),
        getFoldDisplayLine: C.fun([C.Any, C.Num, C.Num], C.Any, {}),
        getFoldsInRange: C.fun([_Range], C.Any, {}),
        highlight: C.fun([C.Str], C.Any, {}),
        setDocument: C.fun([_Document], C.Any, {}),
        getDocument: C.fun([], _Document, {}),
        $resetRowCache: C.fun([C.Num], C.Any, {}),
        setValue: C.fun([C.Str], C.Any, {}),
        setMode: C.fun([C.Str], C.Any, {}),
        getValue: C.fun([], C.Str, {}),
        getSelection: C.fun([], _Selection, {}),
        getState: C.fun([C.Num], C.Str, {}),
        getTokens: C.fun([C.Num], C.Arr(TokenInfo), {}),
        getTokenAt: C.fun([C.Num, C.Num], TokenInfo, {}),
        setUndoManager: C.fun([_UndoManager], C.Any, {}),
        getUndoManager: C.fun([], _UndoManager, {}),
        getTabString: C.fun([], C.Str, {}),
        setUseSoftTabs: C.fun([C.Bool], C.Any, {}),
        getUseSoftTabs: C.fun([], C.Bool, {}),
        setTabSize: C.fun([C.Num], C.Any, {}),
        getTabSize: C.fun([], C.Str, {}),
        isTabStop: C.fun([C.Any], C.Bool, {}),
        setOverwrite: C.fun([C.Bool], C.Any, {}),
        getOverwrite: C.fun([], C.Bool, {}),
        toggleOverwrite: C.fun([], C.Any, {}),
        addGutterDecoration: C.fun([C.Num, C.Str], C.Any, {}),
        removeGutterDecoration: C.fun([C.Num, C.Str], C.Any, {}),
        getBreakpoints: C.fun([], C.Arr(C.Num), {}),
        setBreakpoints: C.fun([C.Arr(C.Any)], C.Any, {}),
        clearBreakpoints: C.fun([], C.Any, {}),
        setBreakpoint: C.fun([C.Num, C.Str], C.Any, {}),
        clearBreakpoint: C.fun([C.Num], C.Any, {}),
        addDynamicMarker: C.fun([C.Any, C.Bool], C.Any, {}),
        removeMarker: C.fun([C.Num], C.Any, {}),
        getMarkers: C.fun([C.Bool], C.Arr(C.Any), {}),
        setAnnotations: C.fun([C.Arr(Annotation)], C.Any, {}),
        getAnnotations: C.fun([], C.Any, {}),
        clearAnnotations: C.fun([], C.Any, {}),
        $detectNewLine: C.fun([C.Str], C.Any, {}),
        getWordRange: C.fun([C.Num, C.Num], _Range, {}),
        getAWordRange: C.fun([C.Num, C.Num], C.Any, {}),
        setNewLineMode: C.fun([C.Str], C.Any, {}),
        getNewLineMode: C.fun([], C.Str, {}),
        setUseWorker: C.fun([C.Bool], C.Any, {}),
        getUseWorker: C.fun([], C.Bool, {}),
        onReloadTokenizer: C.fun([], C.Any, {}),
        $mode: C.fun([TextMode], C.Any, {}),
        getMode: C.fun([], TextMode, {}),
        setScrollTop: C.fun([C.Num], C.Any, {}),
        getScrollTop: C.fun([], C.Num, {}),
        setScrollLeft: C.fun([], C.Any, {}),
        getScrollLeft: C.fun([], C.Num, {}),
        getScreenWidth: C.fun([], C.Num, {}),
        getLine: C.fun([C.Num], C.Str, {}),
        getLines: C.fun([C.Num, C.Num], C.Arr(C.Str), {}),
        getLength: C.fun([], C.Num, {}),
        getTextRange: C.fun([_Range], C.Str, {}),
        insert: C.fun([Position, C.Str], C.Any, {}),
        remove: C.fun([_Range], C.Any, {}),
        undoChanges: C.fun([C.Arr(C.Any), C.Bool], _Range, {}),
        redoChanges: C.fun([C.Arr(C.Any), C.Bool], _Range, {}),
        setUndoSelect: C.fun([C.Bool], C.Any, {}),
        replace: C.fun([_Range, C.Str], C.Any, {}),
        moveText: C.fun([_Range, C.Any], _Range, {}),
        indentRows: C.fun([C.Num, C.Num, C.Str], C.Any, {}),
        outdentRows: C.fun([_Range], C.Any, {}),
        moveLinesUp: C.fun([C.Num, C.Num], C.Num, {}),
        moveLinesDown: C.fun([C.Num, C.Num], C.Num, {}),
        duplicateLines: C.fun([C.Num, C.Num], C.Num, {}),
        setUseWrapMode: C.fun([C.Bool], C.Any, {}),
        getUseWrapMode: C.fun([], C.Bool, {}),
        setWrapLimitRange: C.fun([C.Num, C.Num], C.Any, {}),
        adjustWrapLimit: C.fun([C.Num], C.Bool, {}),
        getWrapLimit: C.fun([], C.Num, {}),
        getWrapLimitRange: C.fun([], C.Any, {}),
        $getDisplayTokens: C.fun([C.Str, C.Num], C.Any, {}),
        $getStringScreenWidth: C.fun([C.Str, C.Num, C.Num], C.Arr(C.Num), {}),
        getRowLength: C.fun([C.Num], C.Num, {}),
        getScreenLastRowColumn: C.fun([C.Num], C.Num, {}),
        getDocumentLastRowColumn: C.fun([C.Num, C.Num], C.Num, {}),
        getDocumentLastRowColumnPosition: C.fun([C.Num, C.Num], C.Num, {}),
        getRowSplitData: C.fun([], C.Str, {}),
        getScreenTabSize: C.fun([C.Num], C.Num, {}),
        screenToDocumentPosition: C.fun([C.Num, C.Num], C.Any, {}),
        documentToScreenPosition: C.fun([C.Num, C.Num], C.Any, {}),
        documentToScreenColumn: C.fun([C.Num, C.Num], C.Num, {}),
        documentToScreenRow: C.fun([C.Num, C.Num], C.Any, {}),
        getScreenLength: C.fun([], C.Num, {}),
        addMarker: C.overload_fun(C.fun([_Range, C.Str, C.Str, C.Bool], C.Any, {}), C.fun([_Range, C.Str, C.Fun, C.Bool], C.Any, {}))
    }, {}, "IEditSession");
    _Editor = C.object({
        inMultiSelectMode: C.Bool,
        selectMoreLines: C.fun([C.Num], C.Any, {}),
        onTextInput: C.fun([C.Str], C.Any, {}),
        onCommandKey: C.fun([], C.Any, {}),
        commands: CommandManager,
        session: IEditSession,
        selection: _Selection,
        renderer: _VirtualRenderer,
        keyBinding: _KeyBinding,
        container: C.Any,
        onSelectionChange: C.fun([], C.Any, {}),
        onChangeMode: C.fun([C.opt(C.Any)], C.Any, {}),
        execCommand: C.fun([C.Str, C.opt(C.Any)], C.Any, {}),
        setKeyboardHandler: C.fun([C.Str], C.Any, {}),
        getKeyboardHandler: C.fun([], C.Str, {}),
        setSession: C.fun([IEditSession], C.Any, {}),
        getSession: C.fun([], IEditSession, {}),
        setValue: C.fun([C.Str, C.opt(C.Num)], C.Str, {}),
        getValue: C.fun([], C.Str, {}),
        getSelection: C.fun([], _Selection, {}),
        resize: C.fun([C.opt(C.Bool)], C.Any, {}),
        setTheme: C.fun([C.Str], C.Any, {}),
        getTheme: C.fun([], C.Str, {}),
        setStyle: C.fun([C.Str], C.Any, {}),
        unsetStyle: C.fun([], C.Any, {}),
        setFontSize: C.fun([C.Str], C.Any, {}),
        focus: C.fun([], C.Any, {}),
        isFocused: C.fun([], C.Any, {}),
        blur: C.fun([], C.Any, {}),
        onFocus: C.fun([], C.Any, {}),
        onBlur: C.fun([], C.Any, {}),
        onDocumentChange: C.fun([C.Any], C.Any, {}),
        onCursorChange: C.fun([], C.Any, {}),
        getCopyText: C.fun([], C.Str, {}),
        onCopy: C.fun([], C.Any, {}),
        onCut: C.fun([], C.Any, {}),
        onPaste: C.fun([C.Str], C.Any, {}),
        insert: C.fun([C.Str], C.Any, {}),
        setOverwrite: C.fun([C.Bool], C.Any, {}),
        getOverwrite: C.fun([], C.Bool, {}),
        toggleOverwrite: C.fun([], C.Any, {}),
        setScrollSpeed: C.fun([C.Num], C.Any, {}),
        getScrollSpeed: C.fun([], C.Num, {}),
        setDragDelay: C.fun([C.Num], C.Any, {}),
        getDragDelay: C.fun([], C.Num, {}),
        setSelectionStyle: C.fun([C.Str], C.Any, {}),
        getSelectionStyle: C.fun([], C.Str, {}),
        setHighlightActiveLine: C.fun([C.Bool], C.Any, {}),
        getHighlightActiveLine: C.fun([], C.Any, {}),
        setHighlightSelectedWord: C.fun([C.Bool], C.Any, {}),
        getHighlightSelectedWord: C.fun([], C.Bool, {}),
        setShowInvisibles: C.fun([C.Bool], C.Any, {}),
        getShowInvisibles: C.fun([], C.Bool, {}),
        setShowPrintMargin: C.fun([C.Bool], C.Any, {}),
        getShowPrintMargin: C.fun([], C.Bool, {}),
        setPrintMarginColumn: C.fun([C.Num], C.Any, {}),
        getPrintMarginColumn: C.fun([], C.Num, {}),
        setReadOnly: C.fun([C.Bool], C.Any, {}),
        getReadOnly: C.fun([], C.Bool, {}),
        setBehavioursEnabled: C.fun([C.Bool], C.Any, {}),
        getBehavioursEnabled: C.fun([], C.Bool, {}),
        setWrapBehavioursEnabled: C.fun([C.Bool], C.Any, {}),
        getWrapBehavioursEnabled: C.fun([], C.Any, {}),
        setShowFoldWidgets: C.fun([C.Bool], C.Any, {}),
        getShowFoldWidgets: C.fun([], C.Any, {}),
        remove: C.fun([C.Str], C.Any, {}),
        removeWordRight: C.fun([], C.Any, {}),
        removeWordLeft: C.fun([], C.Any, {}),
        removeToLineStart: C.fun([], C.Any, {}),
        removeToLineEnd: C.fun([], C.Any, {}),
        splitLine: C.fun([], C.Any, {}),
        transposeLetters: C.fun([], C.Any, {}),
        toLowerCase: C.fun([], C.Any, {}),
        toUpperCase: C.fun([], C.Any, {}),
        indent: C.fun([], C.Any, {}),
        blockIndent: C.fun([], C.Any, {}),
        blockOutdent: C.fun([C.opt(C.Str)], C.Any, {}),
        toggleCommentLines: C.fun([], C.Any, {}),
        getNumberAt: C.fun([], C.Num, {}),
        modifyNumber: C.fun([C.Num], C.Any, {}),
        removeLines: C.fun([], C.Any, {}),
        moveLinesDown: C.fun([], C.Num, {}),
        moveLinesUp: C.fun([], C.Num, {}),
        moveText: C.fun([_Range, C.Any], _Range, {}),
        copyLinesUp: C.fun([], C.Num, {}),
        copyLinesDown: C.fun([], C.Num, {}),
        getFirstVisibleRow: C.fun([], C.Num, {}),
        getLastVisibleRow: C.fun([], C.Num, {}),
        isRowVisible: C.fun([C.Num], C.Bool, {}),
        isRowFullyVisible: C.fun([C.Num], C.Bool, {}),
        selectPageDown: C.fun([], C.Any, {}),
        selectPageUp: C.fun([], C.Any, {}),
        gotoPageDown: C.fun([], C.Any, {}),
        gotoPageUp: C.fun([], C.Any, {}),
        scrollPageDown: C.fun([], C.Any, {}),
        scrollPageUp: C.fun([], C.Any, {}),
        scrollToRow: C.fun([], C.Any, {}),
        scrollToLine: C.fun([C.Num, C.Bool, C.Bool, C.Fun], C.Any, {}),
        centerSelection: C.fun([], C.Any, {}),
        getCursorPosition: C.fun([], Position, {}),
        getCursorPositionScreen: C.fun([], C.Num, {}),
        getSelectionRange: C.fun([], _Range, {}),
        selectAll: C.fun([], C.Any, {}),
        clearSelection: C.fun([], C.Any, {}),
        moveCursorTo: C.fun([C.Num, C.opt(C.Num), C.opt(C.Bool)], C.Any, {}),
        moveCursorToPosition: C.fun([Position], C.Any, {}),
        jumpToMatching: C.fun([], C.Any, {}),
        gotoLine: C.fun([C.Num, C.opt(C.Num), C.opt(C.Bool)], C.Any, {}),
        navigateTo: C.fun([C.Num, C.Num], C.Any, {}),
        navigateUp: C.fun([C.opt(C.Num)], C.Any, {}),
        navigateDown: C.fun([C.opt(C.Num)], C.Any, {}),
        navigateLeft: C.fun([C.opt(C.Num)], C.Any, {}),
        navigateRight: C.fun([C.Num], C.Any, {}),
        navigateLineStart: C.fun([], C.Any, {}),
        navigateLineEnd: C.fun([], C.Any, {}),
        navigateFileEnd: C.fun([], C.Any, {}),
        navigateFileStart: C.fun([], C.Any, {}),
        navigateWordRight: C.fun([], C.Any, {}),
        navigateWordLeft: C.fun([], C.Any, {}),
        replace: C.fun([C.Str, C.opt(C.Any)], C.Any, {}),
        replaceAll: C.fun([C.Str, C.opt(C.Any)], C.Any, {}),
        getLastSearchOptions: C.fun([], C.Any, {}),
        find: C.fun([C.Str, C.opt(C.Any), C.opt(C.Bool)], C.Any, {}),
        findNext: C.fun([C.opt(C.Any), C.opt(C.Bool)], C.Any, {}),
        findPrevious: C.fun([C.opt(C.Any), C.opt(C.Bool)], C.Any, {}),
        undo: C.fun([], C.Any, {}),
        redo: C.fun([], C.Any, {}),
        destroy: C.fun([], C.Any, {})
    }, {}, "Editor");
    _PlaceHolder = C.object({
        on: C.fun([C.Str, C.fun([], C.Any, {})], C.Any, {}),
        setup: C.fun([], C.Any, {}),
        showOtherMarkers: C.fun([], C.Any, {}),
        hideOtherMarkers: C.fun([], C.Any, {}),
        onUpdate: C.fun([], C.Any, {}),
        onCursorChange: C.fun([], C.Any, {}),
        detach: C.fun([], C.Any, {}),
        cancel: C.fun([], C.Any, {})
    }, {}, "PlaceHolder");
    IRangeList = C.object({
        ranges: C.Arr(_Range),
        pointIndex: C.fun([Position, C.opt(C.Num)], C.Any, {}),
        addList: C.fun([C.Arr(_Range)], C.Any, {}),
        add: C.fun([_Range], C.Any, {}),
        merge: C.fun([], C.Arr(_Range), {}),
        substractPoint: C.fun([Position], C.Any, {})
    }, {}, "IRangeList");
    _Range = C.object({
        startRow: C.Num,
        startColumn: C.Num,
        endRow: C.Num,
        endColumn: C.Num,
        start: Position,
        end: Position,
        isEmpty: C.fun([], C.Bool, {}),
        isEqual: C.fun([C.Self], C.Any, {}),
        toString: C.fun([], C.Any, {}),
        contains: C.fun([C.Num, C.Num], C.Bool, {}),
        compareRange: C.fun([C.Self], C.Num, {}),
        comparePoint: C.fun([C.Self], C.Num, {}),
        containsRange: C.fun([C.Self], C.Bool, {}),
        intersects: C.fun([C.Self], C.Bool, {}),
        isEnd: C.fun([C.Num, C.Num], C.Bool, {}),
        isStart: C.fun([C.Num, C.Num], C.Bool, {}),
        setStart: C.fun([C.Num, C.Num], C.Any, {}),
        setEnd: C.fun([C.Num, C.Num], C.Any, {}),
        inside: C.fun([C.Num, C.Num], C.Bool, {}),
        insideStart: C.fun([C.Num, C.Num], C.Bool, {}),
        insideEnd: C.fun([C.Num, C.Num], C.Bool, {}),
        compare: C.fun([C.Num, C.Num], C.Num, {}),
        compareStart: C.fun([C.Num, C.Num], C.Num, {}),
        compareEnd: C.fun([C.Num, C.Num], C.Num, {}),
        compareInside: C.fun([C.Num, C.Num], C.Num, {}),
        clipRows: C.fun([C.Num, C.Num], C.Self, {}),
        extend: C.fun([C.Num, C.Num], C.Self, {}),
        isMultiLine: C.fun([], C.Bool, {}),
        clone: C.fun([], C.Self, {}),
        collapseRows: C.fun([], C.Self, {}),
        toScreenRange: C.fun([IEditSession], C.Self, {}),
        fromPoints: C.fun([C.Self, C.Self], C.Self, {})
    }, {}, "Range");
    _RenderLoop = C.object({}, {}, "RenderLoop");
    _ScrollBar = C.object({
        onScroll: C.fun([C.Any], C.Any, {}),
        getWidth: C.fun([], C.Num, {}),
        setHeight: C.fun([C.Num], C.Any, {}),
        setInnerHeight: C.fun([C.Num], C.Any, {}),
        setScrollTop: C.fun([C.Num], C.Any, {})
    }, {}, "ScrollBar");
    _Search = C.object({
        set: C.fun([C.Any], C.Self, {}),
        getOptions: C.fun([], C.Any, {}),
        setOptions: C.fun([C.Any], C.Any, {}),
        find: C.fun([IEditSession], _Range, {}),
        findAll: C.fun([IEditSession], C.Arr(_Range), {}),
        replace: C.fun([C.Str, C.Str], C.Str, {})
    }, {}, "Search");
    _Selection = C.object({
        addEventListener: C.fun([C.Str, C.Fun], C.Any, {}),
        moveCursorWordLeft: C.fun([], C.Any, {}),
        moveCursorWordRight: C.fun([], C.Any, {}),
        fromOrientedRange: C.fun([_Range], C.Any, {}),
        setSelectionRange: C.fun([], C.Any, {}),
        getAllRanges: C.fun([], C.Arr(_Range), {}),
        on: C.fun([C.Str, C.fun([], C.Any, {})], C.Any, {}),
        addRange: C.fun([_Range], C.Any, {}),
        isEmpty: C.fun([], C.Bool, {}),
        isMultiLine: C.fun([], C.Bool, {}),
        getCursor: C.fun([], Position, {}),
        setSelectionAnchor: C.fun([C.Num, C.Num], C.Any, {}),
        getSelectionAnchor: C.fun([], C.Any, {}),
        getSelectionLead: C.fun([], C.Any, {}),
        shiftSelection: C.fun([C.Num], C.Any, {}),
        isBackwards: C.fun([], C.Bool, {}),
        getRange: C.fun([], _Range, {}),
        clearSelection: C.fun([], C.Any, {}),
        selectAll: C.fun([], C.Any, {}),
        setRange: C.fun([_Range, C.Bool], C.Any, {}),
        selectTo: C.fun([C.Num, C.Num], C.Any, {}),
        selectToPosition: C.fun([C.Any], C.Any, {}),
        selectUp: C.fun([], C.Any, {}),
        selectDown: C.fun([], C.Any, {}),
        selectRight: C.fun([], C.Any, {}),
        selectLeft: C.fun([], C.Any, {}),
        selectLineStart: C.fun([], C.Any, {}),
        selectLineEnd: C.fun([], C.Any, {}),
        selectFileEnd: C.fun([], C.Any, {}),
        selectFileStart: C.fun([], C.Any, {}),
        selectWordRight: C.fun([], C.Any, {}),
        selectWordLeft: C.fun([], C.Any, {}),
        getWordRange: C.fun([], C.Any, {}),
        selectWord: C.fun([], C.Any, {}),
        selectAWord: C.fun([], C.Any, {}),
        selectLine: C.fun([], C.Any, {}),
        moveCursorUp: C.fun([], C.Any, {}),
        moveCursorDown: C.fun([], C.Any, {}),
        moveCursorLeft: C.fun([], C.Any, {}),
        moveCursorRight: C.fun([], C.Any, {}),
        moveCursorLineStart: C.fun([], C.Any, {}),
        moveCursorLineEnd: C.fun([], C.Any, {}),
        moveCursorFileEnd: C.fun([], C.Any, {}),
        moveCursorFileStart: C.fun([], C.Any, {}),
        moveCursorLongWordRight: C.fun([], C.Any, {}),
        moveCursorLongWordLeft: C.fun([], C.Any, {}),
        moveCursorBy: C.fun([C.Num, C.Num], C.Any, {}),
        moveCursorToPosition: C.fun([C.Any], C.Any, {}),
        moveCursorTo: C.fun([C.Num, C.Num, C.opt(C.Bool)], C.Any, {}),
        moveCursorToScreen: C.fun([C.Num, C.Num, C.Bool], C.Any, {})
    }, {}, "Selection");
    _Split = C.object({
        getSplits: C.fun([], C.Num, {}),
        getEditor: C.fun([C.Num], C.Any, {}),
        getCurrentEditor: C.fun([], _Editor, {}),
        focus: C.fun([], C.Any, {}),
        blur: C.fun([], C.Any, {}),
        setTheme: C.fun([C.Str], C.Any, {}),
        setKeyboardHandler: C.fun([C.Str], C.Any, {}),
        forEach: C.fun([C.Fun, C.Str], C.Any, {}),
        setFontSize: C.fun([C.Num], C.Any, {}),
        setSession: C.fun([IEditSession, C.Num], C.Any, {}),
        getOrientation: C.fun([], C.Num, {}),
        setOrientation: C.fun([C.Num], C.Any, {}),
        resize: C.fun([], C.Any, {})
    }, {}, "Split");
    _TokenIterator = C.object({
        stepBackward: C.fun([], C.Arr(C.Str), {}),
        stepForward: C.fun([], C.Str, {}),
        getCurrentToken: C.fun([], TokenInfo, {}),
        getCurrentTokenRow: C.fun([], C.Num, {}),
        getCurrentTokenColumn: C.fun([], C.Num, {})
    }, {}, "TokenIterator");
    _Tokenizer = C.object({
        getLineTokens: C.fun([], C.Any, {})
    }, {}, "Tokenizer");
    _UndoManager = C.object({
        execute: C.fun([C.Any], C.Any, {}),
        undo: C.fun([C.opt(C.Bool)], _Range, {}),
        redo: C.fun([C.Bool], C.Any, {}),
        reset: C.fun([], C.Any, {}),
        hasUndo: C.fun([], C.Bool, {}),
        hasRedo: C.fun([], C.Bool, {})
    }, {}, "UndoManager");
    _VirtualRenderer = C.object({
        scroller: C.Any,
        characterWidth: C.Num,
        lineHeight: C.Num,
        screenToTextCoordinates: C.fun([C.Num, C.Num], C.Any, {}),
        setSession: C.fun([IEditSession], C.Any, {}),
        updateLines: C.fun([C.Num, C.Num], C.Any, {}),
        updateText: C.fun([], C.Any, {}),
        updateFull: C.fun([C.Bool], C.Any, {}),
        updateFontSize: C.fun([], C.Any, {}),
        onResize: C.fun([C.Bool, C.Num, C.Num, C.Num], C.Any, {}),
        adjustWrapLimit: C.fun([], C.Any, {}),
        setAnimatedScroll: C.fun([C.Bool], C.Any, {}),
        getAnimatedScroll: C.fun([], C.Bool, {}),
        setShowInvisibles: C.fun([C.Bool], C.Any, {}),
        getShowInvisibles: C.fun([], C.Bool, {}),
        setShowPrintMargin: C.fun([C.Bool], C.Any, {}),
        getShowPrintMargin: C.fun([], C.Bool, {}),
        setPrintMarginColumn: C.fun([C.Bool], C.Any, {}),
        getPrintMarginColumn: C.fun([], C.Bool, {}),
        getShowGutter: C.fun([], C.Bool, {}),
        setShowGutter: C.fun([C.Bool], C.Any, {}),
        getContainerElement: C.fun([], C.Any, {}),
        getMouseEventTarget: C.fun([], C.Any, {}),
        getTextAreaContainer: C.fun([], C.Any, {}),
        getFirstVisibleRow: C.fun([], C.Num, {}),
        getFirstFullyVisibleRow: C.fun([], C.Num, {}),
        getLastFullyVisibleRow: C.fun([], C.Num, {}),
        getLastVisibleRow: C.fun([], C.Num, {}),
        setPadding: C.fun([C.Num], C.Any, {}),
        getHScrollBarAlwaysVisible: C.fun([], C.Bool, {}),
        setHScrollBarAlwaysVisible: C.fun([C.Bool], C.Any, {}),
        updateFrontMarkers: C.fun([], C.Any, {}),
        updateBackMarkers: C.fun([], C.Any, {}),
        addGutterDecoration: C.fun([], C.Any, {}),
        removeGutterDecoration: C.fun([], C.Any, {}),
        updateBreakpoints: C.fun([], C.Any, {}),
        setAnnotations: C.fun([C.Arr(C.Any)], C.Any, {}),
        updateCursor: C.fun([], C.Any, {}),
        hideCursor: C.fun([], C.Any, {}),
        showCursor: C.fun([], C.Any, {}),
        scrollCursorIntoView: C.fun([], C.Any, {}),
        getScrollTop: C.fun([], C.Num, {}),
        getScrollLeft: C.fun([], C.Num, {}),
        getScrollTopRow: C.fun([], C.Num, {}),
        getScrollBottomRow: C.fun([], C.Num, {}),
        scrollToRow: C.fun([C.Num], C.Any, {}),
        scrollToLine: C.fun([C.Num, C.Bool, C.Bool, C.Fun], C.Any, {}),
        scrollToY: C.fun([C.Num], C.Num, {}),
        scrollToX: C.fun([C.Num], C.Num, {}),
        scrollBy: C.fun([C.Num, C.Num], C.Any, {}),
        isScrollableBy: C.fun([C.Num, C.Num], C.Bool, {}),
        textToScreenCoordinates: C.fun([C.Num, C.Num], C.Any, {}),
        visualizeFocus: C.fun([], C.Any, {}),
        visualizeBlur: C.fun([], C.Any, {}),
        showComposition: C.fun([C.Num], C.Any, {}),
        setCompositionText: C.fun([C.Str], C.Any, {}),
        hideComposition: C.fun([], C.Any, {}),
        setTheme: C.fun([C.Str], C.Any, {}),
        getTheme: C.fun([], C.Str, {}),
        setStyle: C.fun([C.Str], C.Any, {}),
        unsetStyle: C.fun([C.Str], C.Any, {}),
        destroy: C.fun([], C.Any, {})
    }, {}, "VirtualRenderer");
    AceAjax = C.object({
        KeyBinding: C.and(C.fun([_Editor], _KeyBinding, {}), C.object({}, {})),
        Anchor: C.and(C.fun([_Document, C.Num, C.Num], _Anchor, {}), C.object({}, {})),
        BackgroundTokenizer: C.and(C.fun([_Tokenizer, _Editor], _BackgroundTokenizer, {}), C.object({}, {})),
        Document: C.and(C.overload_fun(C.fun([C.opt(C.Str)], _Document, {}), C.fun([C.opt(C.Arr(C.Str))], _Document, {})), C.object({}, {})),
        EditSession: C.and(C.overload_fun(C.fun([C.Str, C.opt(TextMode)], IEditSession, {}), C.fun([C.Str, C.opt(C.Str)], IEditSession, {}), C.fun([C.Arr(C.Str), C.opt(C.Str)], IEditSession, {})), C.object({}, {})),
        Editor: C.and(C.fun([_VirtualRenderer, C.opt(IEditSession)], _Editor, {}), C.object({}, {})),
        PlaceHolder: C.and(C.overload_fun(C.fun([_Document, C.Num, C.Num, C.Str, C.Str, C.Str], _PlaceHolder, {}), C.fun([IEditSession, C.Num, Position, C.Arr(Position)], _PlaceHolder, {})), C.object({}, {})),
        RangeList: C.and(C.fun([], IRangeList, {}), C.object({}, {})),
        Range: C.and(C.fun([C.Num, C.Num, C.Num, C.Num], _Range, {}), C.object({
            fromPoints: C.fun([Position, Position], _Range, {})
        }, {})),
        RenderLoop: C.and(C.fun([], _RenderLoop, {}), C.object({}, {})),
        ScrollBar: C.and(C.fun([C.Any], _ScrollBar, {}), C.object({}, {})),
        Search: C.and(C.fun([], _Search, {}), C.object({}, {})),
        Selection: C.and(C.fun([IEditSession], _Selection, {}), C.object({}, {})),
        Split: C.and(C.fun([], _Split, {}), C.object({}, {})),
        TokenIterator: C.and(C.fun([IEditSession, C.Num, C.Num], _TokenIterator, {}), C.object({}, {})),
        Tokenizer: C.and(C.fun([C.Any, C.Str], _Tokenizer, {}), C.object({}, {})),
        UndoManager: C.and(C.fun([], _UndoManager, {}), C.object({}, {})),
        VirtualRenderer: C.and(C.fun([C.Any, C.opt(C.Str)], _VirtualRenderer, {}), C.object({}, {}))
    }, {
        "forgiving": true
    }, "AceAjax");

    exports = C.guard(AceAjax, ace, "ace");
    C.setExported(exports, 'ace');
    return exports;
});