//src: items.ts

export interface Items {
    parameters: Parameter[];
}

export interface Parameter {
    key: string;
    label?: string;
    type: string;
    default: any;
    options?: { label: string; value: string }[];
}

export const items: Record<string, Items> = {
    Button: {
        parameters: [
            { key: 'caption', type: 'text', default: 'Click me!' },
            { key: 'confirm', type: 'text', default: '' },
            { key: 'download', type: 'text', default: '' },
            { key: 'enabled', type: 'checkbox', default: true },
            { key: 'link', type: 'checkbox', default: false },
            { key: 'name', type: 'text', default: '' },
            { key: 'onClick', type: 'text', default: '[echo(\'script code\');]' },
            { key: 'visible', type: 'checkbox', default: true },
            { key: 'width', type: 'text', default: '' }
        ]
    },
    CheckBox: {
        parameters: [
            { key: 'caption', type: 'text', default: 'Check me!' },
            { key: 'download', type: 'text', default: '' },
            { key: 'enabled', type: 'checkbox', default: true },
            { key: 'link', type: 'checkbox', default: false },
            { key: 'name', type: 'text', default: '' },
            { key: 'onChange', type: 'text', default: '[echo(\'script code\');]' },
            { key: 'value', type: 'checkbox', default: false },
            { key: 'visible', type: 'checkbox', default: true },
            { key: 'width', type: 'text', default: '' }
        ]
    },
    ColumnLayout: {
        parameters: [
            { key: 'name', type: 'text', default: '' },
            { key: 'items', type: 'dropdown', default: 'None', options: [{ label: 'None', value: 'none' }, { label: 'Examples', value: 'items' }] },
            { key: 'visible', type: 'checkbox', default: true }
        ]
    },
    Configurator: {
        parameters: [
            { key: 'caption', type: 'text', default: 'Configuration' },
            { key: 'columns', type: 'dropdown', default: 'No', options: [{ label: 'No', value: 'no' }, { label: 'Yes', value: 'yes' }, { label: 'Examples', value: 'columns' }] },
            { key: 'discoveryInterval', type: 'text', default: '0' },
            { key: 'delete', type: 'checkbox', default: false },
            { key: 'name', type: 'text', default: '' },
            { key: 'onExpand', type: 'text', default: '[echo(\'script code\');]' },
            { key: 'rowCount', type: 'text', default: '0' },
            { key: 'sort', type: 'dropdown', default: 'No', options: [{ label: 'No', value: 'no' }, { label: 'Yes', value: 'yes' }] },
            { key: 'values', type: 'dropdown', default: 'No', options: [{ label: 'No', value: 'no' }, { label: 'Yes', value: 'yes' }, { label: 'Examples', value: 'values' }] },
            { key: 'visible', type: 'checkbox', default: true }
        ]
    },
    ExpansionPanel: {
        parameters: [
            { key: 'caption', type: 'text', default: 'Expand me!' },
            { key: 'download', type: 'text', default: '' },
            { key: 'expanded', type: 'checkbox', default: false },
            { key: 'items', type: 'dropdown', default: 'None', options: [{ label: 'None', value: 'none' }, { label: 'Examples', value: 'items' }] },
            { key: 'link', type: 'checkbox', default: false },
            { key: 'name', type: 'text', default: '' },
            { key: 'onClick', type: 'text', default: '' },
            { key: 'visible', type: 'checkbox', default: true },
            { key: 'width', type: 'text', default: '' }
        ]
    },
    HorizontalSlider: {
        parameters: [
            { key: 'caption', type: 'text', default: 'Describe me!' },
            { key: 'download', type: 'text', default: '' },
            { key: 'enabled', type: 'checkbox', default: true },
            { key: 'link', type: 'checkbox', default: false },
            { key: 'maximum', type: 'text', default: '100' },
            { key: 'minimum', type: 'text', default: '0' },
            { key: 'name', type: 'text', default: '' },
            { key: 'onChange', type: 'text', default: '' },
            { key: 'stepSize', type: 'text', default: '1' },
            { key: 'value', type: 'text', default: '0' },
            { key: 'visible', type: 'checkbox', default: true },
            { key: 'width', type: 'text', default: '300px' }
        ]
    },
    Image: {
        parameters: [
            { key: 'center', type: 'checkbox', default: false },
            { key: 'download', type: 'text', default: '' },
            { key: 'image', type: 'text', default: 'data:[<mime type>][;charset=<Zeichensatz>][;base64],<Daten>' },
            { key: 'link', type: 'checkbox', default: false },
            { key: 'mediaID', type: 'dropdown', default: 'No', options: [{ label: 'No', value: 'no' }, { label: 'Yes', value: 'yes' }] },
            { key: 'name', type: 'text', default: '' },
            { key: 'onClick', type: 'text', default: '' },
            { key: 'visible', type: 'checkbox', default: true },
            { key: 'width', type: 'text', default: '300px' }
        ]
    },
    Label: {
        parameters: [
            { key: 'bold', type: 'checkbox', default: false },
            { key: 'caption', type: 'text', default: 'Label me!' },
            { key: 'color', type: 'text', default: '0' },
            { key: 'italic', type: 'checkbox', default: false },
            { key: 'link', type: 'checkbox', default: true },
            { key: 'name', type: 'text', default: '' },
            { key: 'underline', type: 'checkbox', default: false },
            { key: 'visible', type: 'checkbox', default: true },
            { key: 'width', type: 'text', default: '' }
        ]
    },
    List: {
        parameters: [
            { key: 'add', type: 'checkbox', default: false },
            { key: 'caption', type: 'text', default: 'List me!' },
            { key: 'changeOrder', type: 'checkbox', default: false },
            { key: 'columns', type: 'dropdown', default: 'No', options: [{ label: 'No', value: 'no' }, { label: 'Yes', value: 'yes' }, { label: 'Examples', value: 'columns' }] },
            { key: 'delete', type: 'checkbox', default: false },
            { key: 'download', type: 'text', default: '' },
            { key: 'enabled', type: 'checkbox', default: true },
            { key: 'form', type: 'text', default: '' },
            { key: 'link', type: 'checkbox', default: false },
            { key: 'loadValuesFromConfiguration', type: 'checkbox', default: true },
            { key: 'name', type: 'text', default: '' },
            { key: 'onAdd', type: 'text', default: '' },
            { key: 'onChangeOrder', type: 'text', default: '' },
            { key: 'onDelete', type: 'text', default: '' },
            { key: 'onEdit', type: 'text', default: '' },
            { key: 'rowCount', type: 'text', default: '0' },
            { key: 'sort', type: 'dropdown', default: 'No', options: [{ label: 'No', value: 'no' }, { label: 'Yes', value: 'yes' }] },
            { key: 'values', type: 'dropdown', default: 'No', options: [{ label: 'No', value: 'no' }, { label: 'Yes', value: 'yes' }, { label: 'Examples', value: 'values' }] },
            { key: 'visible', type: 'checkbox', default: true }
        ]
    },
    NumberSpinner: {
        parameters: [
            { key: 'caption', type: 'text', default: 'Count me!' },
            { key: 'digits', type: 'text', default: '0' },
            { key: 'enabled', type: 'checkbox', default: true },
            { key: 'hex', type: 'checkbox', default: false },
            { key: 'maximum', type: 'dropdown', default: 'No', options: [{ label: 'No', value: 'no' }, { label: 'Yes', value: 'yes' }] },
            { key: 'minimum', type: 'dropdown', default: 'No', options: [{ label: 'No', value: 'no' }, { label: 'Yes', value: 'yes' }] },
            { key: 'moreDigits', type: 'checkbox', default: false },
            { key: 'name', type: 'text', default: '' },
            { key: 'onChange', type: 'text', default: '' },
            { key: 'suffix', type: 'text', default: '' },
            { key: 'value', type: 'text', default: '0' },
            { key: 'visible', type: 'checkbox', default: true },
            { key: 'width', type: 'text', default: '300px' }
        ]
    },
    OpenObjectButton: {
        parameters: [
            { key: 'caption', type: 'text', default: 'Click me!' },
            { key: 'enabled', type: 'checkbox', default: true },
            { key: 'name', type: 'text', default: '' },
            { key: 'objectID', type: 'text', default: '0' },
            { key: 'visible', type: 'checkbox', default: true },
            { key: 'width', type: 'text', default: '' }
        ]
    },
    PasswordTextBox: {
        parameters: [
            { key: 'caption', type: 'text', default: 'Crypt me!' },
            { key: 'enabled', type: 'checkbox', default: true },
            { key: 'name', type: 'text', default: '' },
            { key: 'onChange', type: 'text', default: '' },
            { key: 'validate', type: 'text', default: '' },
            { key: 'value', type: 'text', default: '' },
            { key: 'visible', type: 'checkbox', default: true },
            { key: 'width', type: 'text', default: '300px' }
        ]
    },
    PopupAlert: {
        parameters: [
            { key: 'name', type: 'text', default: '' },
            { key: 'popup', type: 'dropdown', default: 'Items', options: [{ label: 'Items', value: 'items' }, { label: 'Buttons & Items', value: 'buttons' }, { label: 'Close Caption & Items', value: 'close' }, { label: 'All Parmeters', value: 'popup' }] },
            { key: 'visible', type: 'checkbox', default: true }
        ]
    },
    PopupButton: {
        parameters: [
            { key: 'caption', type: 'text', default: 'Pop me up!' },
            { key: 'download', type: 'text', default: '' },
            { key: 'enabled', type: 'checkbox', default: true },
            { key: 'link', type: 'checkbox', default: false },
            { key: 'name', type: 'text', default: '' },
            { key: 'onClick', type: 'text', default: '[echo(\'script code\');]' },
            { key: 'popup', type: 'dropdown', default: 'Items', options: [{ label: 'Items', value: 'items' }, { label: 'Buttons & Items', value: 'buttons' }, { label: 'Caption & Items', value: 'caption' }, { label: 'All Parmeters', value: 'popup' }] },
            { key: 'visible', type: 'checkbox', default: true },
            { key: 'width', type: 'text', default: '' }
        ]
    },
    ProgressBar: {
        parameters: [
            { key: 'caption', type: 'text', default: 'Count me!' },
            { key: 'current', type: 'text', default: '0' },
            { key: 'indeterminate', type: 'checkbox', default: false },
            { key: 'enabled', type: 'checkbox', default: true },
            { key: 'maximum', type: 'text', default: '100' },
            { key: 'minimum', type: 'text', default: '0' },
            { key: 'name', type: 'text', default: '' },
            { key: 'visible', type: 'checkbox', default: true },
            { key: 'width', type: 'text', default: '300px' }
        ]
    },
    QrCode: {
        parameters: [
            { key: 'caption', type: 'text', default: 'Picture me!' },
            { key: 'center', type: 'checkbox', default: false },
            { key: 'description', type: 'checkbox', default: true },
            { key: 'name', type: 'text', default: '' },
            { key: 'source', type: 'text', default: 'qr-code' },
            { key: 'visible', type: 'checkbox', default: true }
        ]
    },
    RowLayout: {
        parameters: [
            { key: 'name', type: 'text', default: '' },
            { key: 'items', type: 'dropdown', default: 'None', options: [{ label: 'None', value: 'none' }, { label: 'Examples', value: 'items' }] },
            { key: 'visible', type: 'checkbox', default: true }
        ]
    },
    ScriptEditor: {
        parameters: [
            { key: 'caption', type: 'text', default: 'Script me!' },
            { key: 'enabled', type: 'checkbox', default: true },
            { key: 'name', type: 'text', default: '' },
            { key: 'rowCount', type: 'text', default: '5' },
            { key: 'value', type: 'text', default: '' },
            { key: 'visible', type: 'checkbox', default: true },
            { key: 'width', type: 'text', default: '100%' }
        ]
    },
    Select: {
        parameters: [
            { key: 'caption', type: 'text', default: 'Select me!' },
            { key: 'download', type: 'text', default: '' },
            { key: 'enabled', type: 'checkbox', default: true },
            { key: 'link', type: 'checkbox', default: false },
            { key: 'name', type: 'text', default: '' },
            { key: 'options', type: 'dropdown', default: 'Examples', options: [{ label: 'None', value: 'none' }, { label: 'Examples', value: 'options' }] },
            { key: 'onChange', type: 'text', default: '' },
            { key: 'value', type: 'text', default: '' },
            { key: 'visible', type: 'checkbox', default: true },
            { key: 'width', type: 'text', default: '300px' }
        ]
    },
    SelectAction: {
        parameters: [
            { key: 'caption', type: 'text', default: 'Select me!' },
            { key: 'enabled', type: 'checkbox', default: true },
            { key: 'environment', type: 'text', default: 'Default' },
            { key: 'highestPriorityOnly', type: 'checkbox', default: false },
            { key: 'includeDefaultEnvironment', type: 'checkbox', default: true },
            { key: 'name', type: 'text', default: '' },
            { key: 'saveTarget ', type: 'checkbox', default: true },
            { key: 'saveEnvironment', type: 'checkbox', default: true },
            { key: 'saveParent', type: 'checkbox', default: true },
            { key: 'targetID', type: 'text', default: '-2' },
            { key: 'value', type: 'text', default: '' },
            { key: 'visible', type: 'checkbox', default: true },
            { key: 'width', type: 'text', default: '300px' }
        ]
    },
    SelectCategory: {
        parameters: [
            { key: 'caption', type: 'text', default: 'Select me!' },
            { key: 'download', type: 'text', default: '' },
            { key: 'enabled', type: 'checkbox', default: true },
            { key: 'link', type: 'checkbox', default: false },
            { key: 'name', type: 'text', default: '' },
            { key: 'onChange', type: 'text', default: '' },
            { key: 'value', type: 'text', default: '0' },
            { key: 'visible', type: 'checkbox', default: true },
            { key: 'width', type: 'text', default: '300px' }
        ]
    },
    SelectColor: {
        parameters: [
            { key: 'allowTransparent', type: 'checkbox', default: true },
            { key: 'caption', type: 'text', default: 'Select me!' },
            { key: 'download', type: 'text', default: '' },
            { key: 'enabled', type: 'checkbox', default: true },
            { key: 'link', type: 'checkbox', default: false },
            { key: 'name', type: 'text', default: '' },
            { key: 'onChange', type: 'text', default: '' },
            { key: 'value', type: 'text', default: '-1' },
            { key: 'visible', type: 'checkbox', default: true },
            { key: 'width', type: 'text', default: '300px' }
        ]
    },
    SelectCondition: {
        parameters: [
            { key: 'caption', type: 'text', default: 'Select me!' },
            { key: 'enabled', type: 'checkbox', default: true },
            { key: 'multi', type: 'checkbox', default: false },
            { key: 'name', type: 'text', default: '' },
            { key: 'onChange', type: 'text', default: '' },
            { key: 'value', type: 'text', default: '' },
            { key: 'visible', type: 'checkbox', default: true },
            { key: 'width', type: 'text', default: '300px' }
        ]
    },
    SelectDate: {
        parameters: [
            { key: 'caption', type: 'text', default: 'Select me!' },
            { key: 'enabled', type: 'checkbox', default: true },
            { key: 'name', type: 'text', default: '' },
            { key: 'value', type: 'text', default: '' },
            { key: 'visible', type: 'checkbox', default: true },
            { key: 'width', type: 'text', default: '300px' }
        ]
    },
    SelectDateTime: {
        parameters: [
            { key: 'caption', type: 'text', default: 'Select me!' },
            { key: 'enabled', type: 'checkbox', default: true },
            { key: 'name', type: 'text', default: '' },
            { key: 'value', type: 'text', default: '' },
            { key: 'visible', type: 'checkbox', default: true },
            { key: 'width', type: 'text', default: '300px' }
        ]
    },
    SelectEvent: {
        parameters: [
            { key: 'caption', type: 'text', default: 'Select me!' },
            { key: 'download', type: 'text', default: '' },
            { key: 'enabled', type: 'checkbox', default: true },
            { key: 'link', type: 'checkbox', default: false },
            { key: 'name', type: 'text', default: '' },
            { key: 'onChange', type: 'text', default: '' },
            { key: 'value', type: 'text', default: '0' },
            { key: 'visible', type: 'checkbox', default: true },
            { key: 'width', type: 'text', default: '300px' }
        ]
    },
    SelectFile: {
        parameters: [
            { key: 'caption', type: 'text', default: 'Select me!' },
            { key: 'download', type: 'text', default: '' },
            { key: 'enabled', type: 'checkbox', default: true },
            { key: 'extensions', type: 'text', default: '.jpg,.gif,.txt' },
            { key: 'link', type: 'checkbox', default: false },
            { key: 'name', type: 'text', default: '' },
            { key: 'onChange', type: 'text', default: '' },
            { key: 'value', type: 'text', default: '0' },
            { key: 'visible', type: 'checkbox', default: true },
            { key: 'width', type: 'text', default: '300px' }
        ]
    },
    SelectIcon: {
        parameters: [
            { key: 'caption', type: 'text', default: 'Select me!' },
            { key: 'download', type: 'text', default: '' },
            { key: 'enabled', type: 'checkbox', default: true },
            { key: 'link', type: 'checkbox', default: false },
            { key: 'name', type: 'text', default: '' },
            { key: 'onChange', type: 'text', default: '' },
            { key: 'value', type: 'text', default: '' },
            { key: 'visible', type: 'checkbox', default: true },
            { key: 'width', type: 'text', default: '300px' }
        ]
    },
    SelectInstance: {
        parameters: [
            { key: 'caption', type: 'text', default: 'Select me!' },
            { key: 'download', type: 'text', default: '' },
            { key: 'enabled', type: 'checkbox', default: true },
            { key: 'link', type: 'checkbox', default: false },
            { key: 'name', type: 'text', default: '' },
            { key: 'onChange', type: 'text', default: '' },
            { key: 'validModules', type: 'text', default: '[]' },
            { key: 'value', type: 'text', default: '0' },
            { key: 'visible', type: 'checkbox', default: true },
            { key: 'width', type: 'text', default: '300px' }
        ]
    },
    SelectLink: {
        parameters: [
            { key: 'caption', type: 'text', default: 'Select me!' },
            { key: 'download', type: 'text', default: '' },
            { key: 'enabled', type: 'checkbox', default: true },
            { key: 'link', type: 'checkbox', default: false },
            { key: 'name', type: 'text', default: '' },
            { key: 'onChange', type: 'text', default: '' },
            { key: 'value', type: 'text', default: '0' },
            { key: 'visible', type: 'checkbox', default: true },
            { key: 'width', type: 'text', default: '300px' }
        ]
    },
    SelectLocation: {
        parameters: [
            { key: 'caption', type: 'text', default: 'Select me!' },
            { key: 'enabled', type: 'checkbox', default: true },
            { key: 'name', type: 'text', default: '' },
            { key: 'value', type: 'text', default: '' },
            { key: 'visible', type: 'checkbox', default: true },
            { key: 'width', type: 'text', default: '300px' }
        ]
    },
    SelectMedia: {
        parameters: [
            { key: 'caption', type: 'text', default: 'Select me!' },
            { key: 'download', type: 'text', default: '' },
            { key: 'enabled', type: 'checkbox', default: true },
            { key: 'link', type: 'checkbox', default: false },
            { key: 'name', type: 'text', default: '' },
            { key: 'onChange', type: 'text', default: '' },
            { key: 'value', type: 'text', default: '0' },
            { key: 'visible', type: 'checkbox', default: true },
            { key: 'width', type: 'text', default: '300px' }
        ]
    },
    SelectModule: {
        parameters: [
            { key: 'caption', type: 'text', default: 'Select me!' },
            { key: 'download', type: 'text', default: '' },
            { key: 'enabled', type: 'checkbox', default: true },
            { key: 'link', type: 'checkbox', default: false },
            { key: 'moduleID', type: 'text', default: '' },
            { key: 'name', type: 'text', default: '' },
            { key: 'onChange', type: 'text', default: '' },
            { key: 'value', type: 'text', default: '0' },
            { key: 'visible', type: 'checkbox', default: true },
            { key: 'width', type: 'text', default: '300px' }
        ]
    },
    SelectObject: {
        parameters: [
            { key: 'caption', type: 'text', default: 'Select me!' },
            { key: 'download', type: 'text', default: '' },
            { key: 'enabled', type: 'checkbox', default: true },
            { key: 'link', type: 'checkbox', default: false },
            { key: 'name', type: 'text', default: '' },
            { key: 'onChange', type: 'text', default: '' },
            { key: 'value', type: 'text', default: '0' },
            { key: 'visible', type: 'checkbox', default: true },
            { key: 'width', type: 'text', default: '300px' }
        ]
    },
    SelectProfile: {
        parameters: [
            { key: 'caption', type: 'text', default: 'Select me!' },
            { key: 'download', type: 'text', default: '' },
            { key: 'enabled', type: 'checkbox', default: true },
            { key: 'link', type: 'checkbox', default: false },
            { key: 'name', type: 'text', default: '' },
            { key: 'onChange', type: 'text', default: '' },
            { key: 'profileType', type: 'text', default: '-1' },
            { key: 'value', type: 'text', default: '' },
            { key: 'visible', type: 'checkbox', default: true },
            { key: 'width', type: 'text', default: '300px' }
        ]
    },
    SelectScript: {
        parameters: [
            { key: 'caption', type: 'text', default: 'Select me!' },
            { key: 'download', type: 'text', default: '' },
            { key: 'enabled', type: 'checkbox', default: true },
            { key: 'link', type: 'checkbox', default: false },
            { key: 'name', type: 'text', default: '' },
            { key: 'onChange', type: 'text', default: '' },
            { key: 'value', type: 'text', default: '0' },
            { key: 'visible', type: 'checkbox', default: true },
            { key: 'width', type: 'text', default: '300px' }
        ]
    },
    SelectTime: {
        parameters: [
            { key: 'caption', type: 'text', default: 'Select me!' },
            { key: 'enabled', type: 'checkbox', default: true },
            { key: 'name', type: 'text', default: '' },
            { key: 'value', type: 'text', default: '' },
            { key: 'visible', type: 'checkbox', default: true },
            { key: 'width', type: 'text', default: '300px' }
        ]
    },
    SelectValue: {
        parameters: [
            { key: 'caption', type: 'text', default: 'Select me!' },
            { key: 'enabled', type: 'checkbox', default: true },
            { key: 'name', type: 'text', default: '' },
            { key: 'onChange', type: 'text', default: '' },
            { key: 'value', type: 'text', default: 'null' },
            { key: 'visible', type: 'checkbox', default: true },
            { key: 'variableID', type: 'text', default: '' },
            { key: 'width', type: 'text', default: '300px' }
        ]
    },
    SelectVariable: {
        parameters: [
            { key: 'caption', type: 'text', default: 'Select me!' },
            { key: 'download', type: 'text', default: '' },
            { key: 'enabled', type: 'checkbox', default: true },
            { key: 'link', type: 'checkbox', default: false },
            { key: 'name', type: 'text', default: '' },
            { key: 'onChange', type: 'text', default: '' },
            { key: 'requiredAction', type: 'dropdown', default: 'Any (0)', options: [{ label: 'Any (0)', value: '0' }, { label: 'With Action (1)', value: '1' }, { label: 'No Action (2)', value: '2' }] },
            { key: 'requiredLogging', type: 'dropdown', default: 'Any (0)', options: [{ label: 'Any (0)', value: '0' }, { label: 'Logged (1)', value: '1' }, { label: 'Not Logged (2)', value: '2' }, { label: 'Standard Logging (3)', value: '3' }, { label: 'Counter Logging (4)', value: '4' }] },
            { key: 'validVariableTypes', type: 'text', default: '[]' },
            { key: 'value', type: 'text', default: '0' },
            { key: 'visible', type: 'checkbox', default: true },
            { key: 'width', type: 'text', default: '300px' }
        ]
    },
    StatusMessage: {
        parameters: [
            { key: 'caption', type: 'text', default: 'State me!' },
            { key: 'code', type: 'dropdown', default: 'Instance is creating (101)', options: [{ label: 'Instance is creating (101)', value: '101' }, { label: 'Instance is active (102)', value: '102' }, { label: 'Instance is deleting (103)', value: '103' }, { label: 'Instance is inactive (104)', value: '104' }, { label: 'Instance was not created (105)', value: '105' }, { label: 'Instance is faulty (>=200)', value: '200' }] },
            { key: 'icon', type: 'dropdown', default: 'Active', options: [{ label: 'Active', value: 'active' }, { label: 'Error', value: 'error' }, { label: 'Inactive', value: 'inactive' }] }
        ]
    },
    TestCenter: {
        parameters: [
            { key: 'caption', type: 'text', default: 'Select me!' },
            { key: 'enabled', type: 'checkbox', default: true },
            { key: 'name', type: 'text', default: '' },
            { key: 'visible', type: 'checkbox', default: true }
        ]
    },
    Tree: {
        parameters: [
            { key: 'add', type: 'checkbox', default: false },
            { key: 'caption', type: 'text', default: 'Tree me!' },
            { key: 'changeOrder', type: 'checkbox', default: false },
            { key: 'columns', type: 'dropdown', default: 'No', options: [{ label: 'No', value: 'no' }, { label: 'Yes', value: 'yes' }, { label: 'Examples', value: 'columns' }] },
            { key: 'delete', type: 'checkbox', default: false },
            { key: 'download', type: 'text', default: '' },
            { key: 'enabled', type: 'checkbox', default: true },
            { key: 'form', type: 'text', default: '' },
            { key: 'link', type: 'checkbox', default: false },
            { key: 'loadValuesFromConfiguration', type: 'checkbox', default: true },
            { key: 'name', type: 'text', default: '' },
            { key: 'onAdd', type: 'text', default: '' },
            { key: 'onDelete', type: 'text', default: '' },
            { key: 'onEdit', type: 'text', default: '' },
            { key: 'onExpand', type: 'text', default: '' },
            { key: 'rowCount', type: 'text', default: '0' },
            { key: 'sort', type: 'dropdown', default: 'No', options: [{ label: 'No', value: 'no' }, { label: 'Yes', value: 'yes' }] },
            { key: 'values', type: 'dropdown', default: 'No', options: [{ label: 'No', value: 'no' }, { label: 'Yes', value: 'yes' }, { label: 'Examples', value: 'values' }] },
            { key: 'visible', type: 'checkbox', default: true }
        ]
    },
    ValidationTextBox: {
        parameters: [
            { key: 'caption', type: 'text', default: 'Select me!' },
            { key: 'enabled', type: 'checkbox', default: true },
            { key: 'multiline', type: 'checkbox', default: false },
            { key: 'name', type: 'text', default: '' },
            { key: 'onChange', type: 'text', default: '' },
            { key: 'validate', type: 'text', default: '' },
            { key: 'value', type: 'text', default: '0' },
            { key: 'visible', type: 'checkbox', default: true },
            { key: 'width', type: 'text', default: '300px' }
        ]
    }
};
